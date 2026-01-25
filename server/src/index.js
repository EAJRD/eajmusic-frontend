import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.js';
import artistRoutes from './routes/artist.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Initialize
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static files for uploads (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('uploads'));
}

// ===========================================
// ROUTES
// ===========================================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed',
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    EAJMUSIC API SERVER                    ║
╠═══════════════════════════════════════════════════════════╣
║  Status:      RUNNING                                     ║
║  Port:        ${PORT}                                         ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(41)}║
║  API URL:     http://localhost:${PORT}/api                    ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { prisma };
