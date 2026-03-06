// accountManager.js - Updated to use PHP backend

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

// Updated login function using PHP API
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
    
    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update the global user object
            if (window.currentUser) {
                window.currentUser = {
                    username: data.user.username,
                    role: data.user.role,
                    isLoggedIn: true,
                    profilePic: data.user.profile_pic || 'images/account.png'
                };
            }
            
            // Save to localStorage as backup
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
            
            alert('Login successful!');
            window.location.href = 'updates.html';
        } else {
            alert(data.message || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Connection error. Please try again.');
    }
}

// Updated register function using PHP API
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
    
    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful! You can now login.');
            window.location.href = 'account.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Connection error. Please try again.');
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation buttons
    const indexButton = document.getElementById('index-button');
    const gamesButton = document.getElementById('games-button');
    const updatesButton = document.getElementById('updates-button');
    
    if (indexButton) indexButton.addEventListener('click', () => window.location.href = 'index.html');
    if (gamesButton) gamesButton.addEventListener('click', () => window.location.href = 'games.html');
    if (updatesButton) updatesButton.addEventListener('click', () => window.location.href = 'updates.html');
    
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
window.account = account;
window.signUp = signUp;