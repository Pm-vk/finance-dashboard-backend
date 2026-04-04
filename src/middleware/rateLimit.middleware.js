const rateLimit = require('express-rate-limit');
const logService = require('../services/log.service');

/**
 * General limiter for all API endpoints to prevent brute-force and spam.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    // Fix: Disable validation for custom key generators (prevents ERR_ERL_KEY_GEN_IPV6)
    validate: false,
    handler: (req, res, next, options) => {
        const userId = req.user ? req.user._id : null;
        logService.createLog(userId, "RATE_LIMIT_EXCEEDED", "failed", { 
            ip: req.ip, 
            path: req.path,
            type: "GENERAL"
        });
        res.status(options.statusCode).send(options.message);
    },
    keyGenerator: (req) => {
        return req.user ? req.user._id.toString() : req.ip;
    }
});

/**
 * Stricter limiter for sensitive financial transactions.
 */
const transferLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Security Notice: Too many transfer attempts. Please wait 15 minutes before trying again."
    },
    // Fix: Disable validation for custom key generators (prevents ERR_ERL_KEY_GEN_IPV6)
    validate: false,
    handler: (req, res, next, options) => {
        const userId = req.user ? req.user._id : null;
        logService.createLog(userId, "RATE_LIMIT_EXCEEDED", "failed", { 
            ip: req.ip, 
            path: req.path,
            type: "TRANSFER"
        });
        res.status(options.statusCode).send(options.message);
    },
    keyGenerator: (req) => {
        return req.user ? req.user._id.toString() : req.ip;
    }
});

module.exports = {
    generalLimiter,
    transferLimiter
};
