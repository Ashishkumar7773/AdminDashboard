require("dotenv").config();
const User = require("./models/user.model.js");

async function updateUsers() {
    try {
        await User.update({ role: 'Admin' }, { where: { email: ['tiyahew183@indevgo.com', 'lojeh90770@niprack.com'] } });
        console.log("Updated users to Admin");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
updateUsers();
