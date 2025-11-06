// Test the login endpoint
async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        console.log('Login Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            data: data
        });
    } catch (error) {
        console.error('Login Error:', error);
    }
}

// Test connection to backend
async function testBackend() {
    try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        console.log('Backend Health Check:', data);
    } catch (error) {
        console.error('Backend Connection Error:', error);
    }
}

// Run tests
console.log('Running backend tests...');
testBackend();
testLogin();