const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const transactionController = require('../controllers/transaction.controller');
const { transferLimiter } = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');
const { transferSchema, historySchema } = require('../validations/transaction.validation');

const router = express.Router();

/**
 * @route POST /api/transactions/transfer
 * @desc Transfer funds between two users
 * @access Admin only (High-level financial move)
 */
router.post(
    '/transfer', 
    authMiddleware, 
    authorize(['Admin']), 
    validate(transferSchema), 
    transferLimiter, 
    transactionController.transferController
);

/**
 * @route GET /api/transactions
 * @desc Get all transactions for logged-in user
 * @access All Roles
 */
router.get(
    '/', 
    authMiddleware, 
    validate(historySchema), 
    transactionController.getTransactionsController
);

/**
 * @route GET /api/transactions/:id
 * @desc Get single transaction detail
 * @access All Roles
 */
router.get(
    '/:id', 
    authMiddleware, 
    transactionController.getTransactionByIdController
);

module.exports = router;
