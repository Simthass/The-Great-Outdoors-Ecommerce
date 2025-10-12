import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get all payment transactions (Admin only)
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, method, startDate, endDate, search } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (method) filter.paymentMethod = method;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Search functionality
    let payments;
    if (search) {
      payments = await Payment.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'order',
            foreignField: '_id',
            as: 'orderData'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'orderData.user',
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
                  { transactionID: { $regex: search, $options: 'i' } },
                  { 'orderData.orderId': { $regex: search, $options: 'i' } },
                  { 'userData.firstName': { $regex: search, $options: 'i' } },
                  { 'userData.lastName': { $regex: search, $options: 'i' } },
                  { 'userData.email': { $regex: search, $options: 'i' } }
                ]
              }
            ]
          }
        },
        { $sort: { paymentDate: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);
    } else {
      payments = await Payment.find(filter)
        .populate({
          path: 'order',
          select: 'orderId user orderDate totalAmount tax shippingCost',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get single payment transaction
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id)
      .populate({
        path: 'order',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Process payment (simulate payment processing)
export const processPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, paymentMethod, paymentData } = req.body;

    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ order: orderId }).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment record not found' });
    }

    // Simulate payment processing
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

    if (isPaymentSuccessful) {
      // Update payment status
      payment.paymentStatus = 'Paid';
      payment.paymentDate = new Date();
      payment.transactionID = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      payment.gatewayResponse = {
        status: 'success',
        message: 'Payment processed successfully',
        timestamp: new Date(),
        ...paymentData
      };

      // Update order payment status
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Processing';
      
      await Promise.all([
        payment.save({ session }),
        order.save({ session })
      ]);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Payment processed successfully',
        payment: payment,
        transactionId: payment.transactionID
      });

    } else {
      // Payment failed
      payment.paymentStatus = 'Failed';
      payment.gatewayResponse = {
        status: 'failed',
        message: 'Payment processing failed',
        timestamp: new Date(),
        errorCode: 'PAYMENT_DECLINED'
      };

      await payment.save({ session });
      await session.commitTransaction();

      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: 'Payment was declined by the payment processor'
      });
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  } finally {
    session.endSession();
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const payment = await Payment.findById(id).populate('order').session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentStatus !== 'Paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }

    const maxRefundAmount = payment.paymentAmount - payment.refundAmount;
    const finalRefundAmount = refundAmount || maxRefundAmount;

    if (finalRefundAmount > maxRefundAmount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Refund amount cannot exceed ${maxRefundAmount}` 
      });
    }

    // Update payment record
    payment.refundAmount += finalRefundAmount;
    payment.refundDate = new Date();
    payment.notes = (payment.notes || '') + `\nRefund: $${finalRefundAmount} - ${reason || 'No reason provided'}`;
    
    if (payment.refundAmount >= payment.paymentAmount) {
      payment.paymentStatus = 'Refunded';
    }

    // Update order status
    const order = await Order.findById(payment.order._id).session(session);
    if (payment.paymentStatus === 'Refunded') {
      order.paymentStatus = 'Refunded';
      order.orderStatus = 'Refunded';
    }

    await Promise.all([
      payment.save({ session }),
      order.save({ session })
    ]);

    await session.commitTransaction();

    res.json({
      message: 'Refund processed successfully',
      payment,
      refundAmount: finalRefundAmount
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Refund payment error:', error);
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get payment analytics and reports
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    // Total payment statistics
    const totalStats = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentAmount' },
          totalRefunds: { $sum: '$refundAmount' },
          netAmount: { $sum: { $subtract: ['$paymentAmount', '$refundAmount'] } },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$paymentAmount' }
        }
      }
    ]);

    // Payment status breakdown
    const statusBreakdown = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$paymentAmount' }
        }
      }
    ]);

    // Payment method breakdown
    const methodBreakdown = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$paymentAmount' }
        }
      }
    ]);

    // Time-based analysis
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
          day: { $dayOfMonth: '$paymentDate' },
          hour: { $hour: '$paymentDate' }
        };
        break;
      case 'month':
        groupStage = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        };
        break;
      case 'year':
        groupStage = {
          year: { $year: '$paymentDate' }
        };
        break;
      default: // day
        groupStage = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
          day: { $dayOfMonth: '$paymentDate' }
        };
    }

    const timeBasedData = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupStage,
          totalAmount: { $sum: '$paymentAmount' },
          totalRefunds: { $sum: '$refundAmount' },
          netAmount: { $sum: { $subtract: ['$paymentAmount', '$refundAmount'] } },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Failed payment analysis
    const failedPayments = await Payment.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          paymentStatus: 'Failed' 
        } 
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$paymentAmount' }
        }
      }
    ]);

    res.json({
      totalStats: totalStats[0] || {
        totalAmount: 0,
        totalRefunds: 0,
        netAmount: 0,
        totalTransactions: 0,
        avgTransactionValue: 0
      },
      statusBreakdown,
      methodBreakdown,
      timeBasedData,
      failedPayments
    });

  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({ message: 'Error fetching payment analytics', error: error.message });
  }
};

// Get payment transaction report (CSV export data)
export const getPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(dateFilter)
      .populate({
        path: 'order',
        select: 'orderId user orderDate',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort({ paymentDate: -1 });

    // Format data for export
    const reportData = payments.map(payment => ({
      transactionId: payment.transactionID || 'N/A',
      orderId: payment.order?.orderId || 'N/A',
      customerName: payment.order?.user ? 
        `${payment.order.user.firstName} ${payment.order.user.lastName}` : 'N/A',
      customerEmail: payment.order?.user?.email || 'N/A',
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      paymentAmount: payment.paymentAmount,
      refundAmount: payment.refundAmount,
      netAmount: payment.netAmount,
      currency: payment.currency
    }));

    if (format === 'csv') {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payment-report.csv');
      
      // Create CSV content
      const csvHeader = Object.keys(reportData[0] || {}).join(',') + '\n';
      const csvRows = reportData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        report: reportData,
        summary: {
          totalTransactions: reportData.length,
          totalAmount: reportData.reduce((sum, item) => sum + item.paymentAmount, 0),
          totalRefunds: reportData.reduce((sum, item) => sum + item.refundAmount, 0),
          netAmount: reportData.reduce((sum, item) => sum + item.netAmount, 0)
        }
      });
    }

  } catch (error) {
    console.error('Get payment report error:', error);
    res.status(500).json({ message: 'Error generating payment report', error: error.message });
  }
};

// Verify payment status (for webhook handling)
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, status, gatewayResponse } = req.body;

    const payment = await Payment.findOne({ transactionID: transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status based on gateway response
    payment.paymentStatus = status;
    payment.gatewayResponse = gatewayResponse;

    if (status === 'Paid') {
      // Update order status
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'Paid',
        orderStatus: 'Processing'
      });
    } else if (status === 'Failed') {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'Failed'
      });
    }

    await payment.save();

    res.json({
      message: 'Payment status updated successfully',
      payment
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};
