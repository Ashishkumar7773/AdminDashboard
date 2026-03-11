require("dotenv").config();
const Employee = require("./models/employee.model.js");

async function checkDB() {
    try {
        console.log('Querying employees from DB...');
        const employees = await Employee.findAll();
        if (employees && employees.length > 0) {
            employees.forEach(emp => {
                console.log(`ID: ${emp.id}, Name: ${emp.name}, Photo: ${emp.photo}`);
            });
        } else {
            console.log('No employees found in DB.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDB();
