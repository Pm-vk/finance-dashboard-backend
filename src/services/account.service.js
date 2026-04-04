const userModel = require('../models/user.model');
const transactionModel = require('../models/transaction.model');
const logService = require('./log.service');
const mongoose = require('mongoose');

/**
 * Get the current balance of a user.
 */
async function getBalance(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return user.balance;
}

/**
 * Deposit funds into a user's account.
 * Creates a linked 'income' transaction record.
 */
async function deposit(userId, amount, category = "Other", notes = "Deposit") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (amount <= 0) {
            throw new Error("Deposit amount must be greater than 0");
        }

        // 1. Update Balance
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $inc: { balance: amount } },
            { new: true, session }
        );

        if (!user) {
            throw new Error("User not found");
        }

        // 2. Create Transaction Record (Zorvyn Requirement)
        const transaction = await transactionModel.create([{
            receiverId: userId,
            amount,
            type: "income",
            category,
            notes,
            status: "success",
            idempotencyKey: `DEP-${userId}-${Date.now()}` // Basic auto-key
        }], { session });

        await session.commitTransaction();
        
        logService.createLog(userId, "DEPOSIT", "success", { amount, transactionId: transaction[0]._id });
        return user;
    } catch (error) {
        await session.abortTransaction();
        logService.createLog(userId, "DEPOSIT", "failed", { amount, error: error.message });
        throw error;
    } finally {
        session.endSession();
    }
}

/**
 * Withdraw funds from a user's account.
 * Creates a linked 'expense' transaction record.
 */
async function withdraw(userId, amount, category = "Other", notes = "Withdrawal") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be greater than 0");
        }

        // 1. Atomic update with balance check
        const user = await userModel.findOneAndUpdate(
            { _id: userId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { new: true, session }
        );

        if (!user) {
            const exists = await userModel.findById(userId);
            if (!exists) throw new Error("User not found");
            throw new Error("Insufficient balance");
        }

        // 2. Create Transaction Record (Zorvyn Requirement)
        const transaction = await transactionModel.create([{
            senderId: userId,
            amount,
            type: "expense",
            category,
            notes,
            status: "success",
            idempotencyKey: `WIT-${userId}-${Date.now()}`
        }], { session });

        await session.commitTransaction();

        logService.createLog(userId, "WITHDRAW", "success", { amount, transactionId: transaction[0]._id });
        return user;
    } catch (error) {
        await session.abortTransaction();
        logService.createLog(userId, "WITHDRAW", "failed", { amount, error: error.message });
        throw error;
    } finally {
        session.endSession();
    }
}

module.exports = {
    getBalance,
    deposit,
    withdraw
};
