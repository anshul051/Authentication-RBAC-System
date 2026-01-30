import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate Access Token (short-lived, 15 minutes)
 * Used for authenticating API requests
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

/**
 * Generate Refresh Token (long-lived, 7 days)
 * Used for getting new access tokens
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

/**
 * Verify Access Token
 * Returns decoded payload if valid, throws error if invalid/expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 * Returns decoded payload if valid, throws error if invalid/expired
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate unique token ID for refresh tokens
 * Used to track and revoke specific tokens
 */
export const generateTokenId = () => {
  return crypto.randomBytes(32).toString('hex');
};