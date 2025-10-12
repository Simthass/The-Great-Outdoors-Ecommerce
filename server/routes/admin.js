import express from "express";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect);
router.use(admin);

// Admin dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    // Only accessible by admins
    res.json({
      success: true,
      data: {
        message: "Welcome to Admin Dashboard",
        stats: {
          totalUsers: 150,
          totalOrders: 450,
          revenue: 12500,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// User management
router.get("/users", async (req, res) => {
  try {
    // Admin-only user management
    res.json({
      success: true,
      data: {
        users: [], // user data
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
