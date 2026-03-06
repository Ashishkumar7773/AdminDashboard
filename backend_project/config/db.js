const { Sequelize } = require("sequelize");

console.log("Database Config:");
console.log("- Host:", process.env.DB_HOST || "localhost (default)");
console.log("- Database:", process.env.DB_NAME);
console.log("- User:", process.env.DB_USER);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        dialectOptions: {
            ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : null,
        },
        logging: false, // Set to console.log to see SQL queries
    }
);

module.exports = sequelize;