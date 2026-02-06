import User from '../models/User.model.js';
import { createAuditLog, getClientIp, getUserAgent } from '../utils/auditLog.util.js';
import { unlockAccount } from '../utils/accountLockout.util.js';

/**
 * Get current user profile
 * @route   GET /api/user/profile
 * @access  Private (requires login)
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const userId = req.user.userId;

    // Find user (exclude password)
    const user = await User.findById(userId).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // LOG PROFILE ACCESS
    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'PROFILE_VIEWED',
      details: 'User viewed their profile',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } // Not equal to current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');


    // LOG PROFILE UPDATE
    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'PROFILE_UPDATED',
      details: 'User updated their profile',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
      metadata: {
        changedFields: email ? ['email'] : [],
        oldEmail: oldUser.email,
        newEmail: user.email,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Admin-only: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });  // Newest first

      // ← LOG ADMIN ACTION
    await createAuditLog({
      userId: req.user.userId,
      email: req.user.email,
      action: 'ADMIN_VIEWED_USERS',
      details: `Admin viewed all users (${users.length} total)`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

/**
 * Unlock user account (admin only)
 * @route   POST /api/user/unlock/:userId
 * @access  Private (admin)
 */
export const unlockUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await unlockAccount(userId);

    await createAuditLog({
      userId: req.user.userId,
      email: req.user.email,
      action: 'ADMIN_VIEWED_USERS',
      details: `Admin unlocked account for ${user.email}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
      metadata: {
        unlockedUserId: userId,
        unlockedUserEmail: user.email,
      },
    });

    res.status(200).json({
      success: true,
      message: `Account unlocked for ${user.email}`,
    });
  } catch (error) {
    console.error('Unlock account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock account',
      error: error.message,
    });
  }
};