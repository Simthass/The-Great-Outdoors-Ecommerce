import express from 'express';
import {
  getAllPayments,
  getPayment,
  processPayment,
  refundPayment,
  getPaymentAnalytics,
  getPaymentReport,
  verifyPayment
} from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Payment processing routes
router.post('/process', processPayment); // Process payment for an order
router.post('/verify', verifyPayment); // Verify payment status (for webhooks)

// Payment management routes (Admin only)
router.get('/', getAllPayments); // Get all payment transactions
router.get('/analytics', getPaymentAnalytics); // Get payment analytics
router.get('/report', getPaymentReport); // Get payment transaction report
router.get('/:id', getPayment); // Get single payment transaction
router.post('/:id/refund', refundPayment); // Process refund

export default router;
