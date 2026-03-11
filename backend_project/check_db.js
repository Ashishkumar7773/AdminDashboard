const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

async function checkEmployees() {
    try {
        console.log('Fetching employees...');
        const response = await axios.get(`${BASE_URL}/employees`);
        const employees = response.data.employees;
        if (employees && employees.length > 0) {
            employees.forEach(emp => {
                console.log(`ID: ${emp.id}, Name: ${emp.name}, Photo: ${emp.photo}`);
            });
        } else {
            console.log('No employees found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkEmployees();
