import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, no token provided",
        });
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account is inactive",
        });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Not authorized, invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Not authorized, token expired",
        });
      }

      res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Admin authorization middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

// Customer or higher authorization
export const customer = (req, res, next) => {
  if (req.user && ["Customer", "Admin", "Employee"].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }
};
