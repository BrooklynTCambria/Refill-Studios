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
    // Fetch the session data from the backend and apply it (default fallbacks are done on the backend too so here they arent needed)
    fetch("/Refill-Studios/api/get_user_session.php")
    .then(response => response.json())
    .then(data => {
        window.currentUser = {
            username: data.username,
            role: data.role,
            isLoggedIn: data.isLoggedIn,
            profilePic: data.profilePic
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
    
    // Update UI if possible
    updateUserUI();
}

// Login function
function loginUser(username, role = 'user') {
    window.currentUser = {
        username: username,
        role: role,
        isLoggedIn: true,
        profilePic: localStorage.getItem('profilePic') || 'images/account.png'
    };
    
    console.log('User logged in:', window.currentUser);
    
    // Refetch new data
    initializeUserSystem();
}

// Logout function
async function logoutUser() {
    window.currentUser = {
        username: 'Guest',
        role: 'user',
        isLoggedIn: false,
        profilePic: 'images/account.png'
    };

    fetch("/Refill-Studios/api/logout.php")
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error("Error:", error);
    });
    

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
window.initializeUserSystem = initializeUserSystem;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;