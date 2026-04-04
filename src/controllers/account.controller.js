const accountService = require('../services/account.service');

async function getBalanceController(req, res) {
    try {
        const balance = await accountService.getBalance(req.user._id);
        res.status(200).json({
            balance
        });
    } catch (error) {
        console.error("Get Balance Error:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching balance"
        });
    }
}

async function depositController(req, res) {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
    }

    try {
        const user = await accountService.deposit(req.user._id, amount);
        res.status(200).json({
            message: "Deposit successful",
            balance: user.balance
        });
    } catch (error) {
        console.error("Deposit Error:", error);
        res.status(400).json({
            message: error.message || "An error occurred during deposit"
        });
    }
}

async function withdrawController(req, res) {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
    }

    try {
        const user = await accountService.withdraw(req.user._id, amount);
        res.status(200).json({
            message: "Withdrawal successful",
            balance: user.balance
        });
    } catch (error) {
        console.error("Withdrawal Error:", error);
        res.status(400).json({
            message: error.message || "An error occurred during withdrawal"
        });
    }
}

module.exports = {
    getBalanceController,
    depositController,
    withdrawController
};
