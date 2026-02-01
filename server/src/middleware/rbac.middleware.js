/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the user has the required role to access a specific route.
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        //req.user is set by authentication middleware
        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No user information found'
            });
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: Reuired roles: ${allowedRoles.join(', ')}`,
            });
        }

        // User has the required role, proceed to the next middleware/route handler
        next();
    };
};