// routes/settings.js
import express from "express";
import {
  getUserSettings,
  updateNotificationSettings,
  updatePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserOrders,
  getHelpInfo,
} from "../controllers/settingsController.js";
import {
  authenticateUser,
  checkUserActive,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);
router.use(checkUserActive);

// Get all settings
router.get("/", getUserSettings);

// Notification settings
router.put("/notifications", updateNotificationSettings);

// Password settings
router.put("/password", updatePassword);

// Address routes
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.put("/addresses/:id/default", setDefaultAddress);

// Order routes
router.get("/orders", getUserOrders);

// Help routes
router.get("/help", getHelpInfo);

export default router;
