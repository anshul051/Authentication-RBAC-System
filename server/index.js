import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import healthRoute from './src/routes/health.route.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import connectDB from './src/db/connect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);  // ← This line is critical!
app.use('/api/user', userRoutes);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`👤 User: http://localhost:${PORT}/api/user`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();