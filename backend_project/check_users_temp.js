require("dotenv").config();
const requireUser = require("./models/user.model.js");

async function checkUsers() {
    try {
        const users = await requireUser.findAll();
        console.log("Users:", users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
