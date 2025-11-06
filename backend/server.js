// Load environment variables FIRST before anything else
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const vehicleRoutes = require('./routes/vehicles');
const serviceRoutes = require('./routes/services');
const workLogRoutes = require('./routes/workLogs');
const dashboardRoutes = require('./routes/dashboard');
const serviceRecordRoutes = require('./routes/serviceRecords');
const profileRoutes = require('./routes/profile');


const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from requests

// Security middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/work-logs', workLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/service-records', serviceRecordRoutes);
app.use('/api/profile', profileRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MERN App API is working 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check route for authentication service
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication service is healthy',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      server: 'running'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler - must be last route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/employee/login',
      'POST /api/auth/customer/signup',
      'POST /api/auth/customer/send-otp',
      'POST /api/auth/customer/verify-otp',
      'GET /api/auth/profile',
      'POST /api/appointments',
      'GET /api/appointments',
      'GET /api/vehicles',
      'GET /api/services',
      'GET /api/work-logs',
      'GET /api/dashboard/stats'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Tips:');
    console.log('  - For local MongoDB: Install and start MongoDB locally');
    console.log('  - For MongoDB Atlas: Update MONGODB_URI in .env with real credentials');
    console.log('  - The server will continue running, but database features will not work');
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
});
