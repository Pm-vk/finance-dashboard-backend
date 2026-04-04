const ApiError = require("../utils/ApiError");

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Restricts access to a set of specific roles.
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['Admin', 'Analyst'])
 */
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized: Authentication required before role check");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Forbidden: This action requires one of the following roles: ${roles.join(", ")}. Your current role is: ${req.user.role}`);
        }

        next();
    };
};

module.exports = authorize;
