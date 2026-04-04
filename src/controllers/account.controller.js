const accountService = require('../services/account.service');
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Get current user balance.
 */
const getBalanceController = asyncHandler(async (req, res) => {
    const balance = await accountService.getBalance(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, { balance }, "Balance fetched successfully")
    );
});

/**
 * Handle user deposit.
 */
const depositController = asyncHandler(async (req, res) => {
    const { amount, category, notes } = req.body;
    const user = await accountService.deposit(req.user._id, amount, category, notes);
    return res.status(200).json(
        new ApiResponse(200, { balance: user.balance }, "Deposit successful")
    );
});

/**
 * Handle user withdrawal.
 */
const withdrawController = asyncHandler(async (req, res) => {
    const { amount, category, notes } = req.body;
    const user = await accountService.withdraw(req.user._id, amount, category, notes);
    return res.status(200).json(
        new ApiResponse(200, { balance: user.balance }, "Withdrawal successful")
    );
});

module.exports = {
    getBalanceController,
    depositController,
    withdrawController
};
