module.exports = (allowedRoles) => {
    return (req, res, next) => {
        // Handle both single string and array of roles
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of the following roles: ${roles.join(", ")}`
            });
        }

        next();
    };
};