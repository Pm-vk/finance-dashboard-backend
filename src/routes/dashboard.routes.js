const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @route GET /api/dashboard/summary
 * @desc Get aggregated analytics for the user
 * @access Private (Analyst & Admin)
 */
router.get(
    '/summary', 
    authMiddleware, 
    authorize(['Analyst', 'Admin']), 
    dashboardController.getSummaryController
);

module.exports = router;
