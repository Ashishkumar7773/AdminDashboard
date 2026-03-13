require("dotenv").config();
const sequelize = require("./config/db.js");

async function checkSchema() {
    try {
        const [results] = await sequelize.query("DESCRIBE Users");
        console.log("Schema:", results);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
