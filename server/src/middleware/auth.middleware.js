import { verifyAccessToken } from '../utils/jwt.util.js';

/**
 * Authentication middleware
 * Verifies access token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Get access token from cookies
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided. Please login.',
      });
    }

    // 2. Verify token
    const decoded = verifyAccessToken(accessToken);

    // 3. Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // 4. Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};