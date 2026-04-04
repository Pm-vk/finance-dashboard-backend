const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const emailService = require("../services/email.services");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Register a new user.
 */
const userRegisterController = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({ email });
    if (isExists) {
        throw new ApiError(422, "User with this email already exists");
    }

    const user = await userModel.create({
        email,
        password,
        name
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });

    // Send welcome email (asynchronous, don't wait for it to respond to user)
    emailService.sendRegistrationEmail(user.email, user.name).catch(err => console.error("Email Error:", err));

    return res.status(201).json(
        new ApiResponse(201, {
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            },
            token
        }, "User registered successfully")
    );
});

/**
 * Login an existing user.
 */
const userLoginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json(
        new ApiResponse(200, {
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            },
            token
        }, "Login successful")
    );
});

module.exports = { 
    userRegisterController, 
    userLoginController 
};