// account-settings.js - Updated version

document.addEventListener('DOMContentLoaded', function() {
    // Wait for user system to be ready
    if (window.userSystemReady) {
        window.userSystemReady.then((user) => {
            initializeAccountSettings(user);
        });
    } else {
        // Fallback: wait a bit and check
        setTimeout(() => {
            if (window.currentUser) {
                initializeAccountSettings(window.currentUser);
            } else {
                alert('Please login first');
                window.location.href = 'account.html';
            }
        }, 200);
    }
});

function initializeAccountSettings(user) {
    console.log('Initializing account settings with user:', user);
    
    // Check if user is logged in
    if (!user || !user.isLoggedIn) {
        alert('Please login first');
        window.location.href = 'account.html';
        return;
    }
    
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
    
    // Load user data into form
    function loadUserData() {
        if (profilePreview) {
            profilePreview.src = user.profilePic || 'images/account.png';
        }
        if (profileHeader) {
            profileHeader.src = user.profilePic || 'images/account.png';
        }
        if (usernameInput) {
            usernameInput.value = user.username;
        }
        updateCounter();
    }
    
    // Update character counter
    function updateCounter() {
        if (usernameCounter && usernameInput) {
            usernameCounter.textContent = `${usernameInput.value.length}/20`;
            usernameCounter.className = 'char-counter';
            
            if (usernameInput.value.length > 18) {
                usernameCounter.classList.add('warning');
            }
        }
    }
    
    // Handle profile picture upload
    if (uploadBtn && profileUpload) {
        uploadBtn.addEventListener('click', () => {
            profileUpload.click();
        });
    }
    
    if (profileUpload) {
        profileUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check if it's an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file.');
                return;
            }
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                
                // Update preview images
                if (profilePreview) profilePreview.src = dataUrl;
                if (profileHeader) profileHeader.src = dataUrl;
                
                // Save to localStorage temporarily (will be synced on save)
                localStorage.setItem('profilePic', dataUrl);
                if (window.currentUser) window.currentUser.profilePic = dataUrl;
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Handle character counter
    if (usernameInput) {
        usernameInput.addEventListener('input', updateCounter);
    }
    
    // Save changes
    async function saveChanges() {
        // Validate input
        if (!usernameInput || !usernameInput.value.trim()) {
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
        
        // Prepare settings to update
        const settings = {};
        
        if (usernameInput.value.trim() !== user.username) {
            settings.username = usernameInput.value.trim();
        }
        
        if (localStorage.getItem('profilePic')) {
            settings.profile_pic = localStorage.getItem('profilePic');
        }
        
        // Update via API if there are changes
        if (Object.keys(settings).length > 0 && window.updateUserSettings) {
            const result = await window.updateUserSettings(settings);
            
            if (result.success) {
                showSaveSuccess();
                
                // Update local user object
                if (settings.username) {
                    user.username = settings.username;
                    if (window.currentUser) window.currentUser.username = settings.username;
                }
                if (settings.profile_pic) {
                    user.profilePic = settings.profile_pic;
                    if (window.currentUser) window.currentUser.profilePic = settings.profile_pic;
                }
                
                // Update header if it exists
                const headerUsername = document.getElementById('account-link-text');
                if (headerUsername) headerUsername.textContent = user.username;
                
                const headerPic = document.getElementById('profile-pic-header');
                if (headerPic) headerPic.src = user.profilePic;
            }
        } else {
            showSaveSuccess();
        }
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveChanges);
    }
    
    // Show save success message
    function showSaveSuccess() {
        if (saveSuccess) {
            saveSuccess.classList.add('active');
            setTimeout(() => {
                saveSuccess.classList.remove('active');
            }, 3000);
        }
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Discard all changes?')) {
                loadUserData(); // Reload original data
                localStorage.removeItem('profilePic'); // Clear temporary profile pic
            }
        });
    }
    
    // Navigation
    const indexBtn = document.getElementById('index-button');
    const gamesBtn = document.getElementById('games-button');
    const updatesBtn = document.getElementById('updates-button');
    
    if (indexBtn) {
        indexBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    if (gamesBtn) {
        gamesBtn.addEventListener('click', () => {
            window.location.href = 'games.html';
        });
    }
    
    if (updatesBtn) {
        updatesBtn.addEventListener('click', () => {
            window.location.href = 'updates.html';
        });
    }
    
    // Initialize
    loadUserData();
}