// Account Manager - Integrated with PHP Backend

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

// Handle login form submission
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
    
    // Show loading state
    const loginButton = document.getElementById('log-in-button');
    const originalText = loginButton.textContent;
    loginButton.textContent = 'LOGGING IN...';
    loginButton.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch('login.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save user data to localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('refillUser', JSON.stringify(data.user));
            
            alert('Login successful!');
            window.location.href = 'updates.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    } finally {
        loginButton.textContent = originalText;
        loginButton.disabled = false;
    }
}

// Handle registration form submission
async function handleRegister() {
    const emailInput = document.getElementById('email-input');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const confirmInput = document.getElementById('confirm-password-input');
    
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
    
    // Show loading state
    const registerButton = document.getElementById('register-button');
    const originalText = registerButton.textContent;
    registerButton.textContent = 'REGISTERING...';
    registerButton.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        formData.append('confirm_password', confirmPassword);
        
        const response = await fetch('register.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save user data to localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('refillUser', JSON.stringify(data.user));
            
            alert('Registration successful! Welcome to Refill Studios.');
            window.location.href = 'updates.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    } finally {
        registerButton.textContent = originalText;
        registerButton.disabled = false;
    }
}

// Check session on page load
async function checkSession() {
    try {
        const response = await fetch('check_session.php');
        const data = await response.json();
        
        if (data.loggedIn) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('refillUser', JSON.stringify(data.user));
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

// Logout function
async function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        const response = await fetch('logout.php');
        const data = await response.json();
        
        if (data.success) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('refillUser');
            localStorage.removeItem('profilePic');
            
            alert('Logged out successfully.');
            
            const currentPage = getCurrentPage();
            if (currentPage === "Updates") {
                window.location.reload();
            } else {
                window.location.href = 'updates.html';
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check session on page load
    checkSession();
    
    // Setup navigation buttons
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
        
        // Enter key in password field
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
    }
    
    if (currentPage === "Register") {
        const registerButton = document.getElementById('register-button');
        
        if (registerButton) {
            registerButton.addEventListener("click", handleRegister);
        }
        
        // Enter key in confirm password field
        const confirmInput = document.getElementById('confirm-password-input');
        if (confirmInput) {
            confirmInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleRegister();
                }
            });
        }
    }
});

// Make functions available globally
window.logout = logout;
window.account = account;
window.signUp = signUp;