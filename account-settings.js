// account-settings.js - Fixed to use PHP session

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for user system to initialize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if user is logged in via PHP session
    try {
        const response = await fetch('api/check-session.php');
        const data = await response.json();
        
        if (!data.loggedIn) {
            alert('Please login first');
            window.location.href = 'account.html';
            return;
        }
        
        // Update window.currentUser with session data
        window.currentUser = {
            username: data.user.username,
            role: data.user.role,
            isLoggedIn: true,
            profilePic: data.user.profile_pic || 'images/account.png'
        };
        
        // Save to localStorage as backup
        localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
        
    } catch (error) {
        console.error('Error checking session:', error);
        
        // Fallback to localStorage
        const savedUser = JSON.parse(localStorage.getItem('refillUser'));
        if (!savedUser || !savedUser.isLoggedIn) {
            alert('Please login first');
            window.location.href = 'account.html';
            return;
        }
        window.currentUser = savedUser;
    }
    
    // Now initialize the page
    initializeSettingsPage();
});

function initializeSettingsPage() {
    // DOM Elements
    const profilePreview = document.getElementById('profile-preview-large');
    const profileHeader = document.getElementById('profile-pic-header');
    const uploadBtn = document.getElementById('upload-profile-btn');
    const profileUpload = document.getElementById('profile-upload');
    const usernameInput = document.getElementById('username-input');
    const usernameCounter = document.getElementById('username-counter');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveSuccess = document.getElementById('save-success');
    
    // Load user data
    function loadUserData() {
        profilePreview.src = window.currentUser.profilePic || 'images/account.png';
        if (profileHeader) profileHeader.src = window.currentUser.profilePic || 'images/account.png';
        usernameInput.value = window.currentUser.username;
        updateCounter();
    }
    
    // Update character counter
    function updateCounter() {
        usernameCounter.textContent = `${usernameInput.value.length}/20`;
        usernameCounter.className = 'char-counter';
        if (usernameInput.value.length > 18) {
            usernameCounter.classList.add('warning');
        }
    }
    
    // Handle profile picture upload
    uploadBtn.addEventListener('click', () => {
        profileUpload.click();
    });
    
    profileUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            profilePreview.src = dataUrl;
            if (profileHeader) profileHeader.src = dataUrl;
            localStorage.setItem('profilePic', dataUrl);
            showSaveSuccess();
        };
        reader.readAsDataURL(file);
    });
    
    usernameInput.addEventListener('input', updateCounter);
    
    // Save changes
    async function saveChanges() {
        if (!usernameInput.value.trim()) {
            alert('Username cannot be empty!');
            return;
        }
        
        if (usernameInput.value.length < 3) {
            alert('Username must be at least 3 characters long.');
            return;
        }
        
        if (usernameInput.value.length > 20) {
            alert('Username cannot exceed 20 characters.');
            return;
        }
        
        // Update in database via API
        try {
            const response = await fetch('api/update-profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    profile_pic: localStorage.getItem('profilePic') || window.currentUser.profilePic
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local user object
                window.currentUser.username = usernameInput.value.trim();
                if (localStorage.getItem('profilePic')) {
                    window.currentUser.profilePic = localStorage.getItem('profilePic');
                }
                
                // Update localStorage
                localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
                
                showSaveSuccess();
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save changes. Please try again.');
        }
    }
    
    saveBtn.addEventListener('click', saveChanges);
    
    function showSaveSuccess() {
        saveSuccess.classList.add('active');
        setTimeout(() => {
            saveSuccess.classList.remove('active');
        }, 3000);
    }
    
    cancelBtn.addEventListener('click', function() {
        if (confirm('Discard all changes?')) {
            loadUserData();
        }
    });
    
    // Navigation
    document.getElementById('index-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('games-button').addEventListener('click', () => {
        window.location.href = 'games.html';
    });
    
    document.getElementById('updates-button').addEventListener('click', () => {
        window.location.href = 'updates.html';
    });
    
    // Initialize
    loadUserData();
}