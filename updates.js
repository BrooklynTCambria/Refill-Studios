// ============================================
// UPDATES PAGE - MAIN SCRIPT (With User Sync)
// ============================================

// Global variables
let currentPostId = null;

// ============================================
// USER MANAGEMENT - REFRESH USER DATA
// ============================================
function refreshUserData() {
    // Check both possible storage locations
    const refillUser = JSON.parse(localStorage.getItem('refillUser'));
    const accountUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update window.currentUser with the latest data
    if (refillUser) {
        window.currentUser = {
            ...window.currentUser,
            ...refillUser,
            isLoggedIn: true
        };
        console.log('Updated user from refillUser:', window.currentUser);
    } else if (accountUser) {
        window.currentUser = {
            username: accountUser.username || 'Guest',
            role: accountUser.role || 'user',
            isLoggedIn: true,
            profilePic: localStorage.getItem('profilePic') || 'images/account.png'
        };
        console.log('Updated user from currentUser:', window.currentUser);
    } else {
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        console.log('No user found, set to Guest');
    }
    
    // Save back to refillUser for consistency
    localStorage.setItem('refillUser', JSON.stringify(window.currentUser));
    
    // Force header to update
    if (window.createUniversalHeader) {
        window.createUniversalHeader();
    }
    
    // Update UI elements that depend on user role
    updateUIForUserRole();
    
    return window.currentUser;
}

// ============================================
// POSTS MANAGEMENT
// ============================================
function loadPostsFromStorage() {
    const savedPosts = JSON.parse(localStorage.getItem('refillPosts') || '[]');
    return savedPosts;
}

function getAllPosts() {
    return JSON.parse(localStorage.getItem('refillPosts') || '[]');
}

function saveAllPosts(posts) {
    localStorage.setItem('refillPosts', JSON.stringify(posts));
    console.log('💾 Saved all posts to localStorage:', posts.length, 'posts');
}

function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    postsList.innerHTML = '';
    
    const allPosts = getAllPosts();
    
    // Show empty state if no posts
    if (allPosts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-posts';
        emptyState.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #aaa;">
                <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                <h3 style="color: #d0d0d0; margin-bottom: 10px;">No posts yet</h3>
                <p>Be the first to create a post!</p>
                ${(window.currentUser?.role === 'admin' || window.currentUser?.role === 'developer') 
                    ? '<p><small>Click the + button above to create a post</small></p>' 
                    : '<p><small>Only admins and developers can create posts</small></p>'}
            </div>
        `;
        postsList.appendChild(emptyState);
        return;
    }
    
    allPosts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = `post ${index === 0 ? 'active' : ''}`;
        postElement.setAttribute('data-post-id', post.id);
        
        // Image HTML
        let imageHtml = '';
        if (post.image) {
            let imageSrc = '';
            if (typeof post.image === 'string') {
                imageSrc = post.image;
            } else if (post.image.dataUrl) {
                imageSrc = post.image.dataUrl;
            }
            
            if (imageSrc) {
                imageHtml = `
                    <div class="post-image-container" style="display: block;">
                        <img src="${imageSrc}" alt="Post Image" class="post-image" onclick="openImageModal('${imageSrc}')">
                        <div class="image-label">📎 Attached Image</div>
                    </div>
                `;
            }
        }
        
        postElement.innerHTML = `
            <h3 class="post-header">${post.header}</h3>
            <p class="post-description">${post.description}</p>
            ${imageHtml}
            <div class="post-meta">
                ${post.author || 'Dev Team'} | ${post.role} | <span class="bold-date">${post.date}</span>
            </div>
        `;
        
        postsList.appendChild(postElement);
        
        // Set first post as active
        if (index === 0) {
            currentPostId = post.id;
        }
    });
    
    // Add click events to posts
    setTimeout(() => {
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            post.addEventListener('click', function() {
                posts.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                currentPostId = parseInt(this.getAttribute('data-post-id'));
                loadComments(currentPostId);
            });
        });
        
        // Load comments for first post
        if (allPosts.length > 0) {
            loadComments(currentPostId);
        }
    }, 100);
}

// ============================================
// COMMENTS MANAGEMENT
// ============================================
function loadComments(postId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    // Get comments directly from the post in localStorage
    const allPosts = getAllPosts();
    const post = allPosts.find(p => p.id === postId);
    
    const comments = post?.comments || [];
    
    if (comments.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-comments';
        emptyDiv.textContent = 'No comments yet. Be the first to comment!';
        commentsList.appendChild(emptyDiv);
    } else {
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            
            const commentHeader = document.createElement('div');
            commentHeader.className = 'comment-header';
            commentHeader.innerHTML = `
                <span>${comment.username} | ${comment.date}</span>
                ${comment.isDev ? '<span class="dev-badge">DEV</span>' : ''}
            `;
            
            const commentText = document.createElement('p');
            commentText.className = 'comment-text';
            commentText.textContent = comment.text;
            
            commentElement.appendChild(commentHeader);
            commentElement.appendChild(commentText);
            commentsList.appendChild(commentElement);
        });
    }
    
    commentsList.scrollTop = 0;
}

function addComment(text) {
    if (!text.trim()) return;
    
    // Make sure we have the latest user data
    refreshUserData();
    
    // Create new comment
    const newComment = {
        username: window.currentUser.username,
        isDev: window.currentUser.role === 'developer' || window.currentUser.role === 'admin',
        date: getCurrentTime(),
        text: text.trim()
    };
    
    // Get all posts
    const allPosts = getAllPosts();
    
    // Find the current post
    const postIndex = allPosts.findIndex(p => p.id === currentPostId);
    
    if (postIndex !== -1) {
        // Initialize comments array if it doesn't exist
        if (!allPosts[postIndex].comments) {
            allPosts[postIndex].comments = [];
        }
        
        // Add new comment to the beginning
        allPosts[postIndex].comments.unshift(newComment);
        
        // Save ALL posts back to localStorage
        saveAllPosts(allPosts);
        
        console.log('💬 Comment saved! Total comments:', allPosts[postIndex].comments.length);
        
        // Reload comments to show the new one
        loadComments(currentPostId);
        
        // Clear input and hide form
        const commentInput = document.getElementById('comment-input');
        const commentForm = document.getElementById('comment-form');
        
        if (commentInput) commentInput.value = '';
        if (commentForm) commentForm.classList.remove('active');
    } else {
        console.error('❌ Post not found for comment');
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' today';
}

// ============================================
// IMAGE MODAL FUNCTIONALITY
// ============================================
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    if (modal && modalImg) {
        modalImg.src = imageSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function checkForNewPostNotification() {
    const newPostAdded = sessionStorage.getItem('newPostAdded');
    if (newPostAdded === 'true') {
        const latestPost = JSON.parse(sessionStorage.getItem('latestPost') || '{}');
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2d4a2d;
            color: #a3d9a3;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <strong>✓ New post published!</strong><br>
            "${latestPost.header || 'New Post'}"
        `;
        document.body.appendChild(notification);
        
        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 5000);
        
        sessionStorage.removeItem('newPostAdded');
        sessionStorage.removeItem('latestPost');
    }
}

function updateUIForUserRole() {
    const userRoleIndicator = document.getElementById('user-role-indicator');
    const userRoleNote = document.getElementById('user-role-note');
    const adminAddBtn = document.getElementById('admin-add-post');
    
    // Update role indicator
    if (userRoleIndicator) {
        let roleText = '';
        let roleClass = 'user-role-indicator';
        
        switch(window.currentUser.role) {
            case 'admin':
                roleText = `Welcome, ${window.currentUser.username}! (ADMIN)`;
                roleClass += ' admin-badge';
                break;
            case 'developer':
                roleText = `Welcome, ${window.currentUser.username}! (DEVELOPER)`;
                break;
            default:
                roleText = `Welcome, ${window.currentUser.username}!`;
        }
        
        userRoleIndicator.textContent = roleText;
        userRoleIndicator.className = roleClass;
    }
    
    // Update note
    if (userRoleNote) {
        if (window.currentUser.role === 'admin' || window.currentUser.role === 'developer') {
            userRoleNote.innerHTML = `Click on a post to view and add comments. <span style="color:#ffcc00;">You can create new posts.</span>`;
        } else {
            userRoleNote.textContent = 'Click on a post to view and add comments.';
        }
    }
    
    // Show/hide admin add post button
    if (adminAddBtn) {
        if (window.currentUser.role === 'admin' || window.currentUser.role === 'developer') {
            adminAddBtn.style.display = 'flex';
        } else {
            adminAddBtn.style.display = 'none';
        }
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Navigation
    const indexButton = document.getElementById('index-button');
    const gamesButton = document.getElementById('games-button');
    const updatesButton = document.getElementById('updates-button');
    
    if (indexButton) {
        indexButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    if (gamesButton) {
        gamesButton.addEventListener('click', () => {
            window.location.href = 'games.html';
        });
    }
    
    if (updatesButton) {
        updatesButton.addEventListener('click', () => {
            window.location.href = 'updates.html';
        });
    }
    
    // Admin add post button
    const adminAddBtn = document.getElementById('admin-add-post');
    if (adminAddBtn) {
        adminAddBtn.addEventListener('click', () => {
            // Make sure we have the latest user data
            refreshUserData();
            
            // Check if user is admin or developer
            if (window.currentUser.role === 'admin' || window.currentUser.role === 'developer') {
                window.location.href = 'create-post.html';
            } else {
                alert('Only admins and developers can create posts.');
            }
        });
    }
    
    // Comment system
    const addCommentBtn = document.getElementById('add-comment-btn');
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment');
    const cancelCommentBtn = document.getElementById('cancel-comment');
    
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', () => {
            // Make sure we have the latest user data
            refreshUserData();
            
            if (!window.currentUser.isLoggedIn) {
                alert('Please login to comment.');
                return;
            }
            
            if (commentForm) {
                commentForm.classList.add('active');
                if (commentInput) commentInput.focus();
            }
        });
    }
    
    if (cancelCommentBtn) {
        cancelCommentBtn.addEventListener('click', () => {
            if (commentForm) {
                commentForm.classList.remove('active');
                if (commentInput) commentInput.value = '';
            }
        });
    }
    
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', () => {
            // Make sure we have the latest user data
            refreshUserData();
            
            if (!window.currentUser.isLoggedIn) {
                alert('Please login to comment.');
                return;
            }
            
            if (commentInput) {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    addComment(commentText);
                } else {
                    alert('Please enter a comment.');
                }
            }
        });
    }
    
    if (commentInput) {
        commentInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    addComment(commentText);
                }
            }
        });
    }
    
    // Close modal when clicking outside image
    const imageModal = document.getElementById('image-modal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
        
        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageModal.classList.contains('active')) {
                closeImageModal();
            }
        });
    }
}

// ============================================
// DEBUG FUNCTIONS
// ============================================
function debugLocalStorage() {
    console.log('=== DEBUG LOCALSTORAGE ===');
    const posts = getAllPosts();
    console.log('Total posts:', posts.length);
    
    posts.forEach((post, i) => {
        console.log(`Post ${i + 1}: "${post.header}"`);
        console.log(`  ID: ${post.id}`);
        console.log(`  Comments: ${post.comments ? post.comments.length : 0}`);
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach((comment, ci) => {
                console.log(`    ${ci + 1}. ${comment.username}: ${comment.text}`);
            });
        }
    });
    
    // Show current user
    console.log('Current User:', window.currentUser);
    console.log('refillUser:', JSON.parse(localStorage.getItem('refillUser')));
    console.log('currentUser:', JSON.parse(localStorage.getItem('currentUser')));
    console.log('==========================');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Updates page loaded - Initializing...');
    
    // Refresh user data immediately
    refreshUserData();
    
    // Small delay to ensure everything is loaded
    setTimeout(() => {
        renderPosts();
        setupEventListeners();
        checkForNewPostNotification();
        updateUIForUserRole();
        
        // Debug
        debugLocalStorage();
    }, 100);
});

// Also refresh when the page becomes visible (in case user logged in in another tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, refreshing user data...');
        refreshUserData();
        updateUIForUserRole();
    }
});

// Make functions available globally for onclick attributes
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.refreshUserData = refreshUserData;

// ============================================
// INTEGRATED ACCOUNT DROPDOWN WITH LOGIN
// ============================================

function initializeAccountDropdown() {
    const rightSection = document.querySelector('.right');
    if (!rightSection) return;
    
    // Get current notification setting
    const notifyNewPosts = localStorage.getItem('notifyNewPosts') !== 'false';
    
    // Get all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem('refillUsers') || '{}');
    const isLoggedIn = currentUser.isLoggedIn && allUsers[currentUser.username];
    
    // Create dropdown HTML
    const dropdownHTML = `
        <div class="account-dropdown">
            <div class="account-trigger" id="account-trigger">
                <img src="${currentUser.profilePic || 'images/account.png'}" alt="Account" class="profile-pic-small" id="profile-pic-header">
                <p class="account-link">${currentUser.username}</p>
            </div>
            <div class="dropdown-content" id="dropdown-content">
                ${!isLoggedIn ? `
                <!-- Login Form (when not logged in) -->
                <div class="dropdown-login-form">
                    <div class="error-message" id="login-error"></div>
                    <div class="success-message" id="login-success"></div>
                    <input type="text" class="dropdown-login-input" id="login-username" placeholder="Username">
                    <input type="password" class="dropdown-login-input" id="login-password" placeholder="Password">
                    <button class="dropdown-login-button" id="login-button">Login</button>
                    <div class="dropdown-register-link" id="register-link">Don't have an account? Sign up</div>
                </div>
                ` : `
                <!-- Account Info Display (when logged in) -->
                <div class="account-info-display">
                    <div class="account-info-item">
                        <span class="info-label">User:</span>
                        <span class="info-value">${currentUser.username}</span>
                    </div>
                    <div class="account-info-item">
                        <span class="info-label">Role:</span>
                        <span class="info-value">${currentUser.role}</span>
                    </div>
                    <div class="account-info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${currentUser.email || 'Not set'}</span>
                    </div>
                </div>
                `}
                
                <!-- Notification Toggle (only when logged in) -->
                ${isLoggedIn ? `
                <div class="notification-toggle">
                    <div class="notification-text">
                        <span class="dropdown-icon">🔔</span>
                        <span>New Post Alerts</span>
                    </div>
                    <label class="toggle-switch-small">
                        <input type="checkbox" id="notify-toggle" ${notifyNewPosts ? 'checked' : ''}>
                        <span class="toggle-slider-small"></span>
                    </label>
                </div>
                ` : ''}
                
                <!-- Action Buttons -->
                ${isLoggedIn ? `
                <div class="dropdown-item" id="settings-item">
                    <span class="dropdown-icon">⚙️</span>
                    <span>Settings</span>
                </div>
                ` : ''}
                
                ${isLoggedIn ? `
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" id="logout-item">
                    <span class="dropdown-icon">🚪</span>
                    <span>Logout</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Replace right section content
    rightSection.innerHTML = dropdownHTML;
    
    // Setup dropdown functionality
    setupDropdownEvents();
    checkNotifications();
}

function setupDropdownEvents() {
    const accountTrigger = document.getElementById('account-trigger');
    const dropdownContent = document.getElementById('dropdown-content');
    
    if (!accountTrigger || !dropdownContent) {
        console.error('Dropdown elements not found!');
        return;
    }
    
    // Toggle dropdown
    accountTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });
    
    // Use event delegation for dropdown items - FIXED VERSION
    dropdownContent.addEventListener('click', function(e) {
        // Get the clicked element
        let target = e.target;
        
        // If clicked on icon or text, find the parent dropdown-item
        if (!target.classList.contains('dropdown-item')) {
            target = target.closest('.dropdown-item');
        }
        
        if (!target) return;
        
        const id = target.id;
        console.log('Dropdown item clicked:', id);
        
        switch(id) {
            case 'login-item':
                e.preventDefault();
                e.stopPropagation();
                console.log('Navigating to account.html');
                window.location.href = 'account.html';
                break;
                
            case 'settings-item':
                e.preventDefault();
                e.stopPropagation();
                if (currentUser.isLoggedIn) {
                    console.log('Navigating to account-settings.html');
                    window.location.href = 'account-settings.html';
                }
                break;
                
            case 'logout-item':
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('refillUser');
                    localStorage.removeItem('profilePic');
                    alert('Logged out successfully.');
                    window.location.href = 'updates.html';
                }
                break;
        }
        
        // Close dropdown after clicking
        dropdownContent.classList.remove('active');
    });
    
    // Notification toggle (direct event listener since it's not a dropdown-item)
    const notifyToggle = document.getElementById('notify-toggle');
    if (notifyToggle) {
        notifyToggle.addEventListener('change', function(e) {
            e.stopPropagation();
            localStorage.setItem('notifyNewPosts', this.checked.toString());
            
            if (this.checked) {
                console.log('Notifications enabled');
            } else {
                console.log('Notifications disabled');
                // Hide notification badge if visible
                const badge = document.getElementById('notification-badge');
                if (badge) badge.style.display = 'none';
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.account-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdownContent.classList.remove('active');
        }
    });
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

// Initialize users storage if not exists
function initializeUsersStorage() {
    if (!localStorage.getItem('refillUsers')) {
        localStorage.setItem('refillUsers', JSON.stringify({}));
    }
}

// Get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem('refillUsers') || '{}');
}

// Save user
function saveUser(username, userData) {
    const allUsers = getAllUsers();
    allUsers[username] = userData;
    localStorage.setItem('refillUsers', JSON.stringify(allUsers));
    console.log(`💾 Saved user: ${username}`);
}

// Register new user
function registerUser(username, password, email) {
    const allUsers = getAllUsers();
    
    // Check if username already exists
    if (allUsers[username]) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Create new user
    const newUser = {
        username: username,
        password: password, // In real app, hash this!
        email: email,
        role: 'user',
        profilePic: 'images/account.png',
        memberSince: new Date().toLocaleDateString(),
        notifications: {
            posts: true,
            replies: true,
            games: false
        }
    };
    
    // Save user
    saveUser(username, newUser);
    
    // Auto-login after registration
    loginUser(username, password);
    
    return { success: true, message: 'Registration successful!' };
}

// Login user
function loginUser(username, password) {
    const allUsers = getAllUsers();
    const user = allUsers[username];
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    // Set current user (without password)
    currentUser = {
        username: user.username,
        email: user.email,
        role: user.role,
        isLoggedIn: true,
        profilePic: user.profilePic || 'images/account.png',
        memberSince: user.memberSince
    };
    
    localStorage.setItem('refillUser', JSON.stringify(currentUser));
    
    return { success: true, message: 'Login successful!' };
}

// Handle login from dropdown
function handleLogin() {
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value.trim();
    const errorElement = document.getElementById('login-error');
    const successElement = document.getElementById('login-success');
    
    // Reset messages
    if (errorElement) errorElement.classList.remove('active');
    if (successElement) successElement.classList.remove('active');
    
    // Validate
    if (!username || !password) {
        showErrorMessage(errorElement, 'Please enter username and password');
        return;
    }
    
    const result = loginUser(username, password);
    
    if (result.success) {
        showSuccessMessage(successElement, result.message);
        
        // Update UI and reload dropdown
        setTimeout(() => {
            updateUIForUserRole();
            initializeAccountDropdown(); // Recreate dropdown
        }, 1000);
    } else {
        showErrorMessage(errorElement, result.message);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        localStorage.setItem('refillUser', JSON.stringify(currentUser));
        updateUIForUserRole();
        initializeAccountDropdown(); // Recreate dropdown
    }
}

// Helper functions for messages
function showErrorMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
        }, 3000);
    }
}

function showSuccessMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
        }, 2000);
    }
}