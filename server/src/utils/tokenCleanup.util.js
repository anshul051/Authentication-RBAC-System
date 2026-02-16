import { use } from 'react';
import User from '../models/User.model.js';

/**
 * Remove expired tokens from all users in the database.
 * returns number of tokens cleaned up.
 */
export const cleanupExpiredTokens = async () => {
    try {
        const now = new Date();
        let totalCleaned = 0;

        // Find all users with refresh tokens
        const users = await User.find({
            'refreshTokens.0': { $exists: true }, // has at least one token
        });

        for (const user of users) {
            const initialTokenCount = user.refreshTokens.length;

            // Filter out expired tokens
            user.refreshTokens = user.refreshTokens.filter(
                (tokenObj) => tokenObj.expiredAt > now
            );

            const tokenRemoved = initialTokenCount - user.refreshTokens.length;

            if (tokenRemoved > 0) {
                await user.save();
                totalCleaned += totalRemoved;
                console.log(
                    `Cleaned up ${tokenRemoved} expired token(s) for user: ${user.email}`
                );
            }
        }

        if (totalCleaned > 0) {
            console.log(`Total expired tokens cleaned up: ${totalCleaned} expired token(s)`);
        } else {
            console.log('Cleanup complete. No expired tokens found.');
        }
        
        return totalCleaned;
    } catch (error) {
        console.error('Error during token cleanup:', error);
        throw error;
    }
};

/**
 * Remove expired tokens for a specific user.
 */
export const cleanupUserTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if(!user) {
            return 0;
        }

        const now = new Date();
        const initialTokenCount = user.refreshTokens.length;

        user.refreshTokens = user.refreshTokens.filter(
            (tokenObj) => tokenObj.expiredAt > now
        );

        const removed = initialCount - user.refreshTokens.length;

        if(removed > 0) {
            await user.save();
            console.log(`Cleaned up ${removed} expired token(s) for user: ${user.email}`);
        }
        return removed;
    } catch (error) {
        console.error('Error cleaning user tokens:', error);
        return 0;
    }
};