import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */

export const hashPassword = async (password) => {
    const saltRounds = 10; // How many times to hash
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password from login
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}