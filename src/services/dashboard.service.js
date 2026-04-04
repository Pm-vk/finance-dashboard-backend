const transactionModel = require('../models/transaction.model');
const mongoose = require('mongoose');

/**
 * Get aggregated dashboard summary for a user.
 */
async function getSummary(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Calculate Income vs Expense Totals
    const summary = await transactionModel.aggregate([
        {
            $match: {
                $or: [
                    { senderId: userObjectId },
                    { receiverId: userObjectId }
                ],
                status: "success"
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: {
                        $cond: [{ $eq: ["$receiverId", userObjectId] }, "$amount", 0]
                    }
                },
                totalExpenses: {
                    $sum: {
                        $cond: [
                            { 
                                $or: [
                                    { $eq: ["$senderId", userObjectId] },
                                    { $eq: ["$type", "expense"] }
                                ] 
                            }, 
                            "$amount", 
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // 2. Calculate Category-wise Totals (Zorvyn Requirement 3)
    const categoryBreakdown = await transactionModel.aggregate([
        {
            $match: {
                $or: [
                    { senderId: userObjectId },
                    { receiverId: userObjectId }
                ],
                status: "success"
            }
        },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);

    // 3. Recent Activity (Last 5 transactions)
    const recentActivity = await transactionModel.find({
        $or: [
            { senderId: userObjectId },
            { receiverId: userId }
        ],
        status: "success"
    })
    .sort({ createdAt: -1 })
    .limit(5);

    const totals = summary[0] || { totalIncome: 0, totalExpenses: 0 };

    return {
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        netBalance: totals.totalIncome - totals.totalExpenses,
        categoryBreakdown,
        recentActivity
    };
}

module.exports = {
    getSummary
};
