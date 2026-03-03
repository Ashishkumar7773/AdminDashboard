const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    let token = '';

    console.log('--- Starting API Tests ---');

    // 1. Test Register
    try {
        console.log('\nTesting POST /auth/register...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Admin User',
            email: 'admin' + Date.now() + '@example.com',
            password: 'password123',
            role: 'admin'
        });
        console.log('Register Success:', registerResponse.data);
    } catch (error) {
        console.error('Register Failed:', error.response ? error.response.data : error.message);
    }

    // 2. Test Login
    let email = '';
    try {
        console.log('\nTesting POST /auth/login...');
        // We'll register a fresh one for consistency or use a known one. 
        // Let's use a fixed one for testing if possible, or just register and login.
        const testUser = {
            name: 'Test Admin',
            email: `testadmin_${Date.now()}@example.com`,
            password: 'password123',
            role: 'admin'
        };
        await axios.post(`${BASE_URL}/auth/register`, testUser);

        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        token = loginResponse.data.token;
        console.log('Login Success, Token received');
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
        return;
    }

    // 3. Test Create Employee
    let employeeId = null;
    try {
        console.log('\nTesting POST /employees (Create)...');
        const empResponse = await axios.post(`${BASE_URL}/employees`, {
            name: 'John Doe',
            email: 'john@example.com',
            salary: 50000,
            department: 'IT'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        employeeId = empResponse.data.id;
        console.log('Create Employee Success:', empResponse.data);
    } catch (error) {
        console.error('Create Employee Failed:', error.response ? error.response.data : error.message);
    }

    // 4. Test Get Employees
    try {
        console.log('\nTesting GET /employees (List)...');
        const listResponse = await axios.get(`${BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Get Employees Success, Count:', listResponse.data.length);
    } catch (error) {
        console.error('Get Employees Failed:', error.response ? error.response.data : error.message);
    }

    // 5. Test Delete Employee
    if (employeeId) {
        try {
            console.log(`\nTesting DELETE /employees/${employeeId}...`);
            const deleteResponse = await axios.delete(`${BASE_URL}/employees/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Delete Employee Success:', deleteResponse.data);
        } catch (error) {
            console.error('Delete Employee Failed:', error.response ? error.response.data : error.message);
        }
    }

    console.log('\n--- API Tests Completed ---');
}

testAPI();
