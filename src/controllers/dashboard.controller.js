const dashboardService = require('../services/dashboard.service');
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Handle Dashboard Summary fetching.
 */
const getSummaryController = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, summary, "Dashboard summary fetched successfully")
    );
});

module.exports = {
    getSummaryController
};
