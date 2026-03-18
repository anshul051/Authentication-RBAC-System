import User from '../models/User.model.js';

/**
 * Remove expired refresh tokens from all users
 * Returns number of tokens cleaned up
 */
export const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();
    let totalCleaned = 0;

    // Find all users with refresh tokens
    const users = await User.find({
      'refreshTokens.0': { $exists: true }, // Has at least one token
    });

    for (const user of users) {
      const initialTokenCount = user.refreshTokens.length;

      // Filter out expired tokens
      user.refreshTokens = user.refreshTokens.filter(
        (tokenObj) => tokenObj.expiresAt > now
      );

      const tokensRemoved = initialTokenCount - user.refreshTokens.length;

      if (tokensRemoved > 0) {
        await user.save();
        totalCleaned += tokensRemoved;
        console.log(
          `🧹 Cleaned ${tokensRemoved} expired token(s) for user: ${user.email}`
        );
      }
    }

    if (totalCleaned > 0) {
      console.log(`✅ Cleanup complete: Removed ${totalCleaned} expired tokens`);
    } else {
      console.log('✅ Cleanup complete: No expired tokens found');
    }

    return totalCleaned;
  } catch (error) {
    console.error('❌ Token cleanup failed:', error);
    throw error;
  }
};

/**
 * Remove expired tokens for a specific user
 */
export const cleanupUserTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return 0;
    }

    const now = new Date();
    const initialCount = user.refreshTokens.length;

    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.expiresAt > now
    );

    const removed = initialCount - user.refreshTokens.length;

    if (removed > 0) {
      await user.save();
      console.log(`🧹 Cleaned ${removed} expired token(s) for user: ${user.email}`);
    }

    return removed;
  } catch (error) {
    console.error('Error cleaning user tokens:', error);
    return 0;
  }
};