

const mongoose = require("mongoose");

// Cache the mongoose connection for serverless
let cachedConnection = null;

async function connectDB() {
    // If already connected, return the cached connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log("Using cached DB connection");
        return cachedConnection;
    }

    // If there's a pending connection, wait for it
    if (mongoose.connection.readyState === 2) {
        console.log("Waiting for pending DB connection");
        await new Promise(resolve => {
            mongoose.connection.once('connected', resolve);
        });
        return cachedConnection;
    }

    console.log("DB connecting");
    try {
        // Set serverless-friendly options
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            maxPoolSize: 1, // Limit pool size for serverless
        };

        const connection = await mongoose.connect(process.env.MONGOO_DB_URL, options);
        cachedConnection = connection;
        console.log("DB connected");
        return cachedConnection;
    } catch (err) {
        console.error("ERROR IN connectDB- " + err);
        throw err;
    }
}

module.exports = { connectDB };