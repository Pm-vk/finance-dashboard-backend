const userModel = require('../models/user.model');

/**
 * Get the current balance of a user.
 * @param {string} userId - ID of the user
 * @returns {Promise<number>} - Current balance
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
 * @param {string} userId - ID of the user
 * @param {number} amount - Amount to deposit
 * @returns {Promise<Object>} - Updated user object
 */
async function deposit(userId, amount) {
    if (amount <= 0) {
        throw new Error("Deposit amount must be greater than 0");
    }

    const user = await userModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

/**
 * Withdraw funds from a user's account.
 * @param {string} userId - ID of the user
 * @param {number} amount - Amount to withdraw
 * @returns {Promise<Object>} - Updated user object
 */
async function withdraw(userId, amount) {
    if (amount <= 0) {
        throw new Error("Withdrawal amount must be greater than 0");
    }

    // Atomic update with balance check
    const user = await userModel.findOneAndUpdate(
        { _id: userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true }
    );

    if (!user) {
        // Double check if user exists at all
        const exists = await userModel.findById(userId);
        if (!exists) {
            throw new Error("User not found");
        }
        throw new Error("Insufficient balance");
    }

    return user;
}

module.exports = {
    getBalance,
    deposit,
    withdraw
};
