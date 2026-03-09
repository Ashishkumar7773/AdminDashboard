const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const User = sequelize.define("User", {
    name: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        unique: true,
    },
    password: DataTypes.STRING,
    role: {
        type: DataTypes.ENUM("SuperAdmin", "Admin", "Editor", "user"),
        defaultValue: "user",
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
});

module.exports = User;