require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");

// 1. Database Connection
connectToDB()
    .then(() => {
        // 2. Start Server only after successful DB connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🔌 Health check available at: http://localhost:${PORT}/health`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    });

// 3. Handle Uncaught Exceptions (e.g., synchronous errors)
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});

// 4. Handle Unhandled Rejections (e.g., asynchronous errors not caught by asyncHandler)
process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});