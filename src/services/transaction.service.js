const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const transactionModel = require('../models/transaction.model');

/**
 * Perform a fund transfer between two users atomically with idempotency.
 * @param {string} senderId - ID of the sender (User)
 * @param {string} receiverId - ID of the receiver (User)
 * @param {number} amount - Amount to transfer
 * @param {string} idempotencyKey - Unique key to prevent duplicate transactions
 * @returns {Promise<Object>} - The created or existing transaction record
 */
async function transferFunds(senderId, receiverId, amount, idempotencyKey) {
    // 0. Check for existing transaction with the same idempotency key
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });
    if (existingTransaction) {
        existingTransaction.isDuplicate = true;
        return existingTransaction;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find and update sender's account with decrementing balance
        const sender = await userModel.findOneAndUpdate(
            { _id: senderId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error("Insufficient balance or sender not found");
        }

        // 2. Find and update receiver's account with incrementing balance
        const receiver = await userModel.findOneAndUpdate(
            { _id: receiverId },
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!receiver) {
            throw new Error("Receiver not found");
        }

        // 3. Create a transaction record
        const transaction = await transactionModel.create(
            [{
                senderId,
                receiverId,
                amount,
                status: "success",
                idempotencyKey
            }],
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return transaction[0];

    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        session.endSession();

        // Optional: Save a failed transaction record here (outside the session) 
        // to keep a history of failed attempts.
        try {
            await transactionModel.create({
                senderId,
                receiverId,
                amount,
                status: "failed",
                idempotencyKey
            });
        } catch (e) {
            // Ignore if the key already exists (race condition)
        }

        throw error;
    }
}

/**
 * Get all transactions for a specific user (as sender or receiver).
 * @param {string} userId - ID of the logged-in user
 * @param {Object} options - Pagination options { page, limit }
 * @returns {Promise<Object>} - Transactions and total count
 */
async function getUserTransactions(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const query = {
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    };

    const transactions = await transactionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await transactionModel.countDocuments(query);

    return {
        transactions,
        total,
        page: Number(page),
        limit: Number(limit)
    };
}

/**
 * Get detailed info for a single transaction.
 * @param {string} transactionId - ID of the transaction
 * @param {string} userId - ID of the user requesting details
 * @returns {Promise<Object>} - Transaction details
 */
async function getTransactionDetails(transactionId, userId) {
    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    // Check if user is either sender or receiver
    if (transaction.senderId.toString() !== userId.toString() && 
        transaction.receiverId.toString() !== userId.toString()) {
        throw new Error("You are not authorized to view this transaction");
    }

    return transaction;
}

module.exports = {
    transferFunds,
    getUserTransactions,
    getTransactionDetails
};
