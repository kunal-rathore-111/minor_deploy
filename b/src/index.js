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
    "http://localhost:5173",
    "http://localhost:5174" // Additional local dev port
];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition']
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