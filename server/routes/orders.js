import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
<<<<<<< HEAD
import Order from '../models/Order.js';

// GET all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET order by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE new order
router.post('/', async (req, res) => {
    try {
        const {
            customerInfo,
            items,
            totalAmount,
            notes
        } = req.body;

        // Validate required fields
        if (!customerInfo || !items || !totalAmount) {
            return res.status(400).json({ 
                message: 'Customer info, items, and total amount are required' 
            });
        }

        // Calculate total amount from items
        let calculatedTotal = 0;
        items.forEach(item => {
            item.total = item.quantity * item.price;
            calculatedTotal += item.total;
        });

        const order = new Order({
            customerInfo,
            items,
            totalAmount: calculatedTotal,
            notes
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE order
router.put('/:id', async (req, res) => {
    try {
        const {
            customerInfo,
            items,
            totalAmount,
            status,
            paymentStatus,
            deliveryDate,
            notes
        } = req.body;

        // Calculate total if items are provided
        let calculatedTotal = totalAmount;
        if (items) {
            calculatedTotal = 0;
            items.forEach(item => {
                item.total = item.quantity * item.price;
                calculatedTotal += item.total;
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                customerInfo,
                items,
                totalAmount: calculatedTotal,
                status,
                paymentStatus,
                deliveryDate,
                notes
            },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET orders by status
router.get('/status/:status', async (req, res) => {
    try {
        const orders = await Order.find({ status: req.params.status }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
=======

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.orderStatus = status;
    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build aggregation pipeline for search
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ['$userDetails.fullName', 0] },
          customerEmail: { $arrayElemAt: ['$userDetails.email', 0] }
        }
      }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { orderId: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add filter conditions
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { orderDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const orders = await Order.aggregate(pipeline);
    
    // Get total count for pagination
    const totalCountPipeline = [...pipeline];
    totalCountPipeline.splice(-2, 2); // Remove skip and limit
    totalCountPipeline.push({ $count: 'total' });
    const totalCountResult = await Order.aggregate(totalCountPipeline);
    const totalOrders = totalCountResult[0]?.total || 0;

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit: parseInt(limit)
      },
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin or Order Owner
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('items.productId', 'name description imageUrl category sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is admin or order owner
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    // Update order
    order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    
    // Set actual delivery date if status is delivered
    if (orderStatus === 'Delivered') {
      order.actualDelivery = new Date();
    }

    // Update inventory if order is cancelled
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { product: item.productId },
          { $inc: { stockLevel: item.quantity } }
        );
      }
    }

    await order.save();
    
    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'fullName email phone')
      .populate('items.productId', 'name description imageUrl');

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Restore inventory if order was processing
    if (order.orderStatus === 'Processing') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { product: item.productId },
          { $inc: { stockLevel: item.quantity } }
        );
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
});

// @desc    Get order analytics
// @route   GET /api/orders/analytics/summary
// @access  Private/Admin
router.get('/analytics/summary', protect, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: { orderDate: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        dailyAnalytics: analytics,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics',
      error: error.message
    });
  }
});

// @desc    Create new order (for testing purposes or admin)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      shippingCost = 0,
      tax = 0,
      discount = 0,
      couponCode,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // Check inventory
      const inventory = await Inventory.findOne({ product: item.productId });
      if (!inventory || inventory.stockLevel < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        image: product.imageUrl,
        sku: product.sku
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      tax,
      shippingCost,
      discount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentId,
      couponCode,
      notes,
      ipAddress: req.ip
    });

    await order.save();

    // Update inventory
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.productId },
        { $inc: { stockLevel: -item.quantity } }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'fullName email phone')
      .populate('items.productId', 'name description imageUrl');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

export default router;
>>>>>>> 2ea1a0e48f5027ef2d66d3b71f6b60a587c60672
