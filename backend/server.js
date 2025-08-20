const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deliveryRoutes = require('./routes/deliveries');
const alertRoutes = require('./routes/alerts');
const sharedTruckRoutes = require('./routes/sharedTrucks');
const microWarehouseRoutes = require('./routes/microWarehouses');
const dashboardRoutes = require('./routes/dashboard');


// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { auth } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://cargocrazee.netlify.app',
      'https://*.netlify.app'
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      (allowedOrigin.includes('*') && origin.includes(allowedOrigin.split('*')[0]))
    )) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  // In development allow much higher throughput to avoid accidental 429s while testing
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 100),
  standardHeaders: true,
  legacyHeaders: false,
  // Ensure the frontend receives a `message` field which it expects
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Only enable strict rate limit middleware in non-development environments
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/', limiter);
}

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CargoCrazee API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/deliveries', auth, deliveryRoutes);
app.use('/api/alerts', auth, alertRoutes);
app.use('/api/shared-trucks', auth, sharedTruckRoutes);
app.use('/api/micro-warehouses', auth, microWarehouseRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 CargoCrazee Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

startServer();

module.exports = app;
