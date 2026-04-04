const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

/**
 * Global Error Handling Middleware for Express.
 * Standardizes all errors (Sync, Async, Zod, Mongoose) into a consistent JSON format.
 */
const errorMiddleware = (err, req, res, next) => {
    let error = err;

    // 1. If error is not an instance of ApiError, convert it
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // 2. Extract standardized response
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Show stack only in dev
    };

    return res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;
