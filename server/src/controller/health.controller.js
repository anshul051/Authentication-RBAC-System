import mongoose from 'mongoose';

/**
 * Health check controller
 * Used by load balancers, monitoring tools, and deployment platforms
 * to verify service availability
 */

// Basic health check - just checks if server is responding
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
};

// Detailed health check - includes database connection status
export const detailedHealthCheck = async (req, res) => {
  const startTime = Date.now();
  
  // Check database connection
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const isHealthy = dbStatus === 'connected';

  const healthData = {
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // seconds since server started
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'N/A',
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  // Return 503 if database is down (tells load balancers to route traffic elsewhere)
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthData);
};