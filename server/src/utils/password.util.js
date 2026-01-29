import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
    const saltRounds = 10; // How many times to hash
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}