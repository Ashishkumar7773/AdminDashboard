require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const sequelize = require("./config/db.js");
const errorMiddleware = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employee.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://admin-dashboard-pied-eight-54.vercel.app",
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// Ensure uploads directory exists
const fs = require("fs");
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve Static Files
app.use("/uploads", express.static(uploadDir));

// Health check route
app.get("/", (req, res) => {
    res.json({ message: "Admin Dashboard API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Error Middleware (Must be last)
app.use(errorMiddleware);

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});