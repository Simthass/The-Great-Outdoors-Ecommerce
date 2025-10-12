// routes/adminOrders.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllOrdersAdmin,
  updateOrderAdmin,
  getOrderAnalytics,
  cancelOrderAdmin,
} from "../controllers/adminOrderController.js";

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

router.get("/", getAllOrdersAdmin);
router.get("/analytics/dashboard", getOrderAnalytics);
router.put("/:id/update", updateOrderAdmin);
router.put("/:id/cancel", cancelOrderAdmin);

export default router;
