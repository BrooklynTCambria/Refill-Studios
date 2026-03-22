// user-system.js - Backend-connected User System (FIXED)

window.currentUser = {
    username: 'Guest',
    role: 'Default',
    can_post: false,
    isLoggedIn: false,
    profilePic: 'images/account.png'
};


// user-system.js
window.userSystemReady = new Promise(async (resolve) => {
    try {
        const response = await fetch('api/users.php'); // GET request
        const data = await response.json();

        if (data.success && data.user.isLoggedIn) {
            window.currentUser = {
                ...data.user,
                profilePic: data.user.profile_pic || 'images/account.png'
            };
        } else {
            window.currentUser = { isLoggedIn: false };
        }

        resolve(window.currentUser);
    } catch (e) {
        console.error('Failed to get current user:', e);
        window.currentUser = { isLoggedIn: false };
        resolve(window.currentUser);
    }
});

// Initialize user system
async function initializeUserSystem() {
    console.log('Initializing user system...');
    
    // Check if there's a session token in cookies
    const sessionToken = getCookie('session_token');
    console.log('Session token found:', sessionToken ? 'Yes' : 'No');
    
    if (!sessionToken) {
        // No session token, use guest
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        
        if (window._resolveUserSystem) {
            window._resolveUserSystem(window.currentUser);
        }
        updateUserUI();
        return;
    }
    
    try {
        const response = await fetch('api/users.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
            window.currentUser = {
                ...data.user,
                isLoggedIn: data.user.isLoggedIn === true,
                profilePic: data.user.profile_pic || data.user.profilePic || 'images/account.png'
            };
            console.log('User loaded:', window.currentUser.username, 'Role:', window.currentUser.role);
            updateUserData();
        } else if (data.user) {
            window.currentUser = {
                ...data.user,
                isLoggedIn: data.user.isLoggedIn || false,
                profilePic: data.user.profile_pic || data.user.profilePic || 'images/account.png'
            };
        } else {
            // No user data, use guest
            window.currentUser = {
                username: 'Guest',
                role: 'user',
                isLoggedIn: false,
                profilePic: 'images/account.png'
            };
        }
        
        console.log('User system initialized:', window.currentUser);
        updateUserUI();
        
        if (window._resolveUserSystem) {
            window._resolveUserSystem(window.currentUser);
        }
    } catch (error) {
        console.error('Failed to initialize user system:', error);
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        
        if (window._resolveUserSystem) {
            window._resolveUserSystem(window.currentUser);
        }
    }
}

// Helper function to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function loginUser(username, password) {
    console.log('loginUser called with:', { username, password: '***' });

    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });

        // Get raw text first
        const text = await response.text();
        console.log('RAW response from API:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            return { success: false, message: 'Invalid JSON response from server. Check console for raw output.' };
        }

        if (data.success) {
            window.currentUser = {
                ...data.user,
                isLoggedIn: true,
                profilePic: data.user.profile_pic || data.user.profilePic || 'images/account.png'
            };
            updateUserData();
            updateUserUI();
            return { success: true, user: window.currentUser };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login failed (fetch error):', error);
        return { success: false, message: 'Login failed: ' + error.message };
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
        
        if (data.success && data.user) {
            window.currentUser = {
                ...data.user,
                isLoggedIn: true,
                profilePic: data.user.profile_pic || data.user.profilePic || 'images/account.png'
            };
            updateUserData();
            updateUserUI();
            return { success: true, user: window.currentUser };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, message: 'Registration failed: ' + error.message };
    }
}

// Logout function
async function logoutUser() {
    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        });
        
        // Clear the session token cookie (with correct path)
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Clear local storage
        localStorage.removeItem('refillUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profilePic');
        
        // Reset current user
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        
        // Update UI
        updateUserData();
        updateUserUI();
        
        // Redirect to updates page
        window.location.href = 'updates.html';
    } catch (error) {
        console.error('Logout failed:', error);
        // Force logout even if API fails
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.clear();
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        window.location.href = 'updates.html';
    }
}

// Add this function to user-system.js (after the other functions)

// Update user settings (profile picture and username)
async function updateUserSettings(settings) {
    console.log('updateUserSettings called with:', settings);
    
    try {
        const response = await fetch('api/users.php', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local user data
            if (settings.username) {
                window.currentUser.username = settings.username;
            }
            if (settings.profile_pic) {
                window.currentUser.profilePic = settings.profile_pic;
            }
            
            // Save to localStorage
            localStorage.setItem('refillUser', JSON.stringify({
                username: window.currentUser.username,
                role: window.currentUser.role,
                isLoggedIn: window.currentUser.isLoggedIn,
                profilePic: window.currentUser.profilePic
            }));
            
            // Update UI
            updateUserUI();
            
            console.log('Settings updated successfully');
            return { success: true };
        } else {
            console.error('Failed to update settings:', data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, message: error.message };
    }
}

// Update user data in localStorage
function updateUserData() {
    localStorage.setItem('refillUser', JSON.stringify({
        username: window.currentUser.username,
        role: window.currentUser.role,
        isLoggedIn: window.currentUser.isLoggedIn,
        profilePic: window.currentUser.profilePic
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
    
    // Also update header if it exists
    if (window.createUniversalHeader) {
        window.createUniversalHeader();
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing user system...');
    initializeUserSystem();
});

// Make functions available globally
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.updateUserSettings = updateUserSettings;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;