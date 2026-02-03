import AuditLog from '../models/AuditLog.model.js';

/**
 * Create an audit log entry
 */
export const createAuditLog = async ({
    userId = null,
    email = '',
    action,
    details = '',
    ipAddress,
    userAgent = '',
    status = 'success',
    metadata = {},
}) => {
    try {
        const log = await AuditLog.create({
            userId,
            email,
            action,
            details,
            ipAddress,
            userAgent,
            status,
            metadata,
        });

        console.log(`Audit Log: ${action} - ${email || userId || 'Anonymous'}`);
        return log;
    } catch (error) {
        console.error('Error creating audit Log:', error);
        // Don't throw error - logging should never break app functionality
    }
};

/**
 * Get IP address from request
 */
export const getIpAddress = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown'
    );
};

/**
 * Get User-Agent from request
 */
export const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};