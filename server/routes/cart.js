import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
  applyCoupon,
  getCartSummary
} from '../controllers/cartController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (for guest users)
router.get('/', getCart);
router.post('/add', addToCart);
router.get('/summary', getCartSummary);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/coupon', applyCoupon);

// Protected routes (require authentication)
router.post('/merge', authenticateUser, mergeGuestCart);

export default router;
