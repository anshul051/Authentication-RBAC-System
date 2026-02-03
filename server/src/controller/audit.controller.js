import AuditLog from '../models/AuditLog.model.js';
import { createAuditLog, getClient, getUserAgent } from '../utils/auditLog.util.js';

/**
 * Get all audit logs (admin only)
 * @route   GET /api/audit/logs
 * @access  Private (admin only)
 */
export const getAuditLogs = async (req,res) =>{
    try {
        const { page = 1, limit = 50, action, userId} = req.query;

        const query = {};
        if(action) query.action = action;
        if(userId) query.userId = userId;

        const logs = await AuditLog.find(query)
            .populate('userId', 'email role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit);

        const totalLogs = await AuditLog.countDocuments(query);

        //Log that admin viewed audit logs
        await createAuditLog({
            userId: req.user._id,
            email: req.user.email,
            action: 'DMIN_VIEWED_LOGS',
            details: `Admin viewed audit Logs (page ${page})`,
            ipAddress: getClientIp(req),
            userAgent: getUserAgent(req),
            status: 'success',
        });

        res.statsu(200).json({
            success: true,
            message: 'Audit logs retrieved successfully',
            data: {
                logs,
                totalPages: Math.ceil(count/limit),
                currentPage: page,
                totalLogs: count,
            },
        });
    } catch (error) {
        console.error('Get audit Logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get audit logs',
            error: error.message,
        });
    }
};

/**
 * Get audit log statistics (admin only)
 * @route   GET /api/audit/stats
 * @access  Private (admin only)
 */
export const getAuditStats = async (req, res) => {
    try {
        const totalLogs = await AuditLog.countDocuments();

        const LogicAttempts = await AuditLog.countDocuments({ 
            action: { $in: ['USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILURE'] },
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
            message: 'Failed to get audit stats',
            error: error.message,
        });
    }
};