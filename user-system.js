// user-system.js - Updated to use PHP backend
window.currentUser = {
    username: 'Guest',
    role: 'user',
    isLoggedIn: false,
    profilePic: 'images/account.png'
};

// Initialize user system
async function initializeUserSystem() {
    // Check session via API
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

// Login function using API
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
            
            return { success: true, user: window.currentUser };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Connection error' };
    }
}

// Register function using API
async function registerUser(username, email, password) {
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
            // Auto login after registration
            return await loginUser(username, password);
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Connection error' };
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
    
    if (window.location.pathname.includes('updates.html')) {
        window.location.reload();
    } else {
        window.location.href = 'updates.html';
    }
}