const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const Employee = sequelize.define("Employee", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    salary: DataTypes.INTEGER,
    department: DataTypes.STRING,
});

module.exports = Employee;