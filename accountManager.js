// Account Manager - Integrated with Updates System and Dropdown

function getCurrentPage() {
    let path = window.location.pathname;
    let page = path.split("/").pop(); 
    
    if (page === "register.html") return "Register";
    if (page === "account.html") return "Account";
    if (page === "updates.html") return "Updates";
    if (page === "account-settings.html") return "Settings";
    return "";
}

function account() {
    if (getCurrentPage() === "Account") {
        console.log("Already on account page, not refreshing");
        return;
    }
    console.log("Navigating to account page");
    window.location.href = "account.html";
}

function signUp() {
    if (getCurrentPage() === "Register") {
        console.log("Already on register page, not refreshing");
        return;
    }
    
    console.log("Navigating to register page");
    window.location.href = "register.html";
}

// In accountManager.js - replace the handleLogin function
async function handleLogin() {
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    
    if (!usernameInput || !passwordInput) {
        console.error('Login inputs not found');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // Call the login function from user-system.js
    await window.loginUser(username, password);
}

function handleRegister() {
    const emailInput = document.querySelector('.input-box[placeholder="Example@gmail.com"]');
    const usernameInput = document.querySelector('.input-box[placeholder="Username"]');
    const passwordInput = document.querySelector('.input-box[type="password"]');
    const confirmInput = document.querySelectorAll('.input-box[type="password"]')[1];
    
    if (!emailInput || !usernameInput || !passwordInput || !confirmInput) {
        console.error('Register inputs not found');
        return;
    }
    
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();
    
    // Validation
    if (!email || !username || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simple email validation
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        alert('Username already exists');
        return;
    }
    
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        alert('Email already registered');
        return;
    }
    
    // Save new user
    const newUser = {
        email: email,
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto-login after registration
    const userData = {
        username: username,
        role: 'user'
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    alert('Registration successful! Welcome to Refill Studios.');
    window.location.href = 'updates.html';
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation buttons (available on all pages)
    const indexButton = document.getElementById('index-button');
    const gamesButton = document.getElementById('games-button');
    const updatesButton = document.getElementById('updates-button');
    
    if (indexButton) indexButton.addEventListener('click', () => window.location.href = 'index.html');
    if (gamesButton) gamesButton.addEventListener('click', () => window.location.href = 'games.html');
    if (updatesButton) updatesButton.addEventListener('click', () => window.location.href = 'updates.html');
    
    // Setup account link (for simple pages without dropdown)
    const accountLink = document.getElementById("account-link");
    if (accountLink && !accountLink.id.includes('text')) {
        accountLink.addEventListener("click", account);
    }
    
    // Setup sign-up button (on login page)
    const signUpButton = document.getElementById("sign-up-button");
    if (signUpButton) {
        signUpButton.addEventListener("click", signUp);
    }
    
    // Setup "Here" link on register page
    const accountLinkHere = document.getElementById('account-link-here');
    if (accountLinkHere) {
        accountLinkHere.addEventListener("click", account);
    }
    
    // Setup login/register forms based on current page
    const currentPage = getCurrentPage();
    
    if (currentPage === "Account") {
        const loginButton = document.getElementById("log-in-button");
        if (loginButton) {
            loginButton.addEventListener("click", handleLogin);
        }
        
        // Also allow Enter key in password field
        const passwordInput = document.querySelector('.input-box[placeholder="Password"]');
        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
    }
    
    if (currentPage === "Register") {
        const registerButton = document.querySelector('.account-button');
        
        if (registerButton) {
            registerButton.addEventListener("click", handleRegister);
        }
        
        // Allow Enter key in last password field
        const passwordInputs = document.querySelectorAll('.input-box[type="password"]');
        if (passwordInputs.length > 1) {
            passwordInputs[1].addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleRegister();
                }
            });
        }
    }
});

// Logout function (call this from anywhere to logout)
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refillUser');
    alert('Logged out successfully.');
    
    // Redirect based on current page
    const currentPage = getCurrentPage();
    if (currentPage === "Updates") {
        window.location.reload();
    } else {
        window.location.href = 'account.html';
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user data
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Make functions available globally
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;