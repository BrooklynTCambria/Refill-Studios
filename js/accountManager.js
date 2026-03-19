// updated-accountManager.js - Backend-connected Account Manager

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

async function handleLogin() {
    const usernameInput = document.getElementById('username-input') || 
                         document.querySelector('.input-box[placeholder="Username"]');
    const passwordInput = document.getElementById('password-input') || 
                         document.querySelector('.input-box[placeholder="Password"]');
    
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
    
    // Use the global login function
    if (window.loginUser) {
        const result = await window.loginUser(username, password);
        
        if (result.success) {
            alert('Login successful!');
            window.location.href = 'updates.html';
        } else {
            alert(result.message || 'Invalid username or password');
        }
    } else {
        alert('Login system not available');
    }
}

async function handleRegister() {
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
    
    // Use the global register function
    if (window.registerUser) {
        const result = await window.registerUser(username, email, password);
        
        if (result.success) {
            alert('Registration successful! Welcome to Refill Studios.');
            window.location.href = 'updates.html';
        } else {
            alert(result.message || 'Registration failed');
        }
    } else {
        alert('Registration system not available');
    }
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
    
    // Setup account link
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
        const passwordInput = document.getElementById('password-input') ||
                            document.querySelector('.input-box[placeholder="Password"]');
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

// Logout function
async function logout() {
    if (window.logoutUser) {
        await window.logoutUser();
    } else {
        // Fallback
        localStorage.removeItem('currentUser');
        localStorage.removeItem('refillUser');
        alert('Logged out successfully.');
        window.location.href = 'account.html';
    }
}

// Check if user is logged in
function isLoggedIn() {
    return window.currentUser?.isLoggedIn || false;
}

// Get current user data
function getCurrentUser() {
    return window.currentUser || null;
}

// Make functions available globally
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;