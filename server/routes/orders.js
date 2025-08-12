import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getPaymentReport
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.province').notEmpty().withMessage('Province is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').isIn(['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash On Delivery']).withMessage('Invalid payment method'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Public routes (for guest checkout)
router.post('/create', validateOrder, createOrder);

// Protected routes (require authentication)
router.get('/my-orders', protect, getUserOrders);
router.get('/:orderId', protect, getOrderById);
router.post('/:orderId/cancel', protect, cancelOrder);

// Admin only routes
router.get('/', protect, admin, getAllOrders);
router.put('/:orderId/status', protect, admin, updateOrderStatus);
router.delete('/:orderId', protect, admin, cancelOrder);
router.get('/admin/stats', protect, admin, getOrderStats);
router.get('/admin/payment-report', protect, admin, getPaymentReport);

export default router;
