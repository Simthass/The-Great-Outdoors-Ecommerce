import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create new order from cart
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      couponCode,
      notes 
    } = req.body;
    
    const userId = req.user.id;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      // Check stock availability
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
        image: product.images?.[0] || '',
        sku: product.sku
      });

      // Update product stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Calculate tax (assuming 13% HST for Canada)
    const tax = subtotal * 0.13;
    
    // Calculate shipping (free shipping over $100)
    const shippingCost = subtotal > 100 ? 0 : 15;
    
    // Apply discount if coupon code provided
    let discount = 0;
    if (couponCode) {
      // Simple discount logic - you can enhance this
      if (couponCode === 'SAVE10') discount = subtotal * 0.1;
      if (couponCode === 'FREESHIP') discount = shippingCost;
    }

    const totalAmount = subtotal + tax + shippingCost - discount;

    // Create order
    const order = new Order({
      user: userId,
      orderDate: new Date(),
      totalAmount: subtotal,
      tax,
      shippingCost,
      discount,
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items: orderItems,
      notes,
      couponCode,
      ipAddress: req.ip
    });

    await order.save({ session });

    // Create payment record
    const payment = new Payment({
      order: order._id,
      paymentMethod,
      paymentAmount: totalAmount,
      paymentStatus: 'Pending'
    });

    await payment.save({ session });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: 'Order created successfully',
      order: await Order.findById(order._id).populate('user', 'firstName lastName email')
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, paymentStatus, startDate, endDate, search } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    // Search functionality
    let orders;
    if (search) {
      orders = await Order.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userData'
          }
        },
        {
          $match: {
            $and: [
              filter,
              {
                $or: [
                  { orderId: { $regex: search, $options: 'i' } },
                  { 'userData.firstName': { $regex: search, $options: 'i' } },
                  { 'userData.lastName': { $regex: search, $options: 'i' } },
                  { 'userData.email': { $regex: search, $options: 'i' } }
                ]
              }
            ]
          }
        },
        { $sort: { orderDate: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
    } else {
      orders = await Order.find(filter)
        .populate('user', 'firstName lastName email')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.productId', 'name images sku');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order (admin or order owner)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // If marking as delivered, set actual delivery date
    if (orderStatus === 'Delivered') {
      order.actualDelivery = new Date();
    }

    // If cancelling order, restore product stock
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    await order.save({ session });

    // Update payment record if payment status changed
    if (paymentStatus) {
      await Payment.findOneAndUpdate(
        { order: id },
        { paymentStatus },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      message: 'Order updated successfully',
      order: await Order.findById(id).populate('user', 'firstName lastName email')
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  } finally {
    session.endSession();
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can cancel this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (['Delivered', 'Cancelled', 'Refunded'].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Update order status
    order.orderStatus = 'Cancelled';
    if (reason) order.notes = (order.notes || '') + `\nCancellation reason: ${reason}`;

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    await order.save({ session });

    // Update payment status
    await Payment.findOneAndUpdate(
      { order: id },
      { paymentStatus: 'Refunded' },
      { session }
    );

    await session.commitTransaction();

    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get order analytics (Admin only)
export const getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    // Total orders and revenue
    const totalOrders = await Order.countDocuments(dateFilter);
    const revenueData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $add: ['$totalAmount', '$tax', '$shippingCost'] } },
          avgOrderValue: { $avg: { $add: ['$totalAmount', '$tax', '$shippingCost'] } }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          revenue: { $sum: { $add: ['$totalAmount', '$tax', '$shippingCost'] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      avgOrderValue: revenueData[0]?.avgOrderValue || 0,
      ordersByStatus,
      ordersByPaymentStatus,
      monthlyRevenue
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Delete order (Admin only - use with caution)
export const deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow deletion of cancelled orders
    if (order.orderStatus !== 'Cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only cancelled orders can be deleted' });
    }

    // Delete associated payment records
    await Payment.deleteMany({ order: id }).session(session);

    // Delete the order
    await Order.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    res.json({ message: 'Order deleted successfully' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  } finally {
    session.endSession();
  }
};
