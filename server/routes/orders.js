import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderAnalytics,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Customer routes
router.post('/', createOrder); // Create new order from cart
router.get('/my-orders', getUserOrders); // Get current user's orders
router.get('/:id', getOrder); // Get single order (customer can only access their own)
router.put('/:id/cancel', cancelOrder); // Cancel order (customer or admin)

// Admin routes - these should be protected with admin role check
router.get('/', getAllOrders); // Get all orders (admin only)
router.put('/:id/status', updateOrderStatus); // Update order status (admin only)
router.get('/analytics/dashboard', getOrderAnalytics); // Get order analytics (admin only)
router.delete('/:id', deleteOrder); // Delete order (admin only)

export default router;
