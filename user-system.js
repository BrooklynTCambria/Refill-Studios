// user-system.js - Unified User System for All Pages

// Global user object
window.currentUser = {
    username: 'Guest',
    role: 'user',
    isLoggedIn: false,
    profilePic: 'images/account.png'
};

// Initialize user system on any page
async function initializeUserSystem() {
    fetch("/api/get_user_session.php")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
    
    // Update UI if possible
    updateUserUI();
}

// Update user information in localStorage
function updateUserData() {
    localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
    localStorage.setItem('currentUser', JSON.stringify({
        username: window.currentUser.username,
        role: window.currentUser.role,
        isLoggedIn: window.currentUser.isLoggedIn
    }));
}

// Login function
function loginUser(username, role = 'user') {
    window.currentUser = {
        username: username,
        role: role,
        isLoggedIn: true,
        profilePic: localStorage.getItem('profilePic') || 'images/account.png'
    };
    
    updateUserData();
    console.log('User logged in:', window.currentUser);
    
    // Update UI
    updateUserUI();
}

// Logout function
function logoutUser() {
    window.currentUser = {
        username: 'Guest',
        role: 'user',
        isLoggedIn: false,
        profilePic: 'images/account.png'
    };
    
    updateUserData();
    console.log('User logged out');
    
    // Update UI
    updateUserUI();
    
    // Reload or redirect
    if (window.location.pathname.includes('updates.html')) {
        window.location.reload();
    } else {
        window.location.href = 'updates.html';
    }
}

// Update UI based on user state
function updateUserUI() {
    // Update account link text if it exists
    const accountLink = document.getElementById('account-link-text') || document.getElementById('account-link');
    if (accountLink) {
        accountLink.textContent = window.currentUser.username;
    }
    
    // Update profile picture if it exists
    const profilePic = document.getElementById('profile-pic-header') || 
                      document.querySelector('.profile-pic-small') ||
                      document.querySelector('.account-icon');
    if (profilePic && window.currentUser.profilePic) {
        profilePic.src = window.currentUser.profilePic;
    }
}

// Check if user is logged in
function isLoggedIn() {
    return window.currentUser.isLoggedIn;
}

// Get current user
function getCurrentUser() {
    return window.currentUser;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUserSystem();
    console.log('User system initialized:', window.currentUser);
});

// Make functions available globally
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;