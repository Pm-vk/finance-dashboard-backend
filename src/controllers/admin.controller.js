const userModel = require('../models/user.model');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Update user role or status (Admin Only).
 */
const updateUserRoleController = asyncHandler(async (req, res) => {
    const { userId, role, status } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, "User updated successfully")
    );
});

/**
 * List all users (Admin/Analyst Only).
 */
const getAllUsersController = asyncHandler(async (req, res) => {
    const users = await userModel.find().select("-password");
    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});

module.exports = {
    updateUserRoleController,
    getAllUsersController
};
