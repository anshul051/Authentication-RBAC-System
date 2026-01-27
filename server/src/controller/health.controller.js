import mongoose from 'mongoose'; // ← New

/**
 * Basic health check
 * Returns server status without database checks
 */
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Detailed health check
 * Includes database connection status, memory usage, response time
 */
export const detailedHealthCheck = async (req, res) => {
  const startTime = Date.now(); // ← Track how long this takes
  
  // Check database connection
  const dbStatus = mongoose.connection.readyState === 1 
    ? 'connected' 
    : 'disconnected';
  
  const isHealthy = dbStatus === 'connected';
  
  // Gather system info
  const healthData = {
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
  
  // Return 503 if database is down
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthData);
};