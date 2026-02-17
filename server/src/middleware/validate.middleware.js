import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 * Always use this after the validation rules
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }

    next();
}

/**
 * Validation rules for user regitration
 */
export const validateRegister = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(), // Converts to lowercase and removes dots for Gmail addresses
    
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters Long')
        .isLength({ max: 50 })
        .withMessage('Password must be at most 50 characters Long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .optional() // Role is optimal (default to 'user)
        .trim()
        .isIn(['user', 'admin', 'manager'])
        .withMessage('Role must be one of the following: user, admin, manager'),

    handleValidationErrors, // Always Last in the array
];

/**
 * Validation rules for user Login
 */
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(), // Converts to lowercase and removes dots for Gmail addresses
    
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors, // Always Last in the array
];

/**
 * Validation rules for updating user profile
 */
export const validateUpdateProfile = [
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(), // Converts to lowercase and removes dots for Gmail addresses
    
    handleValidationErrors, // Always Last in the array
];