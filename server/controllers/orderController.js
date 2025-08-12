import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create new order from cart
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      notes,
      couponCode
    } = req.body;

    // Get cart data
    let cart;
    if (req.session.cartId) {
      cart = await Cart.findById(req.session.cartId).populate("items.product");
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or not found"
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        throw new Error(`Product not found for cart item`);
      }

      const product = item.product;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        image: product.imageUrl,
        sku: product.sku || `SKU-${product._id.toString().slice(-6)}`
      });

      // Check and update product stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }
    }

    // Calculate tax and shipping (you can customize these calculations)
    const taxRate = 0.13; // 13% tax
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const discount = 0; // Apply coupon logic here if needed
    const totalAmount = subtotal + tax + shippingCost - discount;

    // Create order
    const orderData = {
      user: req.userId || null, // If user is authenticated
      orderDate: new Date(),
      totalAmount: subtotal,
      tax,
      shippingCost,
      discount,
      orderStatus: "Pending",
      paymentStatus: paymentId ? "Paid" : "Pending",
      paymentMethod,
      paymentId,
      shippingAddress,
      billingAddress,
      items: orderItems,
      notes,
      couponCode,
      ipAddress: req.ip
    };

    const order = new Order(orderData);
    await order.save({ session });

    // Create payment record if payment was made
    if (paymentId) {
      const payment = new Payment({
        order: order._id,
        paymentMethod,
        paymentAmount: totalAmount,
        paymentStatus: "Completed",
        transactionID: paymentId
      });
      await payment.save({ session });
    }

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Clear the cart
    await Cart.findByIdAndDelete(req.session.cartId, { session });
    req.session.cartId = null;

    await session.commitTransaction();

    // Populate order with user details for response
    await order.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        ...order.toObject(),
        grandTotal: totalAmount
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order"
    });
  } finally {
    session.endSession();
  }
};

// Get all orders (Admin)
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

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders"
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'firstName lastName email phone')
      .populate('items.productId', 'productName imageUrl brand category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if user has permission to view this order
    if (req.userRole !== 'admin' && order.user?._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order"
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user orders"
    });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, carrier, notes } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (notes) updateData.notes = notes;

    // Set delivery date if order is delivered
    if (orderStatus === 'Delivered') {
      updateData.actualDelivery = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order"
    });
  }
};

// Cancel/Delete order
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if user has permission to cancel this order
    if (req.userRole !== 'admin' && order.user?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if order can be cancelled
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel shipped or delivered orders"
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Update order status
    order.orderStatus = 'Cancelled';
    order.notes = reason ? `Cancelled: ${reason}` : 'Order cancelled';
    await order.save({ session });

    // Update payment status if needed
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refunded';
      await order.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order"
    });
  } finally {
    session.endSession();
  }
};

// Get order statistics (Admin)
export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) matchStage.orderDate.$gte = new Date(startDate);
      if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Pending"] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Processing"] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Shipped"] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] }
          }
        }
      }
    ]);

    const ordersByMonth = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      ordersByMonth
    });

  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order statistics"
    });
  }
};

// Generate payment report
export const getPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) matchStage.orderDate.$gte = new Date(startDate);
      if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }
    if (paymentMethod) matchStage.paymentMethod = paymentMethod;

    const report = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            paymentMethod: "$paymentMethod",
            paymentStatus: "$paymentStatus"
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          totalTax: { $sum: "$tax" },
          totalShipping: { $sum: "$shippingCost" }
        }
      },
      {
        $group: {
          _id: "$_id.paymentMethod",
          transactions: {
            $push: {
              status: "$_id.paymentStatus",
              count: "$count",
              totalAmount: "$totalAmount",
              totalTax: "$totalTax",
              totalShipping: "$totalShipping"
            }
          },
          totalTransactions: { $sum: "$count" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error("Get payment report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment report"
    });
  }
};
