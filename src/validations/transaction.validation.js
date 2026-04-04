const { z } = require("zod");

/**
 * Validation schemas for Transaction and Account routes.
 */

// 1. Transfer Schema
const transferSchema = z.object({
    body: z.object({
        receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Receiver ID format"),
        amount: z.number().positive("Amount must be a positive number"),
    }),
    headers: z.object({
        'x-idempotency-key': z.string().min(1, "x-idempotency-key header is required"),
    }).passthrough(), // Allow other headers
});

// 2. Deposit/Withdraw Schema
const amountSchema = z.object({
    body: z.object({
        amount: z.number().positive("Amount must be a positive number"),
        category: z.string().optional(),
        notes: z.string().optional(),
    }),
});

// 3. Pagination Schema
const historySchema = z.object({
    query: z.object({
        page: z.string().optional().transform((val) => (val ? Number(val) : 1)),
        limit: z.string().optional().transform((val) => (val ? Number(val) : 10)),
    }),
});

module.exports = {
    transferSchema,
    amountSchema,
    historySchema
};
