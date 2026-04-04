const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

/**
 * @route GET /api/admin/users
 * @desc Get all users for admin review
 * @access Admin & Analyst
 */
router.get(
    '/users', 
    authMiddleware, 
    authorize(['Admin', 'Analyst']), 
    adminController.getAllUsersController
);

/**
 * @route PATCH /api/admin/users
 * @desc Update user role or status
 * @access Admin only
 */
router.patch(
    '/users', 
    authMiddleware, 
    authorize(['Admin']), 
    adminController.updateUserRoleController
);

module.exports = router;
