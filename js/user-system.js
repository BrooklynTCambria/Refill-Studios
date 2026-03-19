// updated-user-system.js - Backend-connected User System

window.currentUser = {
    username: 'Guest',
    role: 'user',
    isLoggedIn: false,
    profilePic: 'images/account.png'
};

// Initialize user system
async function initializeUserSystem() {
    try {
        const response = await fetch('api/users.php');
        const data = await response.json();
        
        if (data.success && data.user) {
            window.currentUser = data.user;
            window.currentUser.isLoggedIn = true;
        } else if (data.user) {
            window.currentUser = data.user;
        }
        
        console.log('User system initialized:', window.currentUser);
        updateUserUI();
    } catch (error) {
        console.error('Failed to initialize user system:', error);
    }
}

// Login function
async function loginUser(username, password) {
    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.currentUser = data.user;
            window.currentUser.isLoggedIn = true;
            updateUserData();
            updateUserUI();
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login failed:', error);
        return { success: false, message: 'Login failed' };
    }
}

// Register function
async function registerUser(username, email, password) {
    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Auto login after registration
            return await loginUser(username, password);
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, message: 'Registration failed' };
    }
}

// Logout function
async function logoutUser() {
    try {
        await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        });
        
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        
        updateUserData();
        updateUserUI();
        
        if (window.location.pathname.includes('updates.html')) {
            window.location.reload();
        } else {
            window.location.href = 'updates.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Update user settings
async function updateUserSettings(settings) {
    try {
        const response = await fetch('api/users.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Refresh user data
            await initializeUserSystem();
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { success: false };
    }
}

// Update user data in memory
function updateUserData() {
    localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
    localStorage.setItem('currentUser', JSON.stringify({
        username: window.currentUser.username,
        role: window.currentUser.role,
        isLoggedIn: window.currentUser.isLoggedIn
    }));
}

// Update UI based on user state
function updateUserUI() {
    const accountLink = document.getElementById('account-link-text') || document.getElementById('account-link');
    if (accountLink) {
        accountLink.textContent = window.currentUser.username;
    }
    
    const profilePic = document.getElementById('profile-pic-header') || 
                      document.querySelector('.profile-pic-small') ||
                      document.querySelector('.account-icon');
    if (profilePic && window.currentUser.profilePic) {
        profilePic.src = window.currentUser.profilePic;
    }
}

// Helper functions
function isLoggedIn() {
    return window.currentUser.isLoggedIn;
}

function getCurrentUser() {
    return window.currentUser;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeUserSystem);

// Make functions available globally
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.updateUserSettings = updateUserSettings;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;