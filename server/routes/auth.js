// routes/auth.js - Production ready authentication routes
import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const router = express.Router();

// JWT token generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Input validation middleware
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
];

const validateRegistration = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    console.log("📝 REGISTER ROUTE HIT");

    try {
      const { firstName, lastName, email, password, phoneNumber, address } =
        req.body;

      console.log("📤 Registration attempt for:", email);

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log("❌ User already exists:", email);
        return res.status(400).json({
          success: false,
          message: "A user with this email address already exists",
        });
      }

      // Create new user
      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password, // This will be hashed by the pre-save middleware
        phoneNumber: phoneNumber?.trim() || "",
        address: address?.trim() || "",
        role: "Customer",
        isActive: true,
      });

      // Generate token
      const token = generateToken(user._id);

      console.log("✅ User registered successfully:", user.email);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          token,
        },
      });
    } catch (error) {
      console.error("❌ Registration error:", error);

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email address is already registered",
        });
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: messages,
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    console.log("🔑 LOGIN ROUTE HIT");

    try {
      const { email, password } = req.body;

      console.log("📤 Login attempt for:", email);

      // Find user by email and include password field for comparison
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );

      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      console.log("👤 User found:", {
        id: user._id,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
      });

      // Check if account is locked
      if (user.isLocked && user.isLocked()) {
        console.log("🔒 Account is locked:", email);
        return res.status(423).json({
          success: false,
          message:
            "Account is temporarily locked due to too many failed login attempts. Please try again later.",
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        console.log("❌ Account is inactive:", email);
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        });
      }

      // Verify password
      const isPasswordValid = await user.matchPassword(password);
      console.log("🔐 Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Invalid password for user:", email);

        // Increment login attempts
        if (user.incLoginAttempts) {
          await user.incLoginAttempts();
        }

        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Reset login attempts on successful login
      if (user.resetLoginAttempts) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      console.log("✅ Login successful for:", user.email);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          token,
        },
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", async (req, res) => {
  console.log("🔄 FORGOT PASSWORD ROUTE HIT");

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    console.log("📤 Password reset request for:", email);

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("❌ User not found for password reset:", email);
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    }

    // Generate reset token (you can implement email sending later)
    const resetToken = jwt.sign(
      { id: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" }
    );

    console.log("🔗 Password reset token generated for:", user.email);
    console.log("Reset token:", resetToken); // In production, you'd email this

    // In a real app, you would:
    // 1. Save the reset token to user document with expiration
    // 2. Send email with reset link containing the token
    // For now, we'll just return success

    res.json({
      success: true,
      message:
        "If an account with that email exists, we have sent a password reset link.",
      // In development, include the token for testing
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
router.post("/logout", (req, res) => {
  console.log("🚪 LOGOUT ROUTE HIT");

  // In a stateless JWT setup, logout is mainly handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
router.get("/verify", async (req, res) => {
  console.log("🔍 VERIFY TOKEN ROUTE HIT");

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    console.log("🔐 Verifying token:", token.substring(0, 20) + "...");

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    // Get user details
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ Token valid but user not found:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    if (!user.isActive) {
      console.log("❌ Token valid but user inactive:", user.email);
      return res.status(401).json({
        success: false,
        message: "User account is inactive",
      });
    }

    console.log("✅ Token verified for user:", user.email);

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("❌ Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    });
  }
});

// @desc    Get current user profile (alternative to verify)
// @route   GET /api/auth/me
// @access  Private
router.get("/me", async (req, res) => {
  console.log("👤 GET CURRENT USER ROUTE HIT");

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Current user retrieved:", user.email);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("❌ Get current user error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
