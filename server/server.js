import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS: allow only known client origins ──
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsers ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Logging (dev only) ──
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Rate limiters (before all /api routes) ──
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// ── Static files (uploads) ──
app.use('/uploads', express.static('uploads'));

// ── API routes ──
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Root ──
app.get('/', (req, res) => {
  res.json({
    message: 'HireHub API running 🚀',
    docs: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      dashboard: '/api/dashboard',
      admin: '/api/admin',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      upload: '/api/upload',
    },
  });
});

// ── Error handling (must be last) ──
app.use(notFound);
app.use(errorHandler);

// ── Start ──
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  });
};

start();