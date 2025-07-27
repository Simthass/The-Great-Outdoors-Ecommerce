import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

console.log('🚀 Starting Production Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - More restrictive for production
const authLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 3 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    // Log request body but hide sensitive data
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('📤 Request Body:', logBody);
  }
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Connect to database
let dbConnected = false;
try {
  await connectDB();
  dbConnected = true;
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.log('🛑 Server cannot start without database connection');
  process.exit(1); // Exit if database connection fails
}

// Register routes only after successful database connection
if (dbConnected) {
  console.log('📋 Registering routes...');
  
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered at /api/auth');
  
  app.use('/api/users', userRoutes);
  console.log('✅ User routes registered at /api/users');
  
  console.log('📋 Available routes:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/forgot-password');
  console.log('  POST /api/auth/logout');
  console.log('  GET  /api/auth/verify');
  console.log('  GET  /api/users/profile');
  console.log('  PUT  /api/users/profile');
}

// 404 handler for undefined routes
app.all('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'GET /api/users/profile'
    ]
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '🎉'.repeat(30));
  console.log(`🚀 PRODUCTION SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Register endpoint: http://localhost:${PORT}/api/auth/register`);
  console.log(`📊 Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`🔒 Security: Rate limiting enabled`);
  console.log(`🛡️ CORS: Configured for development`);
  console.log('🎉'.repeat(30));
  console.log('\n✅ Server ready to handle authentication requests!');
  console.log('\n💡 To test login:');
  console.log(`   1. Make sure you have registered users in your database`);
  console.log(`   2. Use valid email/password from your registration`);
  console.log(`   3. Check server logs for detailed request/response info`);
});

// Enhanced error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Solutions:');
    console.log(`   1. Kill existing process: lsof -ti:${PORT} | xargs kill -9`);
    console.log(`   2. Use different port: PORT=5001 npm start`);
    console.log(`   3. Find and stop conflicting process`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    console.log('✅ Server closed successfully');
    console.log('👋 Goodbye!');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.log('🛑 Shutting down server due to unhandled promise rejection');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.log('🛑 Shutting down server due to uncaught exception');
  process.exit(1);
});