require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.js");

const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employee.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.json({ message: "Admin Dashboard API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});