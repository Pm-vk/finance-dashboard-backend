const transactionService = require('../services/transaction.service');
const mongoose = require('mongoose');

/**
 * Handle fund transfers between users.
 * Supports idempotency via the x-idempotency-key header.
 */
async function transferController(req, res) {
    const senderId = req.user._id;
    const { receiverId, amount } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];

    // 1. Validate Idempotency Key
    if (!idempotencyKey) {
        return res.status(400).json({
            message: "Missing x-idempotency-key header. This is required to prevent duplicate transactions."
        });
    }

    // 2. Validate Input Presence
    if (!receiverId || !amount) {
        return res.status(400).json({
            message: "Missing receiver ID or amount"
        });
    }

    // 3. Precautionary: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({
            message: "Invalid receiver ID format"
        });
    }

    // 4. Precautionary: Prevent self-transfers
    if (senderId.toString() === receiverId.toString()) {
        return res.status(400).json({
            message: "Cannot transfer money to yourself"
        });
    }

    // 5. Validate Amount
    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
    }

    try {
        // 6. Call Service with Idempotency Key
        const transaction = await transactionService.transferFunds(senderId, receiverId, amount, idempotencyKey);
        
        // 7. Handle Duplicate/Replayed Request
        if (transaction.isDuplicate) {
            res.setHeader('x-idempotent-replayed', 'true');
            return res.status(200).json({
                message: "Duplicate request detected. Returning previous response.",
                transaction
            });
        }

        // 8. Successful Transaction
        res.status(201).json({
            message: "Transfer successful",
            transaction
        });

    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(400).json({
            message: error.message || "An error occurred during the transfer"
        });
    }
}

async function getTransactionsController(req, res) {
    const userId = req.user._id;
    const { page, limit } = req.query;

    try {
        const history = await transactionService.getUserTransactions(userId, { page, limit });
        res.status(200).json(history);
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({
            message: "An error occurred while fetching transactions"
        });
    }
}

async function getTransactionByIdController(req, res) {
    const userId = req.user._id;
    const { id } = req.params;

    try {
        const transaction = await transactionService.getTransactionDetails(id, userId);
        res.status(200).json(transaction);
    } catch (error) {
        console.error("Fetch Transaction Error:", error);
        res.status(error.message.includes("authorized") ? 403 : 404).json({
            message: error.message || "An error occurred while fetching the transaction"
        });
    }
}

module.exports = {
    transferController,
    getTransactionsController,
    getTransactionByIdController
};
