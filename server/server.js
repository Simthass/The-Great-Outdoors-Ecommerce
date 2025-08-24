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
import reviewsRouter from "./routes/review.js";
import searchRoutes from "./routes/search.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Trust proxy for rate limiting behind reverse proxies
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(express.static("public"));

// CORS configuration - MUST be before other middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
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

// Handle preflight requests
app.options("*", cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Add both common ports
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Static files middleware
app.use(
  "/products",
  express.static(path.join(process.cwd(), "public/products"))
);
app.use(express.static(path.join(process.cwd(), "public")));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//     limits: {
//       fileSize: 5 * 1024 * 1024, // 5MB limit
//       files: 1,
//     },
//     abortOnLimit: true,
//     responseOnLimit: "File size exceeds the 5MB limit",
//     safeFileNames: true,
//     preserveExtension: true,
//   })
// );

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: {
    success: false,
    message:
      "Too many login attempts from this IP, please try again after 3 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
app.use("/api/", generalLimiter);
app.use("/api/contact", contactRoute);

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `📝 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`
  );
  if (req.method === "POST" && req.body && Object.keys(req.body).length > 0) {
    // Log request body but hide sensitive data
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "[HIDDEN]";
    if (logBody.newPassword) logBody.newPassword = "[HIDDEN]";
    if (logBody.confirmPassword) logBody.confirmPassword = "[HIDDEN]";
    console.log("📤 Request Body:", logBody);
  }
  next();
});

// Health check route
app.get("/api/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    database: dbConnected ? "connected" : "disconnected",
  });
});

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

// Register routes only after successful database connection
if (dbConnected) {
  console.log("📋 Registering routes...");

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/employee", employeeRoutes);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/search", searchRoutes);
}

// 404 handler for undefined routes
app.all("*", (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/users/profile",
      "GET /api/products",
      "GET /api/categories",
      "GET /api/cart",
    ],
  });
});
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {});

// Enhanced error handling
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log("💡 Solutions:");
    console.log(
      `   1. Kill existing process: lsof -ti:${PORT} | xargs kill -9`
    );
    console.log(`   2. Use different port: PORT=5001 npm start`);
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
