const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const accountController = require('../controllers/account.controller');
const validate = require('../middleware/validate.middleware');
const { amountSchema } = require('../validations/transaction.validation');

const router = express.Router();

/**
 * @route GET /api/account/balance
 * @desc Get current account balance
 * @access Private (All Roles)
 */
router.get('/balance', authMiddleware, accountController.getBalanceController);

/**
 * @route POST /api/account/deposit
 * @desc Deposit money into account (Role-Based)
 * @access Analyst & Admin
 */
router.post('/deposit', authMiddleware, authorize(['Analyst', 'Admin']), validate(amountSchema), accountController.depositController);

/**
 * @route POST /api/account/withdraw
 * @desc Withdraw money from account (Role-Based)
 * @access Analyst & Admin
 */
router.post('/withdraw', authMiddleware, authorize(['Analyst', 'Admin']), validate(amountSchema), accountController.withdrawController);

module.exports = router;
