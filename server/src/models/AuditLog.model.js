import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Not required for failed login attempts
        },
        email: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                'USER_REGISTERED',
                'USER_LOGIN_SUCCESS',
                'USER_LOGIN_FAILED',
                'USER_LOGOUT',
                'TOKEN_REFRESHED',
                'PROFILE_VIEWED',
                'PROFILE_UPDATED',
                'ADMIN_VIEWED_USERS',
                'ADMIN_VIEWED_USER',
                'PASSWORD_CHANGED',
                'UNAUTHORIZED_ACCESS_ATTEMPT',
            ],
        },

        details: {
            type: String,
            default: '',
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['success', 'failure', 'warning'],
            default: 'success',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,  // Flexible field for extra data
            default: {},
        },
    },
    {
        timestamps: true, // Adds createdAt and updateAt fields
    }
);

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;