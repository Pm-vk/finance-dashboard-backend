const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", validate(registerSchema), authController.userRegisterController);

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post("/login", validate(loginSchema), authController.userLoginController);

module.exports = router;