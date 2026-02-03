import { createAuditLog, getClientIp, getUserAgent } from '../utils/auditLog.util.js';

/**
 * Audit middleware - logs access to protected routes
 */
export const auditLogMiddleware = async (req, res, next) => {
    return async (req, res, next) => {
        try {
            // req.user is set by authentication middleware
            if(req.user) {
                await createAuditLog({
                    userId: req.user._id,
                    email: req.user.email,
                    action,
                    details: details || `Accessed ${req.method} ${req.originalUrl}`,
                    ipAddress: getClientIp(req),
                    userAgent: getUserAgent(req),
                    status: 'success',
                });
            }
            next();
        } catch (error) {
            console.error('Audit Log Middleware Error:', error);
            next();
        }
    };
};