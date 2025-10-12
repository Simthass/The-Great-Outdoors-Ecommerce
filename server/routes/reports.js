import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getOrderAnalytics,
  getSalesSummary,
  getCustomerAnalytics,
  getProductPerformance,
  exportReportToPDF,
  exportReportToExcel,
  getDashboardMetrics
} from '../controllers/reportsController.js';

const router = express.Router();

// All report routes require authentication and admin privileges
router.use(protect, admin);

// @desc    Get comprehensive order analytics
// @route   GET /api/reports/orders/analytics
// @access  Private/Admin
// @params  ?period=last30days&startDate=2024-01-01&endDate=2024-01-31&status=Delivered&paymentStatus=Paid&includeGrowth=true
router.get('/orders/analytics', getOrderAnalytics);

// @desc    Get sales summary report
// @route   GET /api/reports/sales/summary
// @access  Private/Admin
// @params  ?period=month&startDate=2024-01-01&endDate=2024-01-31
router.get('/sales/summary', getSalesSummary);

// @desc    Get customer analytics
// @route   GET /api/reports/customers/analytics
// @access  Private/Admin
// @params  ?period=last30days&startDate=2024-01-01&endDate=2024-01-31
router.get('/customers/analytics', getCustomerAnalytics);

// @desc    Get product performance report
// @route   GET /api/reports/products/performance
// @access  Private/Admin
// @params  ?period=last30days&startDate=2024-01-01&endDate=2024-01-31&limit=50
router.get('/products/performance', getProductPerformance);

// @desc    Get dashboard metrics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
router.get('/dashboard', getDashboardMetrics);

// @desc    Export report to PDF
// @route   GET /api/reports/export/pdf
// @access  Private/Admin
// @params  ?reportType=orders&period=last30days&startDate=2024-01-01&endDate=2024-01-31
router.get('/export/pdf', exportReportToPDF);

// @desc    Export report to Excel
// @route   GET /api/reports/export/excel
// @access  Private/Admin  
// @params  ?reportType=orders&period=last30days&startDate=2024-01-01&endDate=2024-01-31
router.get('/export/excel', exportReportToExcel);

// Additional specialized report routes

// @desc    Get revenue trend report
// @route   GET /api/reports/revenue/trend
// @access  Private/Admin
router.get('/revenue/trend', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate, groupBy = 'day' } = req.query;
    
    // This would be a simplified version of revenue trend
    // In practice, you might want to create a separate controller method
    res.json({
      success: true,
      message: 'Revenue trend endpoint - implement specific logic as needed',
      params: { period, startDate, endDate, groupBy }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue trend',
      error: error.message
    });
  }
});

// @desc    Get inventory report based on orders
// @route   GET /api/reports/inventory/movement
// @access  Private/Admin
router.get('/inventory/movement', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate, productId } = req.query;
    
    // This would analyze product movement based on orders
    res.json({
      success: true,
      message: 'Inventory movement endpoint - implement specific logic as needed',
      params: { period, startDate, endDate, productId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory movement',
      error: error.message
    });
  }
});

// @desc    Get financial summary report
// @route   GET /api/reports/financial/summary
// @access  Private/Admin
router.get('/financial/summary', async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    // This would provide detailed financial breakdown
    res.json({
      success: true,
      message: 'Financial summary endpoint - implement specific logic as needed',
      params: { period, startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message
    });
  }
});

// @desc    Get order status analytics
// @route   GET /api/reports/orders/status-analytics
// @access  Private/Admin
router.get('/orders/status-analytics', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate } = req.query;
    
    // This would analyze order status distributions and transitions
    res.json({
      success: true,
      message: 'Order status analytics endpoint - implement specific logic as needed',
      params: { period, startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order status analytics',
      error: error.message
    });
  }
});

// @desc    Get geographic sales distribution
// @route   GET /api/reports/geographic/sales
// @access  Private/Admin
router.get('/geographic/sales', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate, groupBy = 'province' } = req.query;
    
    // This would analyze sales by geographic regions based on shipping addresses
    res.json({
      success: true,
      message: 'Geographic sales endpoint - implement specific logic as needed',
      params: { period, startDate, endDate, groupBy }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching geographic sales data',
      error: error.message
    });
  }
});

// @desc    Get payment method analytics
// @route   GET /api/reports/payments/analytics
// @access  Private/Admin
router.get('/payments/analytics', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate } = req.query;
    
    // This would analyze payment method usage and success rates
    res.json({
      success: true,
      message: 'Payment analytics endpoint - implement specific logic as needed',
      params: { period, startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment analytics',
      error: error.message
    });
  }
});

// @desc    Get order fulfillment metrics
// @route   GET /api/reports/fulfillment/metrics
// @access  Private/Admin
router.get('/fulfillment/metrics', async (req, res) => {
  try {
    const { period = 'last30days', startDate, endDate } = req.query;
    
    // This would analyze order processing times, shipping performance, etc.
    res.json({
      success: true,
      message: 'Fulfillment metrics endpoint - implement specific logic as needed',
      params: { period, startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fulfillment metrics',
      error: error.message
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Reports route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in reports module',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;
