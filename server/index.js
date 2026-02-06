import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import healthRoute from './src/routes/health.route.js';
import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.route.js';
import connectDB from './src/db/connect.js';
import auditRoutes from './src/routes/audit.route.js';
import { generalLimiter } from './src/middleware/rateLimiter.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter); // Apply general rate limiter to all routes
// Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);  // ← This line is critical!
app.use('/api/user', userRoutes);
app.use('/api/audit', auditRoutes);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🛡️ Rate limiting enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();