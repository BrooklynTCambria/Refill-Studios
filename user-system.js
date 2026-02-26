// user-system.js - Updated to use PHP backend
window.currentUser = {
    username: 'Guest',
    role: 'user',
    isLoggedIn: false,
    profilePic: 'images/account.png'
};

// Check session on page load
async function initializeUserSystem() {
    try {
        const response = await fetch('api/check-session.php');
        const data = await response.json();
        
        if (data.loggedIn) {
            window.currentUser = {
                username: data.user.username,
                role: data.user.role,
                isLoggedIn: true,
                profilePic: data.user.profile_pic || 'images/account.png'
            };
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
        } else {
            // Fallback to localStorage
            const savedUser = JSON.parse(localStorage.getItem('refillUser'));
            if (savedUser) {
                window.currentUser = savedUser;
            }
        }
    } catch (error) {
        console.error('Error checking session:', error);
        // Fallback to localStorage
        const savedUser = JSON.parse(localStorage.getItem('refillUser'));
        if (savedUser) {
            window.currentUser = savedUser;
        }
    }
    
    updateUserUI();
}

// Login function
async function loginUser(username, password) {
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
            window.currentUser = {
                username: data.user.username,
                role: data.user.role,
                isLoggedIn: true,
                profilePic: data.user.profile_pic || 'images/account.png'
            };
            
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
            updateUserUI();
            
            // Redirect to updates page
            window.location.href = 'updates.html';
            
            return { success: true };
        } else {
            alert(data.message || 'Login failed');
            return { success: false };
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Connection error');
        return { success: false };
    }
}

// Logout function
async function logoutUser() {
    try {
        await fetch('api/logout.php');
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    window.currentUser = {
        username: 'Guest',
        role: 'user',
        isLoggedIn: false,
        profilePic: 'images/account.png'
    };
    
    localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
    updateUserUI();
    
    window.location.href = 'updates.html';
}

// Update UI
function updateUserUI() {
    const accountLink = document.getElementById('account-link-text');
    if (accountLink) {
        accountLink.textContent = window.currentUser.username;
    }
    
    const profilePic = document.getElementById('profile-pic-header');
    if (profilePic) {
        profilePic.src = window.currentUser.profilePic;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUserSystem();
});

// Make functions global
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = () => window.currentUser;