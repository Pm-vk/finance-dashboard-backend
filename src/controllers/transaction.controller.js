const transactionService = require('../services/transaction.service');
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * Handle fund transfers between users.
 * Supports idempotency via the x-idempotency-key header.
 */
const transferController = asyncHandler(async (req, res) => {
    const senderId = req.user._id;
    const { receiverId, amount } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];

    // 1. Precautionary: Prevent self-transfers (Business Rule)
    if (senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, "Cannot transfer money to yourself");
    }

    // 2. Call Service with Idempotency Key
    const transaction = await transactionService.transferFunds(senderId, receiverId, amount, idempotencyKey);
    
    // 3. Handle Duplicate/Replayed Request
    if (transaction.isDuplicate) {
        res.setHeader('x-idempotent-replayed', 'true');
        return res.status(200).json(
            new ApiResponse(200, transaction, "Duplicate request detected. Returning previous response.")
        );
    }

    // 4. Successful Transaction
    return res.status(201).json(
        new ApiResponse(201, transaction, "Transfer successful")
    );
});

/**
 * Get transaction history for current user.
 */
const getTransactionsController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page, limit } = req.query;

    const history = await transactionService.getUserTransactions(userId, { page, limit });
    return res.status(200).json(
        new ApiResponse(200, history, "Transactions fetched successfully")
    );
});

/**
 * Get specific transaction details.
 */
const getTransactionByIdController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await transactionService.getTransactionDetails(id, userId);
    return res.status(200).json(
        new ApiResponse(200, transaction, "Transaction details fetched successfully")
    );
});

module.exports = {
    transferController,
    getTransactionsController,
    getTransactionByIdController
};
