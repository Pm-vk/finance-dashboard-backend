const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    action: {
        type: String,
        required: [true, "Action is required"],
        enum: ["DEPOSIT", "WITHDRAW", "TRANSFER", "RATE_LIMIT_EXCEEDED"]
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["success", "failed"]
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // We only need the timestamp
});

const logModel = mongoose.model("Log", logSchema);
module.exports = logModel;
