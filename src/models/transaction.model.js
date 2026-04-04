const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be greater than 0"]
    },
    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    },
    type: {
        type: String,
        enum: ["income", "expense", "transfer"],
        default: "transfer"
    },
    category: {
        type: String,
        enum: ["Salary", "Food", "Rent", "Investment", "Shopping", "Entertainment", "Other"],
        default: "Other"
    },
    notes: {
        type: String,
        trim: true
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        unique: true,
        index: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;