// ============================================
// CREATE POST PAGE - MAIN SCRIPT (PHP Backend)
// ============================================

// Global variables
let selectedImage = null;
let formChanged = false;
let imageDataUrl = null;
let currentUser = window.currentUser || { username: 'Guest', role: 'user' };

// DOM Elements cache
let form, headerInput, descInput, headerCounter, descCounter;
let imageUpload, imageInput, imagePreview, previewImage, removeImageBtn;
let submitBtn, cancelBtn, successMessage;
let userInfoBanner, postingUsername, userRoleBadge;

document.addEventListener('DOMContentLoaded', function() {
    cacheDOMElements();
    
    // Wait for user system to initialize
    setTimeout(() => {
        if (!loadUserData()) return;
        initializeForm();
        setupNavigation();
        setupEventListeners();
    }, 100);
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
    // Use the unified user system
    currentUser = window.currentUser || JSON.parse(localStorage.getItem('refillUser'));
    
    if (!currentUser || !currentUser.isLoggedIn) {
        alert('Please log in to create posts.');
        window.location.href = 'account.html';
        return false;
    }
    
    // Check if user has permission
    if (currentUser.role !== 'admin' && currentUser.role !== 'developer') {
        alert('Only admins and developers can create posts.');
        window.location.href = 'updates.html';
        return false;
    }
    
    // Update UI
    if (postingUsername) {
        postingUsername.textContent = currentUser.username;
    }
    
    if (userRoleBadge) {
        userRoleBadge.textContent = currentUser.role.toUpperCase();
        if (currentUser.role === 'admin') {
            userInfoBanner.classList.add('admin');
            userRoleBadge.classList.add('admin');
        }
    }
    
    return true;
}

function initializeForm() {
    headerInput.addEventListener('input', updateHeaderCounter);
    descInput.addEventListener('input', updateDescCounter);
    
    [headerInput, descInput].forEach(input => {
        input.addEventListener('input', () => { formChanged = true; });
    });
}

function updateHeaderCounter() {
    const length = this.value.length;
    headerCounter.textContent = `${length}/100`;
    updateCounterStyle(headerCounter, length, 90, 100);
}

function updateDescCounter() {
    const length = this.value.length;
    descCounter.textContent = `${length}/1000`;
    updateCounterStyle(descCounter, length, 900, 1000);
}

function updateCounterStyle(counter, length, warningThreshold, maxLength) {
    counter.classList.remove('warning', 'error');
    if (length > warningThreshold) {
        counter.classList.add('warning');
    }
    if (length >= maxLength) {
        counter.classList.add('error');
    }
}

function setupImageUploadListeners() {
    imageUpload.addEventListener('click', () => imageInput.click());
    imageUpload.addEventListener('dragover', handleDragOver);
    imageUpload.addEventListener('dragleave', handleDragLeave);
    imageUpload.addEventListener('drop', handleDrop);
    imageInput.addEventListener('change', handleFileInput);
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
    handleDragLeave();
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
        alert('Please select an image file');
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

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    // Convert image to base64 for sending
    if (selectedImage && imageDataUrl) {
        createPostWithImage();
    } else {
        createPost(null);
    }
}

function validateForm() {
    if (!headerInput.value.trim()) {
        alert('Please enter a post header');
        headerInput.focus();
        return false;
    }
    if (!descInput.value.trim()) {
        alert('Please enter a post description');
        descInput.focus();
        return false;
    }
    return true;
}

async function createPostWithImage() {
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        await createPost(e.target.result);
    };
    reader.readAsDataURL(selectedImage);
}

async function createPost(imageData) {
    try {
        const postData = {
            header: headerInput.value.trim(),
            description: descInput.value.trim(),
            image_url: imageData || null
        };
        
        const response = await fetch('api/posts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            successMessage.classList.add('active');
            
            // Reset form
            setTimeout(() => {
                resetForm();
                setTimeout(() => {
                    window.location.href = 'updates.html';
                }, 2000);
            }, 1000);
        } else {
            alert('Error creating post: ' + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create post. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
    }
}

function resetForm() {
    form.reset();
    selectedImage = null;
    imageDataUrl = null;
    previewImage.src = '';
    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';
    imageInput.value = '';
    
    headerCounter.textContent = '0/100';
    descCounter.textContent = '0/1000';
    headerCounter.classList.remove('warning', 'error');
    descCounter.classList.remove('warning', 'error');
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
    formChanged = false;
}

function setupNavigation() {
    document.getElementById('index-button').addEventListener('click', () => {
        if (formChanged && !confirm('Unsaved changes. Leave?')) return;
        window.location.href = 'index.html';
    });
    
    document.getElementById('games-button').addEventListener('click', () => {
        if (formChanged && !confirm('Unsaved changes. Leave?')) return;
        window.location.href = 'games.html';
    });
    
    document.getElementById('updates-button').addEventListener('click', () => {
        if (formChanged && !confirm('Unsaved changes. Leave?')) return;
        window.location.href = 'updates.html';
    });
    
    cancelBtn.addEventListener('click', () => {
        if (formChanged && !confirm('Unsaved changes. Cancel?')) return;
        window.location.href = 'updates.html';
    });
}

function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    setupImageUploadListeners();
    
    window.addEventListener('beforeunload', (e) => {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = 'Unsaved changes. Leave?';
        }
    });
}