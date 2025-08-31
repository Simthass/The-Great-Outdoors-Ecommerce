// routes/coupons.js
import express from "express";
import {
  body,
  validationResult as expressValidationResult,
  param,
} from "express-validator";

import rateLimit from "express-rate-limit";
import Coupon from "../models/Coupon.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate limiting for coupon validation (5 attempts per 15 minutes)
const validateCouponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many coupon validation attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for coupon creation (10 per hour for admin)
const createCouponLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many coupon creation attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateCouponInput = [
  body("code")
    .isLength({ min: 4, max: 50 })
    .withMessage("Coupon code must be between 4 and 50 characters")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("Coupon code can only contain letters, numbers, and hyphens")
    .customSanitizer((value) => value.toUpperCase().trim()),

  body("description")
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be between 5 and 500 characters")
    .trim()
    .escape(),

  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),

  body("discountValue")
    .isFloat({ min: 0.01 })
    .withMessage("Discount value must be a positive number"),

  body("minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a positive number"),

  body("maxDiscountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum discount amount must be a positive number"),

  // Update the startDate validation in validateCouponInput
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (
        req.body.startDate &&
        new Date(value) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Usage limit must be a positive integer"),
];

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  createCouponLimiter,
  validateCouponInput,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = expressValidationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        allowedUsers,
        singleUsePerUser,
      } = req.body;

      // Additional server-side validation
      if (
        discountType === "percentage" &&
        (discountValue < 1 || discountValue > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount must be between 1 and 100",
        });
      }

      const coupon = await Coupon.create({
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount
          ? parseFloat(maxDiscountAmount)
          : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        allowedUsers: allowedUsers || [],
        singleUsePerUser: singleUsePerUser || false,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      console.error("Create coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create coupon",
      });
    }
  }
);

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post(
  "/validate",
  protect,
  validateCouponLimiter,
  [
    body("code")
      .isLength({ min: 4, max: 50 })
      .withMessage("Coupon code must be between 4 and 50 characters")
      .matches(/^[A-Z0-9-]+$/)
      .withMessage("Coupon code can only contain letters, numbers, and hyphens")
      .customSanitizer((value) => value.toUpperCase().trim()),

    body("orderAmount")
      .isFloat({ min: 0 })
      .withMessage("Order amount must be a positive number"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = expressValidationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { code, orderAmount } = req.body;

      const validationResult = await Coupon.validateCoupon(
        code,
        parseFloat(orderAmount),
        req.user._id
      );

      if (!validationResult.valid) {
        return res.json({
          success: false,
          message: validationResult.message,
        });
      }

      res.json({
        success: true,
        data: validationResult.coupon,
      });
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate coupon",
      });
    }
  }
);

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // Validate and sanitize query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Build safe query
    let query = {};

    // Optional search filter with sanitization
    if (req.query.search) {
      const searchTerm = req.query.search.replace(/[^a-zA-Z0-9\s-]/g, "");
      query.$or = [
        { code: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Optional status filter
    if (req.query.status === "active") {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (req.query.status === "inactive") {
      query.isActive = false;
    } else if (req.query.status === "expired") {
      query.endDate = { $lt: new Date() };
    }

    const coupons = await Coupon.find(query)
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCoupons / limit),
          totalCoupons,
        },
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid coupon ID")],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = expressValidationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found" });
      }

      // ✅ Build update data with proper validation
      const updateData = {};

      // Handle each field with proper type conversion
      if (req.body.code !== undefined) {
        updateData.code = req.body.code.trim().toUpperCase();
      }
      if (req.body.description !== undefined) {
        updateData.description = req.body.description.trim();
      }
      if (req.body.discountType !== undefined) {
        updateData.discountType = req.body.discountType;
      }
      if (req.body.discountValue !== undefined) {
        updateData.discountValue = parseFloat(req.body.discountValue);
      }
      if (req.body.minOrderAmount !== undefined) {
        updateData.minOrderAmount = req.body.minOrderAmount
          ? parseFloat(req.body.minOrderAmount)
          : 0;
      }
      if (req.body.maxDiscountAmount !== undefined) {
        updateData.maxDiscountAmount = req.body.maxDiscountAmount
          ? parseFloat(req.body.maxDiscountAmount)
          : null;
      }
      if (req.body.startDate !== undefined) {
        updateData.startDate = new Date(req.body.startDate);
      }
      if (req.body.endDate !== undefined) {
        updateData.endDate = new Date(req.body.endDate);
      }
      if (req.body.usageLimit !== undefined) {
        updateData.usageLimit = req.body.usageLimit
          ? parseInt(req.body.usageLimit)
          : null;
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive;
      }
      if (req.body.allowedUsers !== undefined) {
        updateData.allowedUsers = req.body.allowedUsers;
      }
      if (req.body.singleUsePerUser !== undefined) {
        updateData.singleUsePerUser = req.body.singleUsePerUser;
      }

      // ✅ Manual date validation before update
      const finalStartDate = updateData.startDate || coupon.startDate;
      const finalEndDate = updateData.endDate || coupon.endDate;

      if (finalEndDate <= finalStartDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }

      // ✅ Additional validations
      if (
        updateData.discountType === "percentage" ||
        (!updateData.discountType && coupon.discountType === "percentage")
      ) {
        const discountValue =
          updateData.discountValue !== undefined
            ? updateData.discountValue
            : coupon.discountValue;
        if (discountValue < 1 || discountValue > 100) {
          return res.status(400).json({
            success: false,
            message: "Percentage discount must be between 1 and 100",
          });
        }
      }

      // ✅ Use updateOne instead of findByIdAndUpdate to avoid schema validators
      await Coupon.updateOne({ _id: req.params.id }, { $set: updateData });

      // ✅ Fetch the updated document
      const updatedCoupon = await Coupon.findById(req.params.id);

      res.json({ success: true, data: updatedCoupon });
    } catch (error) {
      console.error("Update coupon error:", error);

      if (error.message === "End date must be after start date") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update coupon",
      });
    }
  }
);

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid coupon ID")],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = expressValidationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const coupon = await Coupon.findById(req.params.id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      await Coupon.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete coupon",
      });
    }
  }
);

export default router;
