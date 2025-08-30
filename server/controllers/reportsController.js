import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import moment from 'moment';

import {
  getDateRange,
  validateReportParams,
  calculateOrderMetrics,
  calculateProductMetrics,
  generateTimeSeriesData,
  calculateGrowthMetrics,
  formatReportForExport
} from '../utils/reportUtils.js';

import { generateOrderReportPDF, generateSalesSummaryPDF } from '../utils/pdfGenerator.js';
import { generateOrderReportExcel, generateOrderListExcel, generateProductSalesExcel } from '../utils/excelGenerator.js';

/**
 * Get comprehensive order analytics report
 * @route GET /api/reports/orders/analytics
 * @access Private (Admin only)
 */
export const getOrderAnalytics = async (req, res) => {
  try {
    const {
      period = 'last30days',
      startDate,
      endDate,
      status,
      paymentStatus,
      includeGrowth = 'true'
    } = req.query;

    // Validate parameters
    const validation = validateReportParams({ period, startDate, endDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: validation.errors
      });
    }

    // Get date range
    const dateRange = getDateRange(period, startDate, endDate);

    // Build filter
    const filter = {
      orderDate: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      }
    };

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Fetch orders with populated user data
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.productId', 'name sku')
      .sort({ orderDate: -1 });

    // Calculate current period metrics
    const currentMetrics = calculateOrderMetrics(orders);
    const productMetrics = calculateProductMetrics(orders);
    const timeSeriesData = generateTimeSeriesData(orders, 'day', dateRange);

    let growthMetrics = null;
    if (includeGrowth === 'true') {
      // Calculate previous period for growth comparison
      const previousDateRange = getPreviousPeriodRange(dateRange);
      const previousFilter = {
        orderDate: {
          $gte: previousDateRange.startDate,
          $lte: previousDateRange.endDate
        }
      };

      const previousOrders = await Order.find(previousFilter)
        .populate('user', 'firstName lastName email');
      
      const previousMetrics = calculateOrderMetrics(previousOrders);
      growthMetrics = calculateGrowthMetrics(currentMetrics, previousMetrics);
    }

    const reportData = {
      dateRange,
      metrics: currentMetrics,
      productMetrics: productMetrics.slice(0, 20), // Top 20 products
      timeSeriesData,
      growthMetrics,
      orders: orders.slice(0, 100), // Recent 100 orders for detailed view
      totalOrdersInRange: orders.length
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating analytics report',
      error: error.message
    });
  }
};

/**
 * Get sales summary report
 * @route GET /api/reports/sales/summary
 * @access Private (Admin only)
 */
export const getSalesSummary = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    const dateRange = getDateRange(period, startDate, endDate);

    const pipeline = [
      {
        $match: {
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          orderStatus: { $nin: ['Cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] }
          },
          totalTax: { $sum: '$tax' },
          totalShipping: { $sum: '$shippingCost' },
          totalDiscount: { $sum: '$discount' },
          averageOrderValue: {
            $avg: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] }
          }
        }
      }
    ];

    const [salesData] = await Order.aggregate(pipeline);

    // Sales by day for trend analysis
    const dailySales = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          orderStatus: { $nin: ['Cancelled'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            day: { $dayOfMonth: '$orderDate' }
          },
          dailyRevenue: {
            $sum: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] }
          },
          dailyOrders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        dateRange,
        summary: salesData || {
          totalOrders: 0,
          totalRevenue: 0,
          totalTax: 0,
          totalShipping: 0,
          totalDiscount: 0,
          averageOrderValue: 0
        },
        dailyTrend: dailySales
      }
    });

  } catch (error) {
    console.error('Sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sales summary',
      error: error.message
    });
  }
};

/**
 * Get customer analytics report
 * @route GET /api/reports/customers/analytics
 * @access Private (Admin only)
 */
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);

    // Customer metrics aggregation
    const customerMetrics = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $group: {
          _id: '$user',
          customerName: {
            $first: {
              $concat: ['$customerInfo.firstName', ' ', '$customerInfo.lastName']
            }
          },
          customerEmail: { $first: '$customerInfo.email' },
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] }
          },
          averageOrderValue: {
            $avg: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] }
          },
          firstOrderDate: { $min: '$orderDate' },
          lastOrderDate: { $max: '$orderDate' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 }
    ]);

    // New vs returning customers
    const customerTypes = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$orderDate' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          newCustomers: {
            $sum: {
              $cond: [
                { $gte: ['$firstOrder', dateRange.startDate] },
                1,
                0
              ]
            }
          },
          returningCustomers: {
            $sum: {
              $cond: [
                { $gt: ['$orderCount', 1] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dateRange,
        topCustomers: customerMetrics,
        customerOverview: customerTypes[0] || {
          totalCustomers: 0,
          newCustomers: 0,
          returningCustomers: 0
        }
      }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating customer analytics',
      error: error.message
    });
  }
};

/**
 * Get product performance report
 * @route GET /api/reports/products/performance
 * @access Private (Admin only)
 */
export const getProductPerformance = async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate, limit = 50 } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);

    const productPerformance = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          orderStatus: { $nin: ['Cancelled'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 },
          averagePrice: { $avg: '$items.price' },
          averageQuantityPerOrder: { $avg: '$items.quantity' }
        }
      },
      {
        $addFields: {
          revenuePerOrder: { $divide: ['$totalRevenue', '$orderCount'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get inventory data for the products
    const productIds = productPerformance.map(p => p._id).filter(id => id);
    const inventoryData = await Product.find(
      { _id: { $in: productIds } },
      'stock lowStockThreshold category'
    );

    // Combine performance with inventory data
    const enhancedPerformance = productPerformance.map(product => {
      const inventory = inventoryData.find(inv => 
        inv._id.toString() === (product._id ? product._id.toString() : '')
      );
      
      return {
        ...product,
        currentStock: inventory ? inventory.stock : 0,
        lowStockThreshold: inventory ? inventory.lowStockThreshold : 0,
        category: inventory ? inventory.category : 'Unknown',
        stockStatus: inventory ? 
          (inventory.stock <= inventory.lowStockThreshold ? 'Low Stock' : 'In Stock') : 
          'Unknown'
      };
    });

    res.json({
      success: true,
      data: {
        dateRange,
        products: enhancedPerformance,
        totalProductsSold: productPerformance.length
      }
    });

  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating product performance report',
      error: error.message
    });
  }
};

/**
 * Export report as PDF
 * @route GET /api/reports/export/pdf
 * @access Private (Admin only)
 */
export const exportReportToPDF = async (req, res) => {
  try {
    const { reportType, period = 'last30days', startDate, endDate } = req.query;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    const dateRange = getDateRange(period, startDate, endDate);

    let reportData;
    let pdfBuffer;

    switch (reportType) {
      case 'orders':
        reportData = await generateOrdersReportData(dateRange);
        pdfBuffer = await generateOrderReportPDF(reportData, 'Order Analytics');
        break;
      
      case 'sales':
        reportData = await generateSalesReportData(dateRange);
        pdfBuffer = await generateSalesSummaryPDF(reportData);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    const filename = `${reportType}_report_${moment().format('YYYY-MM-DD')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report to PDF',
      error: error.message
    });
  }
};

/**
 * Export report as Excel
 * @route GET /api/reports/export/excel
 * @access Private (Admin only)
 */
export const exportReportToExcel = async (req, res) => {
  try {
    const { reportType, period = 'last30days', startDate, endDate } = req.query;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    const dateRange = getDateRange(period, startDate, endDate);

    let excelBuffer;
    let filename;

    switch (reportType) {
      case 'orders':
        const reportData = await generateOrdersReportData(dateRange);
        excelBuffer = generateOrderReportExcel(reportData, 'Order Report');
        filename = `orders_report_${moment().format('YYYY-MM-DD')}.xlsx`;
        break;
      
      case 'orders-list':
        const orders = await Order.find({
          orderDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }).populate('user', 'firstName lastName email').sort({ orderDate: -1 });
        
        excelBuffer = generateOrderListExcel(orders);
        filename = `orders_list_${moment().format('YYYY-MM-DD')}.xlsx`;
        break;
      
      case 'products':
        const productData = await generateProductReportData(dateRange);
        excelBuffer = generateProductSalesExcel(productData);
        filename = `product_sales_${moment().format('YYYY-MM-DD')}.xlsx`;
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report to Excel',
      error: error.message
    });
  }
};

/**
 * Get dashboard metrics for quick overview
 * @route GET /api/reports/dashboard
 * @access Private (Admin only)
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    // Today's metrics
    const today = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();
    
    // This month's metrics
    const monthStart = moment().startOf('month').toDate();
    const monthEnd = moment().endOf('month').toDate();

    // Today's orders
    const todayOrders = await Order.countDocuments({
      orderDate: { $gte: today, $lte: todayEnd }
    });

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: today, $lte: todayEnd },
          orderStatus: { $nin: ['Cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] } }
        }
      }
    ]);

    // This month's metrics
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: monthStart, $lte: monthEnd },
          orderStatus: { $nin: ['Cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] } },
          avgOrderValue: { $avg: { $add: ['$totalAmount', '$tax', '$shippingCost', { $multiply: ['$discount', -1] }] } }
        }
      }
    ]);

    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Processing'] }
    });

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ orderDate: -1 })
      .limit(10)
      .select('orderId orderDate orderStatus totalAmount tax shippingCost discount user');

    res.json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthlyStats: monthlyStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        },
        pendingOrders,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
};

// Helper functions

/**
 * Get previous period date range for growth calculations
 */
const getPreviousPeriodRange = (currentRange) => {
  const duration = moment(currentRange.endDate).diff(moment(currentRange.startDate), 'days');
  
  return {
    startDate: moment(currentRange.startDate).subtract(duration + 1, 'days').toDate(),
    endDate: moment(currentRange.startDate).subtract(1, 'day').toDate()
  };
};

/**
 * Generate complete orders report data
 */
const generateOrdersReportData = async (dateRange) => {
  const filter = {
    orderDate: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    }
  };

  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('items.productId', 'name sku')
    .sort({ orderDate: -1 });

  const metrics = calculateOrderMetrics(orders);
  const productMetrics = calculateProductMetrics(orders);
  const timeSeriesData = generateTimeSeriesData(orders, 'day', dateRange);

  return {
    dateRange,
    metrics,
    productMetrics: productMetrics.slice(0, 20),
    timeSeriesData,
    orders: orders.slice(0, 100)
  };
};

/**
 * Generate sales report data
 */
const generateSalesReportData = async (dateRange) => {
  const orders = await Order.find({
    orderDate: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    },
    orderStatus: { $nin: ['Cancelled'] }
  });

  const metrics = calculateOrderMetrics(orders);
  
  return {
    dateRange,
    totalRevenue: metrics.totalRevenue,
    totalOrders: metrics.totalOrders,
    averageOrderValue: metrics.averageOrderValue
  };
};

/**
 * Generate product report data
 */
const generateProductReportData = async (dateRange) => {
  const orders = await Order.find({
    orderDate: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    },
    orderStatus: { $nin: ['Cancelled'] }
  });

  return calculateProductMetrics(orders);
};

export default {
  getOrderAnalytics,
  getSalesSummary,
  getCustomerAnalytics,
  getProductPerformance,
  exportReportToPDF,
  exportReportToExcel,
  getDashboardMetrics
};
