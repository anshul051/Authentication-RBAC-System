import User from '../models/User.model.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { createAuditLog, getClientIp, getUserAgent } from '../utils/auditLog.util.js';
import { 
  generateAccessToken, 
  generateRefreshToken,
  generateTokenId,
  verifyRefreshToken,
  verifyAccessToken
} from '../utils/jwt.util.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    // ADD AUDIT LOG ENTRY
    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'USER_REGISTERED',
      details: `New user registered with email: ${user.email} and role: ${user.role}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      // LOG FAILED LOGIN ATTEMPT
      await createAuditLog({
        email,
        action: 'USER_LOGIN_FAILED',
        details: `Failed Login attempt with email: ${email}`,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        status: 'failure',
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      // LOG FAILED LOGIN ATTEMPT
      await createAuditLog({
        userId: user._id,
        email: user.email,
        action: 'USER_LOGIN_FAILED',
        details: `Failed Login attempt with email: ${user.email}`,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        status: 'failure',
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessTokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(accessTokenPayload);
    
    const tokenId = generateTokenId();
    const refreshTokenPayload = {
      userId: user._id,
      tokenId,
    };
    
    const refreshToken = generateRefreshToken(refreshTokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt,
    });
    
    await user.save();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // LOG SUCCESSFUL LOGIN
    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'USER_LOGIN_SUCCESS',
      details: `User logged in successfully with email: ${user.email}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'No refresh token provided',
            });
        }

        // Verify the token and get user ID
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and remove the refresh token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Remove the refresh token from the DB
        user.refreshTokens = user.refreshTokens.filter(
            (tokenObj) => tokenObj.token !== refreshToken
        );

        await user.save();

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        // LOG LOGOUT ACTION
        await createAuditLog({
          userId: user._id,
          email: user.email,
          action: 'USER_LOGOUT',
          details: `User logged out with email: ${user.email}`,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          status: 'success',
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message,
        });
    }
};

/**
 * Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (but needs valid refresh token)
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if this refresh token exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if refresh token exists in database
    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const accessTokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };
    
    const newAccessToken = generateAccessToken(accessTokenPayload);
    
    const tokenId = generateTokenId();
    const refreshTokenPayload = {
      userId: user._id,
      tokenId,
    };
    
    const newRefreshToken = generateRefreshToken(refreshTokenPayload);

    // Remove old refresh token and add new one (token rotation)
    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken
    );
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt,
    });
    
    await user.save();

    // Set new cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // LOG TOKEN REFRESH ACTION
    await createAuditLog({
      userId: user._id,
      email: user.email,
      action: 'TOKEN_REFRESH',
      details: `Tokens refreshed for user with email: ${user.email}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};

/**
 * Authentication middleware 
 * Verifies access token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided',
      });
    }

    //2. Verify token
    const decoded = verifyAccessToken(accessToken);

    //3. Attach user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    //4. Continue to next middleware/calculator
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};