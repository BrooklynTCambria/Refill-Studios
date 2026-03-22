// create-post.js - Fixed version

let currentUser = null;
let selectedImage = null;
let formChanged = false;
let imageDataUrl = null;

// DOM Elements cache
let form, headerInput, descInput, headerCounter, descCounter;
let imageUpload, imageInput, imagePreview, previewImage, removeImageBtn;
let submitBtn, cancelBtn, successMessage;
let userInfoBanner, postingUsername, userRoleBadge;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Create post page loaded');
    
    // Wait for user system to be ready
    if (window.userSystemReady) {
        window.userSystemReady.then((user) => {
            checkUserAndInitialize(user);
        });
    } else {
        setTimeout(() => {
            if (window.currentUser) {
                checkUserAndInitialize(window.currentUser);
            } else {
                console.error('No user data available');
                alert('Please login first');
                window.location.href = 'account.html';
            }
        }, 500);
    }
});

function checkUserAndInitialize(user) {
    console.log('Checking user for create post:', user);
    
    // Check if user is logged in
    if (!user || !user.isLoggedIn) {
        alert('Please login first');
        window.location.href = 'account.html';
        return;
    }
    
    // Check if user has permissions
    if (user.role !== 'admin' && user.role !== 'developer') {
        alert('Only admins and developers can create posts.');
        window.location.href = 'updates.html';
        return;
    }
    
    currentUser = user;
    initializeCreatePostPage();
}

function initializeCreatePostPage() {
    console.log('Initializing create post page with user:', currentUser);
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Load user data
    loadUserData();
    
    // Initialize form
    initializeForm();
    
    // Setup navigation and event listeners
    setupNavigation();
    setupEventListeners();
}

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
    if (currentUser) {
        if (postingUsername) {
            postingUsername.textContent = currentUser.username;
        }
        
        if (userRoleBadge) {
            userRoleBadge.textContent = currentUser.role.toUpperCase();
            
            if (currentUser.role === 'admin') {
                if (userInfoBanner) userInfoBanner.classList.add('admin');
                userRoleBadge.classList.add('admin');
            } else if (currentUser.role === 'developer') {
                if (userInfoBanner) userInfoBanner.style.backgroundColor = '#2d4a2d';
                if (userInfoBanner) userInfoBanner.style.color = '#a3d9a3';
            }
        }
    }
}

function initializeForm() {
    if (headerInput) {
        headerInput.addEventListener('input', updateHeaderCounter);
    }
    if (descInput) {
        descInput.addEventListener('input', updateDescCounter);
    }
    
    if (headerInput && descInput) {
        [headerInput, descInput].forEach(input => {
            input.addEventListener('input', () => {
                formChanged = true;
            });
        });
    }
}

function updateHeaderCounter() {
    const length = this.value.length;
    if (headerCounter) {
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
}

function updateDescCounter() {
    const length = this.value.length;
    if (descCounter) {
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
}

function setupImageUploadListeners() {
    if (!imageUpload || !imageInput) return;
    
    imageUpload.addEventListener('click', () => imageInput.click());
    
    imageUpload.addEventListener('dragover', handleDragOver);
    imageUpload.addEventListener('dragleave', handleDragLeave);
    imageUpload.addEventListener('drop', handleDrop);
    
    imageInput.addEventListener('change', handleFileInput);
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeImage);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    if (imageUpload) {
        imageUpload.style.borderColor = '#888';
        imageUpload.style.backgroundColor = '#464646';
    }
}

function handleDragLeave() {
    if (imageUpload) {
        imageUpload.style.borderColor = '#525252';
        imageUpload.style.backgroundColor = '#414141';
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (imageUpload) {
        imageUpload.style.borderColor = '#525252';
        imageUpload.style.backgroundColor = '#414141';
    }
    
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
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imageDataUrl = e.target.result;
        if (previewImage) previewImage.src = imageDataUrl;
        if (imagePreview) imagePreview.style.display = 'block';
        if (imageUpload) imageUpload.style.display = 'none';
        formChanged = true;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImage = null;
    imageDataUrl = null;
    if (previewImage) previewImage.src = '';
    if (imagePreview) imagePreview.style.display = 'none';
    if (imageUpload) imageUpload.style.display = 'block';
    if (imageInput) imageInput.value = '';
    formChanged = true;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
    }
    
    const post = {
        header: headerInput ? headerInput.value.trim() : '',
        description: descInput ? descInput.value.trim() : '',
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
            if (successMessage) successMessage.classList.add('active');
            
            sessionStorage.setItem('newPostAdded', 'true');
            sessionStorage.setItem('latestPost', JSON.stringify({
                header: post.header,
                id: data.id
            }));
            
            setTimeout(() => {
                window.location.href = 'updates.html';
            }, 3000);
        } else {
            alert('Failed to create post. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post';
            }
        }
    } catch (error) {
        console.error('Failed to create post:', error);
        alert('Failed to create post. Please try again.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
        }
    }
}

function validateForm() {
    if (!headerInput || !headerInput.value.trim()) {
        alert('Please enter a post header');
        if (headerInput) headerInput.focus();
        return false;
    }
    
    if (!descInput || !descInput.value.trim()) {
        alert('Please enter a post description');
        if (descInput) descInput.focus();
        return false;
    }
    
    return true;
}

function setupNavigation() {
    const indexBtn = document.getElementById('index-button');
    const gamesBtn = document.getElementById('games-button');
    const updatesBtn = document.getElementById('updates-button');
    
    if (indexBtn) {
        indexBtn.addEventListener('click', () => {
            if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
            window.location.href = 'index.html';
        });
    }
    
    if (gamesBtn) {
        gamesBtn.addEventListener('click', () => {
            if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
            window.location.href = 'games.html';
        });
    }
    
    if (updatesBtn) {
        updatesBtn.addEventListener('click', () => {
            if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
            window.location.href = 'updates.html';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (formChanged && !confirm('You have unsaved changes. Are you sure you want to cancel?')) return;
            window.location.href = 'updates.html';
        });
    }
}

function setupEventListeners() {
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    setupImageUploadListeners();
    
    window.addEventListener('beforeunload', (e) => {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}