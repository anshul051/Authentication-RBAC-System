import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks by limiting the number of requests from a single IP address
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,  //Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate Limit info in the 'RateLimit-* headers
    legacyHeaders: false, // Disable the 'X-RateLimit-*' headers
    // Store rate Limit data in memory (for development)
    // In production, use Redis or similar to share rate limit data across multiple servers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again after 15 minutes',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60), //Minutes
        });
    },
});

/**
 * More lenient rate Limiter for registration endpoint
 * Prevent abuse while allowing legitimate users to register
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registrations per hour
    message: {
        success: false,
        message: 'Too many registration attempts from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legaxyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many registration attempts from this IP, please try again after an hour',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60) // Minutes
        });
    },
});

/**
 * General purpose rate limiter for all API endpoints
 * Limits the number of requests to prevent abuse
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});