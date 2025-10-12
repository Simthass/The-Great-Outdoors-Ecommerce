import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Get all orders with admin functionality
export const getAllOrdersAdmin = async (req, res) => {
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

    let orders;
    let total;

    if (search) {
      // Search functionality with user lookup
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            $and: [
              filter,
              {
                $or: [
                  { orderId: { $regex: search, $options: "i" } },
                  { "user.firstName": { $regex: search, $options: "i" } },
                  { "user.lastName": { $regex: search, $options: "i" } },
                  { "user.email": { $regex: search, $options: "i" } },
                ],
              },
            ],
          },
        },
        { $sort: { orderDate: -1 } },
      ];

      // Get total count
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Order.aggregate(countPipeline);
      total = countResult[0]?.total || 0;

      // Get paginated results
      const resultPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
      orders = await Order.aggregate(resultPipeline);
    } else {
      orders = await Order.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);

      total = await Order.countDocuments(filter);
    }

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      carrier,
      estimatedDelivery,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Store the previous status for stock management
    const previousStatus = order.orderStatus;

    // Update order fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery)
      order.estimatedDelivery = new Date(estimatedDelivery);

    // If marking as delivered, set actual delivery date
    if (orderStatus === "Delivered") {
      order.actualDelivery = new Date();
    }

    // If cancelling order, restore product stock
    if (orderStatus === "Cancelled" && previousStatus !== "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // If changing from cancelled to another status, reduce product stock
    if (previousStatus === "Cancelled" && orderStatus !== "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    await order.save();

    res.json({
      success: true,
      message: "Order updated successfully",
      order: await Order.findById(id).populate(
        "user",
        "firstName lastName email"
      ),
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// Get order analytics for dashboard
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
          totalRevenue: {
            $sum: { $add: ["$totalAmount", "$tax", "$shippingCost"] },
          },
          avgOrderValue: {
            $avg: { $add: ["$totalAmount", "$tax", "$shippingCost"] },
          },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      avgOrderValue: revenueData[0]?.avgOrderValue || 0,
      ordersByStatus,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

// Cancel order (admin)
export const cancelOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["Delivered", "Cancelled", "Refunded"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    if (reason)
      order.notes = (order.notes || "") + `\nCancellation reason: ${reason}`;

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
