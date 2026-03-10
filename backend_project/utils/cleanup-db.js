require("dotenv").config();
const sequelize = require("../config/db.js");

async function cleanupIndexes() {
    try {
        console.log("Starting database index cleanup...");
        const [results] = await sequelize.query("SHOW INDEX FROM Users WHERE Non_unique = 0 AND Key_name != 'PRIMARY'");

        console.log(`Found ${results.length} unique indexes.`);

        if (results.length <= 1) {
            console.log("No redundant indexes found. (Keeping at least one unique index for email if it exists)");
            return;
        }

        // We want to keep one unique index (usually 'email' or the first one)
        // and drop the rest.
        const indexesToDrop = results.slice(1);

        for (const index of indexesToDrop) {
            console.log(`Dropping index: ${index.Key_name}`);
            await sequelize.query(`ALTER TABLE Users DROP INDEX \`${index.Key_name}\``);
        }

        console.log("Cleanup completed successfully.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await sequelize.close();
    }
}

cleanupIndexes();
