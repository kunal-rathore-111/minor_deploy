require("dotenv").config();

const cors = require("cors");
const app = require("./app");
const { connectDB } = require("./config/db");
const { validateEnv } = require("./utils/validateEnv");

// Validate environment variables
try {
    validateEnv();
} catch (error) {
    console.error("Environment validation failed:", error.message);
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
}

const allowedOrigins = [
    "https://minor-deploy-64gx.vercel.app", //  frontend
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.set('trust proxy', 1); // Important for cookies on Vercel

const PORT = process.env.PORT || 3000;

// Initialize DB connection for serverless
let dbInitialized = false;

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    if (!dbInitialized) {
        try {
            await connectDB();
            dbInitialized = true;
        } catch (error) {
            console.error("Failed to initialize database:", error);
            return res.status(503).json({ 
                status: 'error', 
                message: 'Database connection failed',
                type: 'ServiceUnavailable'
            });
        }
    }
    next();
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        dbInitialized = true;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
}

// Export for Vercel serverless
module.exports = app;