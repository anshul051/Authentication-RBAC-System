import User from '../models/User.model.js';
import { getSessionName } from '../utils/deviceDetection.util.js';
import { verifyRefreshToken } from '../utils/jwt.util.js';
import { createAuditLog, getClientIp, getUserAgent } from '../utils/auditLog.util.js';

/**
 * Get all active sessions for current user
 * @route   GET /api/sessions
 * @access  Private
 */
export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get current refresh token to identify current session
    const currentToken = req.cookies.refreshToken;

    // Format sessions for response
    const sessions = user.refreshTokens
      .filter(session => session.expiresAt > Date.now()) // Only active sessions
      .map(session => ({
        tokenId: session.tokenId,
        sessionName: getSessionName(session.device, session.browser, session.os),
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        lastActive: session.lastActive,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: session.token === currentToken, // Mark current session
      }))
      .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive)); // Most recent first

    res.status(200).json({
      success: true,
      data: {
        count: sessions.length,
        sessions,
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      error: error.message,
    });
  }
};

/**
 * Logout from specific session
 * @route   DELETE /api/sessions/:tokenId
 * @access  Private
 */
export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tokenId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find the session
    const sessionIndex = user.refreshTokens.findIndex(
      session => session.tokenId === tokenId
    );

    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Get session info for logging
    const revokedSession = user.refreshTokens[sessionIndex];

    // Remove the session
    user.refreshTokens.splice(sessionIndex, 1);
    await user.save();

    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'USER_LOGOUT',
      details: `User revoked session: ${getSessionName(revokedSession.device, revokedSession.browser, revokedSession.os)}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
      metadata: {
        revokedTokenId: tokenId,
        revokedDevice: revokedSession.device,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session',
      error: error.message,
    });
  }
};

/**
 * Logout from all sessions except current
 * @route   POST /api/sessions/revoke-all
 * @access  Private
 */
export const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentToken = req.cookies.refreshToken;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const sessionsBeforeCount = user.refreshTokens.length;

    // Keep only the current session
    user.refreshTokens = user.refreshTokens.filter(
      session => session.token === currentToken
    );

    const revokedCount = sessionsBeforeCount - user.refreshTokens.length;

    await user.save();

    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'USER_LOGOUT',
      details: `User revoked all sessions except current (${revokedCount} sessions revoked)`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
      metadata: {
        revokedCount,
      },
    });

    res.status(200).json({
      success: true,
      message: `${revokedCount} session(s) revoked successfully`,
      data: {
        revokedCount,
      },
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions',
      error: error.message,
    });
  }
};