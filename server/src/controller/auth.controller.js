import User from '../models/user.model.js';
import { hashPassword } from '../utils/password.utils.js';

/**
 * Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Validate input
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // 3. Hash Password
        const hashedPassword = await hashPassword(password);

        // 4. Create new user
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'user', // default role is 'user' if not provided
        });

        // 5. Return success (don't send password back)
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
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Registqration failed. Please try again later.',
            error: error.message,
        });
    }
};