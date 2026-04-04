const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

/**
 * @route POST /api/transaction/transfer
 * @desc Transfer funds between two users
 * @access Private
 */
router.post('/transfer', authMiddleware, transactionController.transferController);

/**
 * @route GET /api/transactions
 * @desc Get all transactions for logged-in user
 * @access Private
 */
router.get('/', authMiddleware, transactionController.getTransactionsController);

/**
 * @route GET /api/transactions/:id
 * @desc Get single transaction detail
 * @access Private
 */
router.get('/:id', authMiddleware, transactionController.getTransactionByIdController);

module.exports = router;
