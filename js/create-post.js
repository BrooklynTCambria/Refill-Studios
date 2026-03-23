let currentUser = null;
let selectedImage = null;
let formChanged = false;
let imageDataUrl = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for user system
    if (window.userSystemReady) {
        currentUser = await window.userSystemReady;
    } else {
        currentUser = window.currentUser;
    }

    if (!currentUser || !currentUser.isLoggedIn) {
        alert('Please login first');
        window.location.href = 'account.html';
        return;
    }

    // Check if user can post
    if (!currentUser.can_post) {
        alert('You need to select a creative role (Artist, Programmer, Modeler, etc.) to create posts.\n\nGo to Account Settings to select your role.');
        window.location.href = 'account-settings.html';
        return;
    }

    initializeCreatePostPage(currentUser);
});

function initializeCreatePostPage(user) {
    console.log('Initializing create post page with user:', user);

    const form = document.getElementById('create-post-form');
    const headerInput = document.getElementById('post-header');
    const descInput = document.getElementById('post-description');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const imageUpload = document.getElementById('image-upload');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');
    const headerCounter = document.getElementById('header-counter');
    const descCounter = document.getElementById('desc-counter');
    const postingUsername = document.getElementById('posting-username');
    const userRoleBadge = document.getElementById('user-role-badge');

    // Display user info
    if (postingUsername) postingUsername.textContent = user.username;
    if (userRoleBadge) userRoleBadge.textContent = user.role.toUpperCase();

    // Update user info banner based on role
    const userInfoBanner = document.getElementById('user-info-banner');
    if (user.role !== 'Default') {
        if (userInfoBanner) userInfoBanner.classList.add('active-role');
        if (userRoleBadge) userRoleBadge.classList.add('creative-role');
    }

    // Character counters
    if (headerInput && headerCounter) {
        headerInput.addEventListener('input', () => {
            const length = headerInput.value.length;
            headerCounter.textContent = `${length}/100`;
            formChanged = true;
        });
    }

    if (descInput && descCounter) {
        descInput.addEventListener('input', () => {
            const length = descInput.value.length;
            descCounter.textContent = `${length}/1000`;
            formChanged = true;
        });
    }

    // Image upload handling
    if (imageUpload && imageInput) {
        // Click to upload
        imageUpload.addEventListener('click', () => {
            imageInput.click();
        });

        // Drag and drop
        imageUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUpload.style.borderColor = '#888';
            imageUpload.style.backgroundColor = '#464646';
        });

        imageUpload.addEventListener('dragleave', () => {
            imageUpload.style.borderColor = '#525252';
            imageUpload.style.backgroundColor = '#414141';
        });

        imageUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUpload.style.borderColor = '#525252';
            imageUpload.style.backgroundColor = '#414141';
            
            if (e.dataTransfer.files.length) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });

        // File input change
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImageFile(e.target.files[0]);
            }
        });
    }

    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPEG, PNG, GIF, etc.)');
            return;
        }
        
        // Limit to 5MB for posts
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
            console.log('Image loaded, Base64 length:', imageDataUrl.length);
        };
        reader.readAsDataURL(file);
    }

    // Remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            selectedImage = null;
            imageDataUrl = null;
            if (previewImage) previewImage.src = '';
            if (imagePreview) imagePreview.style.display = 'none';
            if (imageUpload) imageUpload.style.display = 'block';
            if (imageInput) imageInput.value = '';
            formChanged = true;
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const header = headerInput?.value.trim();
            const description = descInput?.value.trim();

            if (!header) {
                alert('Please enter a post header');
                headerInput?.focus();
                return;
            }

            if (!description) {
                alert('Please enter a post description');
                descInput?.focus();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';
            }

            const postData = {
                header: header,
                description: description,
                image: imageDataUrl ? { dataUrl: imageDataUrl } : null
            };

            try {
                console.log('Sending post data...');
                const response = await fetch('api/posts.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });

                const result = await response.json();
                console.log('Server response:', result);

                if (result.success) {
                    alert('Post created successfully!');
                    window.location.href = 'updates.html';
                } else {
                    alert(result.error || 'Failed to create post');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Post';
                    }
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('Error creating post: ' + error.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Post';
                }
            }
        });
    }

    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
            }
            window.location.href = 'updates.html';
        });
    }

    // Navigation with unsaved changes check
    const navButtons = ['index-button', 'games-button', 'updates-button'];
    navButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                if (formChanged && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    e.preventDefault();
                    return;
                }
                if (btnId === 'index-button') window.location.href = 'index.html';
                if (btnId === 'games-button') window.location.href = 'games.html';
                if (btnId === 'updates-button') window.location.href = 'updates.html';
            });
        }
    });

    // Warn before leaving
    window.addEventListener('beforeunload', (e) => {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}