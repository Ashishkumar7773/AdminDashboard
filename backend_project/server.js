require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.js");

const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employee.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
});