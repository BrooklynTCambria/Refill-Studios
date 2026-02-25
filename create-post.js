// ============================================
// CREATE POST PAGE - MAIN SCRIPT
// ============================================

// Global variables
let currentUser = {
    username: 'Guest',
    role: 'user'
};

let selectedImage = null;
let formChanged = false;
let imageDataUrl = null;

// DOM Elements cache
let form, headerInput, descInput, headerCounter, descCounter;
let imageUpload, imageInput, imagePreview, previewImage, removeImageBtn;
let submitBtn, cancelBtn, successMessage;
let userInfoBanner, postingUsername, userRoleBadge;

// At the beginning of create-post.js, add this check:
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin or developer
    const currentUser = JSON.parse(localStorage.getItem('refillUser') || localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'developer')) {
        alert('Only admins and developers can create posts.');
        window.location.href = 'updates.html';
        return;
    }
    
    // ... rest of your existing create-post.js code
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    cacheDOMElements();
    
    // Load user data and check permissions
    if (!loadUserData()) return;
    
    // Initialize form
    initializeForm();
    
    // Setup navigation and event listeners
    setupNavigation();
    setupEventListeners();
});

function cacheDOMElements() {
    form = document.getElementById('create-post-form');
    headerInput = document.getElementById('post-header');
    descInput = document.getElementById('post-description');
    headerCounter = document.getElementById('header-counter');
    descCounter = document.getElementById('desc-counter');
    imageUpload = document.getElementById('image-upload');
    imageInput = document.getElementById('image-input');
    imagePreview = document.getElementById('image-preview');
    previewImage = document.getElementById('preview-image');
    removeImageBtn = document.getElementById('remove-image');
    submitBtn = document.getElementById('submit-btn');
    cancelBtn = document.getElementById('cancel-btn');
    successMessage = document.getElementById('success-message');
    userInfoBanner = document.getElementById('user-info-banner');
    postingUsername = document.getElementById('posting-username');
    userRoleBadge = document.getElementById('user-role-badge');
}

// ============================================
// USER MANAGEMENT
// ============================================
function loadUserData() {
    const savedUser = JSON.parse(localStorage.getItem('refillUser'));
    
    if (savedUser) {
        currentUser = savedUser;
        
        // Update UI with user info
        if (postingUsername) {
            postingUsername.textContent = currentUser.username;
        }
        
        if (userRoleBadge) {
            userRoleBadge.textContent = currentUser.role.toUpperCase();
            
            // Style based on role
            if (currentUser.role === 'admin') {
                userInfoBanner.classList.add('admin');
                userRoleBadge.classList.add('admin');
            } else if (currentUser.role === 'developer') {
                userInfoBanner.style.backgroundColor = '#2d4a2d';
                userInfoBanner.style.color = '#a3d9a3';
            }
        }
        
        // Check if user has permission to create posts
        if (currentUser.role !== 'admin' && currentUser.role !== 'developer') {
            alert('You do not have permission to create posts. Redirecting...');
            setTimeout(() => {
                window.location.href = 'updates.html';
            }, 1500);
            return false;
        }
        
        return true;
    } else {
        alert('Please log in to create posts. Redirecting...');
        setTimeout(() => {
            window.location.href = 'updates.html';
        }, 1500);
        return false;
    }
}

// ============================================
// FORM MANAGEMENT
// ============================================
function initializeForm() {
    // Character counters
    headerInput.addEventListener('input', updateHeaderCounter);
    descInput.addEventListener('input', updateDescCounter);
    
    // Track form changes
    [headerInput, descInput].forEach(input => {
        input.addEventListener('input', () => {
            formChanged = true;
        });
    });
}

function updateHeaderCounter() {
    const length = this.value.length;
    headerCounter.textContent = `${length}/100`;
    
    if (length > 90) {
        headerCounter.classList.add('warning');
        headerCounter.classList.remove('error');
    } else if (length >= 100) {
        headerCounter.classList.add('error');
        headerCounter.classList.remove('warning');
    } else {
        headerCounter.classList.remove('warning', 'error');
    }
}

function updateDescCounter() {
    const length = this.value.length;
    descCounter.textContent = `${length}/1000`;
    
    if (length > 900) {
        descCounter.classList.add('warning');
        descCounter.classList.remove('error');
    } else if (length >= 1000) {
        descCounter.classList.add('error');
        descCounter.classList.remove('warning');
    } else {
        descCounter.classList.remove('warning', 'error');
    }
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
function setupImageUploadListeners() {
    // Click to upload
    imageUpload.addEventListener('click', () => imageInput.click());
    
    // Drag and drop
    imageUpload.addEventListener('dragover', handleDragOver);
    imageUpload.addEventListener('dragleave', handleDragLeave);
    imageUpload.addEventListener('drop', handleDrop);
    
    // File input change
    imageInput.addEventListener('change', handleFileInput);
    
    // Remove image
    removeImageBtn.addEventListener('click', removeImage);
}

function handleDragOver(e) {
    e.preventDefault();
    imageUpload.style.borderColor = '#888';
    imageUpload.style.backgroundColor = '#464646';
}

function handleDragLeave() {
    imageUpload.style.borderColor = '#525252';
    imageUpload.style.backgroundColor = '#414141';
}

function handleDrop(e) {
    e.preventDefault();
    imageUpload.style.borderColor = '#525252';
    imageUpload.style.backgroundColor = '#414141';
    
    if (e.dataTransfer.files.length) {
        handleImageFile(e.dataTransfer.files[0]);
    }
}

function handleFileInput(e) {
    if (this.files.length) {
        handleImageFile(this.files[0]);
    }
}

function handleImageFile(file) {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    selectedImage = file;
    
    // Read file as Data URL for storage
    const reader = new FileReader();
    reader.onload = function(e) {
        imageDataUrl = e.target.result;
        previewImage.src = imageDataUrl;
        imagePreview.style.display = 'block';
        imageUpload.style.display = 'none';
        formChanged = true;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImage = null;
    imageDataUrl = null;
    previewImage.src = '';
    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';
    imageInput.value = '';
    formChanged = true;
}

// ============================================
// FORM SUBMISSION
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    // Simulate API delay
    setTimeout(createPost, 1500);
}

function validateForm() {
    // Check header
    if (!headerInput.value.trim()) {
        alert('Please enter a post header');
        headerInput.focus();
        return false;
    }
    
    // Check description
    if (!descInput.value.trim()) {
        alert('Please enter a post description');
        descInput.focus();
        return false;
    }
    
    return true;
}

function createPost() {
    // Determine role title based on user role
    let roleTitle = 'Developer';
    if (currentUser.role === 'admin') {
        roleTitle = 'Admin';
    } else if (currentUser.role === 'developer') {
        roleTitle = 'Developer';
    }
    
    // Create post object with image data
    const post = {
        id: Date.now(),
        header: headerInput.value.trim(),
        description: descInput.value.trim(),
        role: roleTitle,
        author: currentUser.username,
        date: getCurrentDate(),
        comments: [], // MAKE SURE THIS IS INCLUDED
        image: imageDataUrl ? {
            dataUrl: imageDataUrl,
            name: selectedImage ? selectedImage.name : 'image',
            type: selectedImage ? selectedImage.type : 'image/jpeg',
            size: selectedImage ? selectedImage.size : 0
        } : null,
        comments: []
    };
    
    // Save post to localStorage
    savePostToStorage(post);
    
    // Show success message
    successMessage.classList.add('active');
    
    // Save to session for notification
    sessionStorage.setItem('newPostAdded', 'true');
    sessionStorage.setItem('latestPost', JSON.stringify({
        header: post.header,
        id: post.id
    }));
    
    // Reset form after delay
    setTimeout(() => {
        resetForm();
        
        // Redirect to updates page
        setTimeout(() => {
            window.location.href = 'updates.html';
        }, 2000);
    }, 3000);
}

function getCurrentDate() {
    const now = new Date();
    const options = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
}

function savePostToStorage(post) {
    const existingPosts = JSON.parse(localStorage.getItem('refillPosts') || '[]');
    existingPosts.unshift(post);
    localStorage.setItem('refillPosts', JSON.stringify(existingPosts));
}

function resetForm() {
    form.reset();
    selectedImage = null;
    imageDataUrl = null;
    previewImage.src = '';
    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';
    imageInput.value = '';
    
    // Reset counters
    headerCounter.textContent = '0/100';
    descCounter.textContent = '0/1000';
    headerCounter.classList.remove('warning', 'error');
    descCounter.classList.remove('warning', 'error');
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
    
    formChanged = false;
}

// ============================================
// NAVIGATION & EVENT LISTENERS
// ============================================
function setupNavigation() {
    // Navigation buttons
    document.getElementById('index-button').addEventListener('click', () => {
        if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        window.location.href = 'index.html';
    });
    
    document.getElementById('games-button').addEventListener('click', () => {
        if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        window.location.href = 'games.html';
    });
    
    document.getElementById('updates-button').addEventListener('click', () => {
        if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        window.location.href = 'updates.html';
    });
    
    document.getElementById('create-post-button').addEventListener('click', () => {
        window.location.href = 'create-post.html';
    });
    
    // Account link
    document.getElementById('account-link').addEventListener('click', () => {
        alert(`Account: ${currentUser.username}\nRole: ${currentUser.role}\n\n(In a real app, this would open account settings)`);
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', () => {
        if (formChanged && !confirm('You have unsaved changes. Are you sure you want to cancel?')) return;
        window.location.href = 'updates.html';
    });
}

function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Image upload
    setupImageUploadListeners();
    
    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}