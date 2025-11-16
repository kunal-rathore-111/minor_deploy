// libraries
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// errorMiddleare
const errorHandler = require('./middlewares/errorMiddleware');

//routes
const routesIndex = require("./routes/routesIndex");

const app = express();
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

// CORS before routes
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || "https://minor-deploy.vercel.app",
    "http://localhost:5173"
];
app.use(cors({
    origin: (origin, cb) => !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
    credentials: true
}));
app.set('trust proxy', 1); // cookies on Vercel

app.use("/app/api", routesIndex);

app.get("/", (req, res) => { res.send("On Inital route /") })

app.use(errorHandler);

module.exports = app;