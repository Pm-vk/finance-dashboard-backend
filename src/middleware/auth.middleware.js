const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Authentication Middleware
 * Verifies JWT token and checks if user exists and is active.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            throw new ApiError(401, "Unauthorized: User no longer exists");
        }

        // Check if user account is active (Zorvyn Assignment Requirement)
        if (user.status !== "active") {
            throw new ApiError(403, "Forbidden: Your account has been deactivated. Please contact support.");
        }

        req.user = user;
        return next();
    } catch (err) {
        throw new ApiError(401, "Unauthorized: Invalid or expired token");
    }
});

module.exports = authMiddleware;