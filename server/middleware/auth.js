import jwt from "jsonwebtoken";
import User from "../models/User.js";
import rateLimit from "express-rate-limit";

// Rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT Token with enhanced security
export const generateToken = (id, ip) => {
  return jwt.sign(
    {
      id,
      ip: ip || "unknown",
      type: "access",
    },
    process.env.JWT_SECRET || "your-fallback-secret-key-change-in-production",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30m",
      issuer: process.env.JWT_ISSUER || "industry-shop",
      audience: process.env.JWT_AUDIENCE || "industry-shop-app",
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (id, ip) => {
  return jwt.sign(
    {
      id,
      ip: ip || "unknown",
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET ||
      "your-fallback-refresh-secret-change-in-production",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER || "industry-shop",
    }
  );
};

// Enhanced Protect middleware
export const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-fallback-secret-key-change-in-production"
    );

    // Additional security checks
    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type.",
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated. Please contact support.",
      });
    }

    // Security logging
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    // Log sensitive actions
    if (req.method !== "GET") {
      await user.addSecurityLog(
        `API_ACCESS: ${req.method} ${req.originalUrl}`,
        ipAddress,
        userAgent
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Enhanced role-based middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Security logging for unauthorized access attempts
      console.warn(
        `UNAUTHORIZED_ACCESS: User ${req.user.email} with role ${req.user.role} attempted to access ${req.method} ${req.originalUrl}`
      );

      return res.status(403).json({
        success: false,
        message: "Insufficient permissions for this action.",
      });
    }

    next();
  };
};

// Admin middleware
export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "Admin") {
    console.warn(
      `Unauthorized admin access attempt by user: ${req.user.email}`
    );
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

// Employee middleware (for both Admin and Employee roles)
export const employee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "Admin" && req.user.role !== "Employee") {
    console.warn(
      `Unauthorized employee access attempt by user: ${req.user.email}`
    );
    return res.status(403).json({
      success: false,
      message: "Access denied. Employee privileges required.",
    });
  }

  next();
};

// Customer middleware
export const customer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (
    req.user.role !== "Customer" &&
    req.user.role !== "Admin" &&
    req.user.role !== "Employee"
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer privileges required.",
    });
  }

  next();
};

// Verify token endpoint for frontend - FIXED EXPORT
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-fallback-secret-key-change-in-production"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

// Token refresh endpoint
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required.",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET ||
        "your-fallback-refresh-secret-change-in-production"
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive.",
      });
    }

    const newAccessToken = generateToken(user._id, req.ip);

    res.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token.",
    });
  }
};
