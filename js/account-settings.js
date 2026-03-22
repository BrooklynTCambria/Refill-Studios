// account-settings.js - Updated with role dropdown

let currentUser = null;
let availableRoles = [];

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

    // Fetch available roles
    await loadAvailableRoles();
    initializeAccountSettings(currentUser);
});

async function loadAvailableRoles() {
    try {
        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_roles' })
        });
        
        const result = await response.json();
        if (result.success) {
            availableRoles = result.roles;
        } else {
            console.error('Failed to load roles:', result.message);
            // Fallback roles
            availableRoles = [
                { role_name: 'Default', can_post: false, is_admin: false },
                { role_name: 'Artist', can_post: true, is_admin: false },
                { role_name: 'Programmer', can_post: true, is_admin: false },
                { role_name: 'Modeler', can_post: true, is_admin: false },
                { role_name: 'Sound Designer', can_post: true, is_admin: false },
                { role_name: 'Game Designer', can_post: true, is_admin: false },
                { role_name: 'Writer', can_post: true, is_admin: false },
                { role_name: 'Animator', can_post: true, is_admin: false },
                { role_name: 'UI/UX Designer', can_post: true, is_admin: false }
            ];
        }
    } catch (error) {
        console.error('Error loading roles:', error);
    }
}

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
    
    // Create role dropdown if it doesn't exist
    let roleSelect = document.getElementById('role-select');
    if (!roleSelect) {
        const roleContainer = document.createElement('div');
        roleContainer.className = 'role-select-container';
        roleContainer.style.marginTop = '20px';
        roleContainer.style.marginBottom = '20px';
        
        const roleLabel = document.createElement('label');
        roleLabel.textContent = 'Select Your Role:';
        roleLabel.style.display = 'block';
        roleLabel.style.marginBottom = '8px';
        roleLabel.style.color = '#d0d0d0';
        roleLabel.style.fontWeight = 'bold';
        
        roleSelect = document.createElement('select');
        roleSelect.id = 'role-select';
        roleSelect.className = 'role-dropdown';
        roleSelect.style.width = '100%';
        roleSelect.style.padding = '10px';
        roleSelect.style.backgroundColor = '#333';
        roleSelect.style.color = 'white';
        roleSelect.style.border = '2px solid #525252';
        roleSelect.style.borderRadius = '5px';
        roleSelect.style.fontSize = '14px';
        roleSelect.style.cursor = 'pointer';
        
        // Add role description
        const roleDesc = document.createElement('p');
        roleDesc.id = 'role-description';
        roleDesc.style.fontSize = '12px';
        roleDesc.style.color = '#aaa';
        roleDesc.style.marginTop = '8px';
        roleDesc.style.fontStyle = 'italic';
        
        roleContainer.appendChild(roleLabel);
        roleContainer.appendChild(roleSelect);
        roleContainer.appendChild(roleDesc);
        
        // Insert after username input
        const usernameContainer = document.querySelector('.username-input-container');
        usernameContainer.insertAdjacentElement('afterend', roleContainer);
    }

    let newProfilePicData = null;

    // Populate role dropdown
    if (roleSelect) {
        roleSelect.innerHTML = '';
        availableRoles.forEach(role => {
            // Don't show admin option to regular users
            if (role.is_admin && user.role !== 'Admin') {
                return;
            }
            
            const option = document.createElement('option');
            option.value = role.role_name;
            option.textContent = role.role_name;
            if (role.role_name === user.role) {
                option.selected = true;
            }
            roleSelect.appendChild(option);
        });
        
        // Update description when role changes
        roleSelect.addEventListener('change', () => {
            const selectedRole = availableRoles.find(r => r.role_name === roleSelect.value);
            const descElement = document.getElementById('role-description');
            if (descElement && selectedRole) {
                if (selectedRole.can_post) {
                    descElement.textContent = `✓ As a ${selectedRole.role_name}, you will be able to create and publish posts.`;
                    descElement.style.color = '#a3d9a3';
                } else {
                    descElement.textContent = `ℹ️ As a ${selectedRole.role_name}, you can only comment on posts. Select a creative role to gain posting permissions.`;
                    descElement.style.color = '#ffcc00';
                }
            }
        });
        
        // Trigger initial description
        roleSelect.dispatchEvent(new Event('change'));
    }

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
            const selectedRole = roleSelect?.value;
            
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
                
                if (selectedRole && selectedRole !== currentUser.role) {
                    updateData.selected_role = selectedRole;
                }
                
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
                    
                    if (result.user) {
                        currentUser.role = result.user.role;
                        currentUser.can_post = result.user.can_post;
                    } else if (selectedRole) {
                        currentUser.role = selectedRole;
                        const roleInfo = availableRoles.find(r => r.role_name === selectedRole);
                        currentUser.can_post = roleInfo ? roleInfo.can_post : false;
                    }
                    
                    localStorage.setItem('refillUser', JSON.stringify({
                        username: currentUser.username,
                        role: currentUser.role,
                        can_post: currentUser.can_post,
                        isLoggedIn: true,
                        profilePic: currentUser.profilePic
                    }));
                    
                    if (window.currentUser) {
                        window.currentUser.username = newUsername;
                        if (newProfilePicData) {
                            window.currentUser.profilePic = newProfilePicData;
                        }
                        window.currentUser.role = currentUser.role;
                        window.currentUser.can_post = currentUser.can_post;
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
                    
                    // Show success message with role info
                    if (selectedRole && selectedRole !== currentUser.role) {
                        const roleInfo = availableRoles.find(r => r.role_name === selectedRole);
                        if (roleInfo && roleInfo.can_post) {
                            alert(`Role updated to ${selectedRole}! You can now create posts.`);
                        } else if (roleInfo && !roleInfo.can_post) {
                            alert(`Role updated to ${selectedRole}. You can comment on posts but cannot create posts.`);
                        }
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
    
    // Delete account button
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            
            if (!confirmed) {
                return;
            }
            
            const password = prompt('Please enter your password to confirm:');
            
            if (!password) {
                alert('Password required to delete account.');
                return;
            }
            
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
                    
                    localStorage.clear();
                    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    
                    window.currentUser = {
                        username: 'Guest',
                        role: 'Default',
                        can_post: false,
                        isLoggedIn: false,
                        profilePic: 'images/account.png'
                    };
                    
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