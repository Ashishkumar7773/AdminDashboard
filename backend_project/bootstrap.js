require("dotenv").config();
const sequelize = require("./config/db.js");
const User = require("./models/user.model.js");

async function bootstrap() {
    try {
        await sequelize.authenticate();
        // We'll promote 'editor_test@test.com' or the first user found if that doesn't exist
        let user = await User.findOne({ where: { email: 'editor_test@test.com' } });
        if (!user) {
            user = await User.findOne();
        }

        if (user) {
            user.role = 'SuperAdmin';
            await user.save();
            console.log(`SUCCESS: User "${user.email}" promoted to SuperAdmin.`);
        } else {
            console.log("No users found to promote.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Bootstrap failed:", err);
        process.exit(1);
    }
}

bootstrap();
