const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const transactionModel = require('../models/transaction.model');
const logService = require('./log.service');

/**
 * Perform a fund transfer between two users atomically with idempotency.
 */
async function transferFunds(senderId, receiverId, amount, idempotencyKey, notes = "Fund Transfer") {
    // 0. Check for existing transaction with the same idempotency key
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });
    if (existingTransaction) {
        existingTransaction.isDuplicate = true;
        return existingTransaction;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find and update sender's account
        const sender = await userModel.findOneAndUpdate(
            { _id: senderId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error("Insufficient balance or sender not found");
        }

        // 2. Find and update receiver's account
        const receiver = await userModel.findOneAndUpdate(
            { _id: receiverId },
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!receiver) {
            throw new Error("Receiver not found");
        }

        // 3. Create a transaction record with Category and Type (Zorvyn Requirement)
        const transaction = await transactionModel.create(
            [{
                senderId,
                receiverId,
                amount,
                type: "transfer",
                category: "Other", // Generic category for transfers
                notes,
                status: "success",
                idempotencyKey
            }],
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        logService.createLog(senderId, "TRANSFER", "success", { receiverId, amount, transactionId: transaction[0]._id });
        
        return transaction[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // Optional: Save a failed record
        try {
            await transactionModel.create({
                senderId,
                receiverId,
                amount,
                type: "transfer",
                status: "failed",
                idempotencyKey
            });
        } catch (e) {}

        logService.createLog(senderId, "TRANSFER", "failed", { receiverId, amount, error: error.message });
        throw error;
    }
}

/**
 * Get filtered and paginated transactions for a user.
 * Supports filtering by type, category, and date range (Zorvyn Requirement 2).
 */
async function getUserTransactions(userId, { 
    page = 1, 
    limit = 10, 
    type, 
    category, 
    startDate, 
    endDate 
}) {
    const skip = (page - 1) * limit;

    // 1. Base Query: User must be sender OR receiver
    const query = {
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    };

    // 2. Add Filters
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

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
 */
async function getTransactionDetails(transactionId, userId) {
    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    // Check if user is either sender or receiver
    const isSender = transaction.senderId && transaction.senderId.toString() === userId.toString();
    const isReceiver = transaction.receiverId && transaction.receiverId.toString() === userId.toString();

    if (!isSender && !isReceiver) {
        throw new Error("You are not authorized to view this transaction");
    }

    return transaction;
}

module.exports = {
    transferFunds,
    getUserTransactions,
    getTransactionDetails
};
