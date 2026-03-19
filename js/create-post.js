// updated-create-post.js - Backend-connected Create Post Page

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

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin or developer
    if (!window.currentUser || 
        (window.currentUser.role !== 'admin' && window.currentUser.role !== 'developer')) {
        alert('Only admins and developers can create posts.');
        window.location.href = 'updates.html';
        return;
    }
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Load user data
    loadUserData();
    
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

function loadUserData() {
    if (window.currentUser) {
        currentUser = window.currentUser;
        
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
    }
}

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

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    // Create post object
    const post = {
        header: headerInput.value.trim(),
        description: descInput.value.trim(),
        image: imageDataUrl ? {
            dataUrl: imageDataUrl,
            name: selectedImage ? selectedImage.name : 'image',
            type: selectedImage ? selectedImage.type : 'image/jpeg',
            size: selectedImage ? selectedImage.size : 0
        } : null
    };
    
    try {
        const response = await fetch('api/posts.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            successMessage.classList.add('active');
            
            // Save to session for notification
            sessionStorage.setItem('newPostAdded', 'true');
            sessionStorage.setItem('latestPost', JSON.stringify({
                header: post.header,
                id: data.id
            }));
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'updates.html';
            }, 3000);
        } else {
            alert('Failed to create post. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
        }
    } catch (error) {
        console.error('Failed to create post:', error);
        alert('Failed to create post. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
    }
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