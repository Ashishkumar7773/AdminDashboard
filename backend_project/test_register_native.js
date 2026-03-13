async function testRegister() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Admin Native 3",
                email: "admin_native_3@test.com",
                password: "password123",
                role: "Admin"
            })
        });
        const data = await res.json();
        console.log("Success:", data);
    } catch (err) {
        console.error("Error:", err.message);
    }
}
testRegister();
