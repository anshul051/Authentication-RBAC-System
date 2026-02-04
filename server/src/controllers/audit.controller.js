import AuditLog from '../models/AuditLog.model.js';
import { createAuditLog, getClientIp, getUserAgent } from '../utils/auditLog.util.js';

/**
 * Get all audit logs (admin only)
 * @route   GET /api/audit/logs
 * @access  Private (admin)
 */
export const getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate('userId', 'email role')  // Include user details
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    // Log that admin viewed logs
    await createAuditLog({
      userId: req.user.userId,
      email: req.user.email,
      action: 'ADMIN_VIEWED_LOGS',
      details: `Admin viewed audit logs (page ${page})`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count,
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message,
    });
  }
};

/**
 * Get audit logs for specific user (admin only)
 * @route   GET /api/audit/user/:userId
 * @access  Private (admin)
 */
export const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count,
      },
    });
  } catch (error) {
    console.error('Get user logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user logs',
      error: error.message,
    });
  }
};

/**
 * Get audit log statistics (admin only)
 * @route   GET /api/audit/stats
 * @access  Private (admin)
 */
export const getAuditStats = async (req, res) => {
  try {
    const totalLogs = await AuditLog.countDocuments();
    
    const loginAttempts = await AuditLog.countDocuments({
      action: { $in: ['USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILED'] },
    });

    const failedLogins = await AuditLog.countDocuments({
      action: 'USER_LOGIN_FAILED',
    });

    const recentLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'email role');

    const actionCounts = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        loginAttempts,
        failedLogins,
        successRate: loginAttempts > 0 
          ? ((loginAttempts - failedLogins) / loginAttempts * 100).toFixed(2) 
          : 0,
        recentLogs,
        actionCounts,
      },
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit statistics',
      error: error.message,
    });
  }
};