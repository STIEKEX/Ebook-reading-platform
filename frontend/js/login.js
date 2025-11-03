// script.js
document.addEventListener('DOMContentLoaded', function() {
    const signupModal = document.getElementById('signupModal');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');
    const showLoginLink = document.getElementById('showLogin');
    const showSignupLink = document.getElementById('showSignup');
    
    const screenNameInput = document.getElementById('screenName');
    const urlPreview = document.getElementById('urlPreview');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPasswordInput = document.getElementById('loginPassword');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    
    // Handle signup form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Signup form submitted');

        const formData = {
            username: document.getElementById('screenName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            adminCode: document.getElementById('adminCode').value
        };

        console.log('Form data:', formData);

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Compute frontend prefix dynamically so Live Server and backend both work
                const frontendPrefix = window.location.pathname.startsWith('/frontend') ? '' : '/frontend';

                if (data.user.isAdmin) {
                    console.log('Redirecting to admin dashboard...');
                    window.location.href = `${frontendPrefix}/admin/dashboard.html`;
                } else {
                    console.log('Redirecting to main page...');
                    window.location.href = `${frontendPrefix}/main.html`;
                }
            } else {
                alert(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred during signup. Please check the console for details.');
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Login form submitted');

        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        console.log('Login data:', formData);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Compute frontend prefix dynamically so Live Server and backend both work
                const frontendPrefix = window.location.pathname.startsWith('/frontend') ? '' : '/frontend';

                if (data.user.isAdmin) {
                    console.log('Redirecting to admin dashboard...');
                    window.location.href = `${frontendPrefix}.../admin/dashboard.html`;
                } else {
                    console.log('Redirecting to main page...');
                    window.location.href = `${frontendPrefix}/main.html`;
                }
            } else {
                alert(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please check the console for details.');
        }
    });

    // Close modal (optional - you can remove this if you don't want close functionality)
    closeModalBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to close?')) {
            window.close();
        }
    });

    // Switch to login from signup
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'grid';
    });

    // Switch to signup from login
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'grid';
    });

    // Update URL preview as user types
    screenNameInput.addEventListener('input', function() {
        const value = this.value.trim() || 'screenname';
        urlPreview.textContent = value;
    });

    // Toggle password visibility for signup
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });

    // Toggle password visibility for login
    toggleLoginPassword.addEventListener('click', function() {
        if (loginPasswordInput.type === 'password') {
            loginPasswordInput.type = 'text';
        } else {
            loginPasswordInput.type = 'password';
        }
    });

    // Signup form submission
  // EXISTING CODE...

// REPLACE THIS PART in your login.js:
signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('screenName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const adminCode = document.getElementById('adminCode')?.value || '';

  const result = await signup(username, email, password, adminCode);
  
  if (result.success) {
    showMessage(result.message);
    setTimeout(() => {
      window.location.href = '../main.html';
    }, 1500);
  } else {
    showErrorMessage(result.message);
  }
});

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const result = await login(email, password);
  
  if (result.success) {
    showMessage(result.message);
    setTimeout(() => {
     window.location.href = '../main.html';  // Go UP one level to reach main.html

    }, 1500);
  } else {
    showErrorMessage(result.message);
  }
});

function showMessage(msg) {
  alert(msg);
}

function showErrorMessage(msg) {
  alert('❌ Error: ' + msg);
}

});
