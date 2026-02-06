import User from '../models/User.model.js';

// Configuration for account lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Increment failed login attempts
 * Lock account if max attempts exceeded
 */
export const incrementLoginAttempts = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Increment login attempts
        user.loginAttempts += 1;

        // Check if max attempts exceeded
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock account for 30 minutes
            user.lockUntil = Date.now() + LOCK_TIME;
            console.log(`Account locked: ${user.email} until ${user.lockUntil}`);
        }

        await user.save();
    } catch (error) {
        console.error('Error incrementing login attempts:', error);
    }
};

/**
 * Reset login attempts on successful login
 */
export const resetLoginAttempts = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $set: {
                loginAttempts: 0,
                lockUntil: null,
            },
        });
    } catch (error) {
        console.error('Error resetting login attempts:', error);
    }
};

/**
 * Check if account is locked
 * Returns { isLocked: boolean, lockUntil: Date/null }
 */
export const checkAccountLock = async (userId) => {
    try {
        const user = await User.findById(userId);

        if(!user) {
            return { isLocked: false, lockUntil: null };
        }

        // Check if lock has expired
        if (user.lockUntil && user.lockUntil < Date.now()) {
            // Lock expired, reser 
            await resetLoginAttempts(userId);
            return { isLocked: false, lockUntil: null };
        }

        return { 
            isLocked: user.isLocked, 
            lockUntil: user.lockUntil,
            attemptsRemaining: MAX_LOGIN_ATTEMPTS - user.loginAttempts,
        }
    } catch (error) {
        console.error('Error checking account lock:', error);
        return { isLocked: false, lockUntil: null };
    }
};

/**
 * Manually unlock account (for admin only)
 */
export const unlockAccount = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $set: {
                loginAttempts: 0,
                lockUntil: null,
            },
        });
        console.log(`Account manually unlocked: ${userId}`);
    } catch (error) {
        console.error('Error unlocking account:', error);
    }
};