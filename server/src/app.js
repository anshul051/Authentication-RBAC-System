import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import healthRoute from './routes/health.route.js';
// Import error handler middleware
import errorHandler from './middleware/error.middleware.js';

const app = express();

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true, // Allow cookies to be sent
}));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/health', healthRoute);

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler - must be last
app.use(errorHandler);

export default app;