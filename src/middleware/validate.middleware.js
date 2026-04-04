const { z } = require("zod");
const ApiError = require("../utils/ApiError");

/**
 * Middleware for validating incoming request data against a Zod schema.
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 */
const validate = (schema) => (req, res, next) => {
    try {
        const validated = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
        });

        // 1. Update request objects with validated/formatted data
        req.body = validated.body;
        req.query = validated.query;
        req.params = validated.params;
        req.headers = validated.headers || req.headers;

        next();
    } catch (error) {
        // 2. Format Zod errors for API response
        const errorMessages = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));

        // 3. Throw ApiError with the details
        throw new ApiError(400, "Validation Failed", errorMessages);
    }
};

module.exports = validate;
