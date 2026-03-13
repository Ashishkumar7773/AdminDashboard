require("dotenv").config();
const sequelize = require("./config/db.js");
const User = require("./models/user.model.js");

async function check() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({ attributes: ['email', 'role', 'name'] });
        console.log(`Total users found: ${users.length}`);
        console.log("Users and Roles:");
        users.forEach(u => {
            console.log(`- Name: "${u.name}", Email: "${u.email}", Role: "${u.role}"`);
        });
        process.exit(0);
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
}

check();
