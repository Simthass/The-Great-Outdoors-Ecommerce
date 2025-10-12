import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import cartRoutes from "./routes/cart.js";
import { errorHandler } from "./middleware/errorHandler.js";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import { dirname } from "path";
import contactRoute from "./routes/contact.js";
import settingsRoutes from "./routes/settings.js";
import employeeRoutes from "./routes/employee.js";
import adminReviewsRoutes from "./routes/adminReviews.js";
import searchRoutes from "./routes/search.js";
import adminOrderRoutes from "./routes/adminOrders.js";
import bannerRoutes from "./routes/banners.js";
import eventRoutes from "./routes/events.js";
import eventNotificationRoutes from "./routes/eventNotifications.js";
import productReviewRoutes from "./routes/productReviews.js";
import productReportsRoutes from "./routes/productReports.js";
import inventoryRoutes from "./routes/inventory.js";
import orderReportRoutes from "./routes/reports.js";
import { syncAllInventoryStatus } from "./middleware/inventorySync.js";
import reviewRoutes from "./routes/review.js";
import couponRoutes from "./routes/coupons.js";

// Import the fixed verifyToken function
import { verifyToken } from "./middleware/auth.js";

// Security middleware imports
import {
  sqlInjectionPrevention,
  xssProtection,
} from "./middleware/security.js";

// Load environment variables
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Trust proxy for rate limiting behind reverse proxies
app.set("trust proxy", 1);

// Enhanced Security middleware with proper configuration
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(compression());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        console.warn(`CORS_BLOCKED: ${origin}`);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);

const uploadsPath = path.join(__dirname, "uploads");
console.log("Serving static files from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

// Handle preflight requests
app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Enhanced Session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "your-super-secret-key-here-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

// Security middleware
app.use(sqlInjectionPrevention);
app.use(xssProtection);

// Static files middleware
app.use(
  "/products",
  express.static(path.join(process.cwd(), "public/products"))
);
app.use(express.static(path.join(process.cwd(), "public")));

// Enhanced Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs for admin routes
  message: {
    success: false,
    message:
      "Too many requests to admin routes from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api/", generalLimiter);

// Security logging middleware
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.log(
    `🔐 ${req.method} ${
      req.originalUrl
    } - IP: ${ip} - ${new Date().toISOString()}`
  );

  // Log sensitive actions
  if (req.method === "POST" && req.body) {
    const logBody = { ...req.body };
    // Hide sensitive information
    if (logBody.password) logBody.password = "[HIDDEN]";
    if (logBody.newPassword) logBody.newPassword = "[HIDDEN]";
    if (logBody.confirmPassword) logBody.confirmPassword = "[HIDDEN]";
    if (logBody.token) logBody.token = "[HIDDEN]";

    console.log("📤 Request Body:", logBody);
  }
  next();
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running securely!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    security: "enhanced",
    database: dbConnected ? "connected" : "disconnected",
  });
});

// Token verification endpoint for frontend - FIXED USAGE
app.get("/api/auth/verify", verifyToken);

// Connect to database
let dbConnected = false;
try {
  await connectDB();
  dbConnected = true;
  console.log("✅ Database connected successfully");
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
  console.log("🛑 Server cannot start without database connection");
  process.exit(1);
}

if (dbConnected) {
  syncAllInventoryStatus();
  console.log("✅ Inventory status synced with products");
}

// Register routes only after successful database connection
if (dbConnected) {
  console.log("📋 Registering secured routes...");

  // Public routes
  app.use("/api/auth", authRoutes);
  app.use("/api/contact", contactRoute);
  app.use("/api/search", searchRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/events", eventRoutes);

  // Protected routes (require authentication)
  app.use("/api/users", userRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/product-reviews", productReviewRoutes);

  // Admin routes (require admin role)
  app.use("/api/admin/orders", adminOrderRoutes);
  app.use("/api/admin/reviews", adminReviewsRoutes);
  app.use("/api/employee", employeeRoutes);
  app.use("/api/banners", bannerRoutes);
  app.use("/api/event-notifications", eventNotificationRoutes);
  app.use("/api/reports", productReportsRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/reports", orderReportRoutes);
  app.use("/api/coupons", couponRoutes);
}

// 404 handler for undefined routes
app.all("*", (req, res) => {
  console.log(
    `🚫 Blocked route attempt: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
  );
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    security: "All routes are protected with role-based access control",
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Secure server running on port ${PORT}`);
  console.log(`📍 Server address: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("🔒 Security Features:");
  console.log("   ✅ Enhanced RBAC (Role-Based Access Control)");
  console.log("   ✅ Rate Limiting on all endpoints");
  console.log("   ✅ Helmet security headers");
  console.log("   ✅ CORS with origin validation");
  console.log("   ✅ Input sanitization and validation");
  console.log("   ✅ JWT token verification");
  console.log("   ✅ Account lockout protection");
  console.log("   ✅ Security logging");
  console.log("✨ Ready to handle secured requests!");
});

// Enhanced error handling
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("✅ Server closed successfully");
    console.log("👋 Goodbye!");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown after 10 seconds");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  console.log("🛑 Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.log("🛑 Shutting down server due to uncaught exception");
  process.exit(1);
});
