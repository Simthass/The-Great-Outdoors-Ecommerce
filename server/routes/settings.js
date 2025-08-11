// routes/settings.js
import express from "express";
import {
  getUserSettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updatePassword,
  //  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  //  getHelpInfo,
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

// Appearance settings
router.put("/appearance", updateAppearanceSettings);

// Password settings
router.put("/password", updatePassword);

// Address routes
//router.get("/addresses", getUserAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);
router.put("/addresses/:id/default", setDefaultAddress);

// Help routes
//router.get("/help", getHelpInfo);

export default router;
