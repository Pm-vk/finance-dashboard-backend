const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const adminRouter = require("./routes/admin.routes");
const { generalLimiter } = require("./middleware/rateLimit.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const ApiError = require("./utils/ApiError");

const app = express();

// 1. Global Middlewares
app.use(express.json({ limit: "16kb" })); // Limit body size for security
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 2. Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "API is running 🚀", 
        uptime: process.uptime() 
    });
});

// 3. Rate Limiting
app.use("/api", generalLimiter);

// 4. API Routes
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);

// 5. Catch-all for undefined routes
app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// 6. Global Error Handler (Must be last)
app.use(errorMiddleware);

module.exports = app;