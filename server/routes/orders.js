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
import Order from '../models/Order.js';

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

// Update order route - should match what frontend is calling
router.put('/:id/update', authenticateUser, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, carrier, estimatedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
        paymentStatus,
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Note: The update route is added to handle updates from the frontend.
// It allows updating order details like status, payment, tracking, etc.