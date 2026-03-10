require("dotenv").config();
const sequelize = require("../config/db.js");

async function checkIndexes() {
    try {
        console.log("Checking all indexes on Users table...");
        const [results] = await sequelize.query("SHOW INDEX FROM Users");

        console.log(`Total index entries found: ${results.length}`);

        // Group by index name to see actual unique indexes
        const indexNames = [...new Set(results.map(r => r.Key_name))];
        console.log(`Distinct index names: ${indexNames.length}`);
        console.log("Index list:", indexNames);

        if (indexNames.length >= 60) {
            console.log("Approaching or at index limit (64). Dropping redundant ones...");
            for (const name of indexNames) {
                if (name !== 'PRIMARY' && (name.includes('email') || name === 'Users_email_unique' || /email_\d+/.test(name))) {
                    // Keep the first one, drop others
                    // This is risky without knowing which is 'canonical', but we need to clear space.
                }
            }
        }
    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        await sequelize.close();
    }
}

checkIndexes();
