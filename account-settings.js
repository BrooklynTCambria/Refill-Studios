// Simple Account Settings Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'account.html';
        return;
    }
    
    // Check if user is logged in using the unified system
    if (!window.currentUser || !window.currentUser.isLoggedIn) {
        alert('Please login first');
        window.location.href = 'account.html';
        return;
    }
    
    // Load user data from the unified system
    const userData = {
        username: window.currentUser.username || 'Guest',
        profilePic: window.currentUser.profilePic || 'images/account.png'
    };
    
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
        profilePreview.src = userData.profilePic;
        profileHeader.src = userData.profilePic;
        usernameInput.value = userData.username;
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
            profilePreview.src = dataUrl;
            profileHeader.src = dataUrl;
            
            // Save to localStorage
            localStorage.setItem('profilePic', dataUrl);
            
            // Show success message
            showSaveSuccess();
        };
        
        reader.readAsDataURL(file);
    });
    
    // Handle character counter
    usernameInput.addEventListener('input', updateCounter);
    
    // Save changes
    function saveChanges() {
        // Validate input
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
        
        // Update the unified user system
        window.currentUser.username = usernameInput.value.trim();
        
        // Save to localStorage using the unified system
        if (window.updateUserData) {
            window.updateUserData();
        } else {
            // Fallback
            localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
            localStorage.setItem('currentUser', JSON.stringify({
                username: window.currentUser.username,
                role: window.currentUser.role,
                isLoggedIn: window.currentUser.isLoggedIn
            }));
        }
        
        // Also update profile picture separately if it exists
        if (localStorage.getItem('profilePic')) {
            window.currentUser.profilePic = localStorage.getItem('profilePic');
        }
        
        // Show success message
        showSaveSuccess();
    }
    
    saveBtn.addEventListener('click', saveChanges);
    
    // Show save success message
    function showSaveSuccess() {
        saveSuccess.classList.add('active');
        setTimeout(() => {
            saveSuccess.classList.remove('active');
        }, 3000);
    }
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
        if (confirm('Discard all changes?')) {
            loadUserData(); // Reload original data
            showSaveSuccess(); // Show saved message
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
});