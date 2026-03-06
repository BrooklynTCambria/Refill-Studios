// user-system.js - Unified User System with PHP Backend
<<<<<<< HEAD

// Initialize user object
=======
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
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
            // Save to localStorage as backup
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
            console.log('User logged in from session:', window.currentUser);
        } else {
<<<<<<< HEAD
            // No session, set to guest
            window.currentUser = {
                username: 'Guest',
                role: 'user',
                isLoggedIn: false,
                profilePic: 'images/account.png'
            };
            // Clear any old localStorage data
            localStorage.removeItem('refillUser');
            console.log('No user logged in, set to Guest');
=======
            // Fallback to localStorage
            const savedUser = JSON.parse(localStorage.getItem('refillUser'));
            if (savedUser && savedUser.isLoggedIn) {
                window.currentUser = savedUser;
                console.log('Using saved user from localStorage:', window.currentUser);
            } else {
                console.log('No user logged in');
            }
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
        }
    } catch (error) {
        console.error('Error checking session:', error);
        // On error, set to guest
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
    }
    
    // Update UI after loading user
    setTimeout(updateUserUI, 50);
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
            
            // Save to localStorage
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
            
            // Update UI
            updateUserUI();
            
<<<<<<< HEAD
            // Trigger header update
            if (window.createUniversalHeader) {
                window.createUniversalHeader();
            }
            
=======
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
            return { success: true, user: window.currentUser };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
<<<<<<< HEAD
        return { success: false, message: 'Connection error. Please try again.' };
=======
        return { success: false, message: 'Connection error' };
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
    }
}

// Logout function
async function logoutUser() {
    try {
        await fetch('api/logout.php', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Reset user to guest
    window.currentUser = {
        username: 'Guest',
        role: 'user',
        isLoggedIn: false,
        profilePic: 'images/account.png'
    };
    
    // Clear localStorage
    localStorage.removeItem('refillUser');
    
    // Update UI
    updateUserUI();
    
<<<<<<< HEAD
    // Trigger header update
    if (window.createUniversalHeader) {
        window.createUniversalHeader();
    }
    
    // Stay on current page or reload
    window.location.reload();
}

// Update UI elements
function updateUserUI() {
    // Update any user-dependent UI elements
    const userRoleIndicator = document.getElementById('user-role-indicator');
    if (userRoleIndicator) {
        if (window.currentUser.isLoggedIn) {
            userRoleIndicator.textContent = `Welcome, ${window.currentUser.username}! (${window.currentUser.role.toUpperCase()})`;
            userRoleIndicator.className = 'user-role-indicator';
            if (window.currentUser.role === 'admin') {
                userRoleIndicator.classList.add('admin-badge');
            }
        } else {
            userRoleIndicator.textContent = 'Welcome, Guest!';
            userRoleIndicator.className = 'user-role-indicator';
        }
    }
    
    // Show/hide admin buttons
    const adminAddPost = document.getElementById('admin-add-post');
    if (adminAddPost) {
        if (window.currentUser.isLoggedIn && (window.currentUser.role === 'admin' || window.currentUser.role === 'developer')) {
            adminAddPost.style.display = 'flex';
        } else {
            adminAddPost.style.display = 'none';
        }
=======
    // Redirect based on current page
    const currentPage = window.location.pathname;
    if (currentPage.includes('updates.html')) {
        window.location.reload();
    } else {
        window.location.href = 'updates.html';
    }
}

// Update UI elements
function updateUserUI() {
    // Update account link text in dropdown
    const accountLink = document.getElementById('account-link-text');
    if (accountLink) {
        accountLink.textContent = window.currentUser.username;
    }
    
    // Update profile picture
    const profilePic = document.getElementById('profile-pic-header');
    if (profilePic) {
        profilePic.src = window.currentUser.profilePic;
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
    }
    
    // Update any other user-dependent UI elements
    const userRoleIndicator = document.getElementById('user-role-indicator');
    if (userRoleIndicator) {
        if (window.currentUser.isLoggedIn) {
            userRoleIndicator.textContent = `Welcome, ${window.currentUser.username}! (${window.currentUser.role.toUpperCase()})`;
        } else {
            userRoleIndicator.textContent = 'Welcome, Guest!';
        }
    }
    
    // Show/hide admin buttons
    const adminAddPost = document.getElementById('admin-add-post');
    if (adminAddPost) {
        if (window.currentUser.role === 'admin' || window.currentUser.role === 'developer') {
            adminAddPost.style.display = 'flex';
        } else {
            adminAddPost.style.display = 'none';
        }
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
window.initializeUserSystem = initializeUserSystem;