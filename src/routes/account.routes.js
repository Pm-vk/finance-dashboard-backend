const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

/**
 * @route GET /api/account/balance
 * @desc Get current account balance
 * @access Private
 */
router.get('/balance', authMiddleware, accountController.getBalanceController);

/**
 * @route POST /api/account/deposit
 * @desc Deposit money into account
 * @access Private
 */
router.post('/deposit', authMiddleware, accountController.depositController);

/**
 * @route POST /api/account/withdraw
 * @desc Withdraw money from account
 * @access Private
 */
router.post('/withdraw', authMiddleware, accountController.withdrawController);

module.exports = router;
