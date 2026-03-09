const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const Employee = sequelize.define("Employee", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    salary: DataTypes.INTEGER,
    department: DataTypes.STRING,
    photo: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM("Active", "Inactive", "On Leave"),
        defaultValue: "Active",
    },
});

module.exports = Employee;