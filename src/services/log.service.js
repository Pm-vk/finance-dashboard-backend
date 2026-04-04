const logModel = require('../models/log.model');

/**
 * Create a new log entry in the database.
 * @param {string|null} userId - ID of the user (can be null for unauthenticated events)
 * @param {string} action - The action being performed (e.g., DEPOSIT, TRANSFER)
 * @param {string} status - Result of the action (success / failed)
 * @param {Object} details - Additional metadata or error details
 */
async function createLog(userId, action, status, details = {}) {
    try {
        await logModel.create({
            userId,
            action,
            status,
            details
        });
    } catch (error) {
        // We log the error but don't throw it to avoid breaking the main operation
        console.error("Logging Error:", error);
    }
}

module.exports = {
    createLog
};
