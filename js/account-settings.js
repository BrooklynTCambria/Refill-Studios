// account-settings.js - With simple delete button

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for user system to be ready
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

    initializeAccountSettings(currentUser);
});

function initializeAccountSettings(user) {
    console.log('Initializing account settings with user:', user);

    const profilePreview = document.getElementById('profile-preview-large');
    const usernameInput = document.getElementById('username-input');
    const usernameCounter = document.getElementById('username-counter');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const uploadBtn = document.getElementById('upload-profile-btn');
    const fileInput = document.getElementById('profile-upload');
    const saveSuccess = document.getElementById('save-success');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    let newProfilePicData = null;

    // Load user data into form
    if (profilePreview) {
        profilePreview.src = user.profilePic || 'images/account.png';
    }
    
    if (usernameInput) {
        usernameInput.value = user.username || '';
        usernameCounter.textContent = `${user.username?.length || 0}/20`;
    }

    // Username input counter
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            const length = usernameInput.value.length;
            usernameCounter.textContent = `${length}/20`;
            
            if (length > 18) {
                usernameCounter.classList.add('warning');
            } else {
                usernameCounter.classList.remove('warning');
            }
        });
    }

    // Upload button click
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
                alert('Profile picture must be less than 2MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;
            
            try {
                const reader = new FileReader();
                
                const base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                
                newProfilePicData = base64Data;
                
                if (profilePreview) {
                    profilePreview.src = base64Data;
                }
                
                alert('Image loaded. Click Save Changes to apply.');
                
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error reading image file');
            } finally {
                uploadBtn.textContent = 'Change Picture';
                uploadBtn.disabled = false;
            }
        });
    }

    // Save changes
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const newUsername = usernameInput?.value.trim();
            
            if (!newUsername) {
                alert('Username cannot be empty');
                return;
            }
            
            if (newUsername.length < 3) {
                alert('Username must be at least 3 characters');
                return;
            }
            
            if (newUsername.length > 20) {
                alert('Username cannot exceed 20 characters');
                return;
            }
            
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            try {
                const updateData = {
                    username: newUsername
                };
                
                if (newProfilePicData) {
                    updateData.profile_pic = newProfilePicData;
                }
                
                const response = await fetch('api/users.php', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentUser.username = newUsername;
                    if (newProfilePicData) {
                        currentUser.profilePic = newProfilePicData;
                    }
                    
                    localStorage.setItem('refillUser', JSON.stringify({
                        username: currentUser.username,
                        role: currentUser.role,
                        isLoggedIn: true,
                        profilePic: currentUser.profilePic
                    }));
                    
                    if (window.currentUser) {
                        window.currentUser.username = newUsername;
                        if (newProfilePicData) {
                            window.currentUser.profilePic = newProfilePicData;
                        }
                    }
                    
                    if (saveSuccess) {
                        saveSuccess.classList.add('active');
                        setTimeout(() => {
                            saveSuccess.classList.remove('active');
                        }, 3000);
                    }
                    
                    newProfilePicData = null;
                    
                    if (window.createUniversalHeader) {
                        setTimeout(() => {
                            window.createUniversalHeader();
                        }, 100);
                    }
                    
                } else {
                    alert(result.message || 'Failed to save settings');
                }
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('Error saving settings: ' + error.message);
            } finally {
                saveBtn.textContent = 'Save Changes';
                saveBtn.disabled = false;
            }
        });
    }
    
    // SIMPLE DELETE ACCOUNT BUTTON - Just a confirmation dialog
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            // Simple are you sure dialog
            const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            
            if (!confirmed) {
                return;
            }
            
            // Ask for password
            const password = prompt('Please enter your password to confirm:');
            
            if (!password) {
                alert('Password required to delete account.');
                return;
            }
            
            // Show deleting state
            const originalText = deleteAccountBtn.textContent;
            deleteAccountBtn.textContent = 'deleting...';
            deleteAccountBtn.disabled = true;
            
            try {
                const response = await fetch('api/users.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confirmPassword: password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Your account has been deleted. Goodbye!');
                    
                    // Clear all local data
                    localStorage.clear();
                    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    
                    // Reset current user
                    window.currentUser = {
                        username: 'Guest',
                        role: 'user',
                        isLoggedIn: false,
                        profilePic: 'images/account.png'
                    };
                    
                    // Redirect to home page
                    window.location.href = 'index.html';
                } else {
                    alert(result.message || 'Failed to delete account. Incorrect password?');
                    deleteAccountBtn.textContent = originalText;
                    deleteAccountBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Error deleting account: ' + error.message);
                deleteAccountBtn.textContent = originalText;
                deleteAccountBtn.disabled = false;
            }
        });
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'updates.html';
        });
    }
}