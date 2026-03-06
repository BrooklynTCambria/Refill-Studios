// ============================================
// UPDATES PAGE - MAIN SCRIPT
// ============================================

// Global variables
let currentPostId = null;

// ============================================
// POSTS MANAGEMENT
// ============================================

<<<<<<< HEAD
=======
// Replace these functions in updates.js

>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
// Load posts from database
async function loadPosts() {
    try {
        const response = await fetch('api/posts.php');
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        return [];
    }
}

// Render posts from database
async function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    postsList.innerHTML = '';
    
    const allPosts = await loadPosts();
    
    if (allPosts.length === 0) {
        postsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #aaa;">
                <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                <h3 style="color: #d0d0d0; margin-bottom: 10px;">No posts yet</h3>
                <p>Be the first to create a post!</p>
            </div>
        `;
        return;
    }
    
    allPosts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = `post ${index === 0 ? 'active' : ''}`;
        postElement.setAttribute('data-post-id', post.id);
        
        let imageHtml = '';
        if (post.image_url) {
            imageHtml = `
                <div class="post-image-container" style="display: block;">
                    <img src="${post.image_url}" alt="Post Image" class="post-image" onclick="openImageModal('${post.image_url}')">
                    <div class="image-label">📎 Attached Image</div>
                </div>
            `;
        }
        
        const postDate = new Date(post.created_at).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        postElement.innerHTML = `
            <h3 class="post-header">${escapeHtml(post.header)}</h3>
            <p class="post-description">${escapeHtml(post.description)}</p>
            ${imageHtml}
            <div class="post-meta">
<<<<<<< HEAD
                ${escapeHtml(post.author_name)} | ${escapeHtml(post.author_role)} | <span class="bold-date">${postDate}</span>
=======
                ${post.author_name} | ${post.author_role} | <span class="bold-date">${postDate}</span>
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
            </div>
        `;
        
        postsList.appendChild(postElement);
        
        if (index === 0) {
            currentPostId = post.id;
        }
    });
    
    // Add click events
<<<<<<< HEAD
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('click', function() {
            posts.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            currentPostId = parseInt(this.getAttribute('data-post-id'));
            loadCommentsFromDB(currentPostId);
        });
    });
    
    if (allPosts.length > 0) {
        loadCommentsFromDB(currentPostId);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Load comments from database
async function loadCommentsFromDB(postId) {
=======
    setTimeout(() => {
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            post.addEventListener('click', function() {
                posts.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                currentPostId = parseInt(this.getAttribute('data-post-id'));
                loadCommentsFromDB(currentPostId);
            });
        });
        
        if (allPosts.length > 0) {
            loadCommentsFromDB(currentPostId);
        }
    }, 100);
}

// Load comments from database
async function loadCommentsFromDB(postId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading comments...</div>';
    
    try {
        const response = await fetch(`api/comments.php?post_id=${postId}`);
        const comments = await response.json();
        
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="empty-comments">No comments yet. Be the first to comment!</div>';
        } else {
            comments.forEach(comment => {
                const commentDate = new Date(comment.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span>${comment.username} | ${commentDate} today</span>
                        ${comment.is_dev ? '<span class="dev-badge">DEV</span>' : ''}
                    </div>
                    <p class="comment-text">${comment.text}</p>
                `;
                commentsList.appendChild(commentElement);
            });
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="empty-comments">Error loading comments</div>';
    }
}

// Add comment to database
async function addCommentToDB(text) {
    if (!text.trim()) return;
    
    if (!window.currentUser.isLoggedIn) {
        alert('Please login to comment.');
        return;
    }
    
    try {
        const response = await fetch('api/comments.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: currentPostId,
                text: text.trim()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadCommentsFromDB(currentPostId);
            
            const commentInput = document.getElementById('comment-input');
            const commentForm = document.getElementById('comment-form');
            if (commentInput) commentInput.value = '';
            if (commentForm) commentForm.classList.remove('active');
        } else {
            alert(result.message || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
    }
}

// Update the submit comment button event
document.getElementById('submit-comment')?.addEventListener('click', function() {
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
        addCommentToDB(commentInput.value);
    }
});

async function loadComments(postId) {
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading comments...</div>';
    
    try {
        const response = await fetch(`api/comments.php?post_id=${postId}`);
        const comments = await response.json();
        
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="empty-comments">No comments yet. Be the first to comment!</div>';
        } else {
            comments.forEach(comment => {
                const commentDate = new Date(comment.created_at).toLocaleString();
                
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span>${escapeHtml(comment.username)} | ${commentDate}</span>
                        ${comment.is_dev ? '<span class="dev-badge">DEV</span>' : ''}
                    </div>
                    <p class="comment-text">${escapeHtml(comment.text)}</p>
                `;
                commentsList.appendChild(commentElement);
            });
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="empty-comments">Error loading comments</div>';
    }
}

// Add comment to database
async function addCommentToDB(text) {
    if (!text.trim()) return;
    
    if (!window.currentUser || !window.currentUser.isLoggedIn) {
        alert('Please login to comment.');
        return;
    }
    
    try {
        const response = await fetch('api/comments.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: currentPostId,
                text: text.trim()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadCommentsFromDB(currentPostId);
            
            const commentInput = document.getElementById('comment-input');
            const commentForm = document.getElementById('comment-form');
            if (commentInput) commentInput.value = '';
            if (commentForm) commentForm.classList.remove('active');
        } else {
            alert(result.message || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
    }
}

<<<<<<< HEAD
=======
// In the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Updates page loaded - Initializing...');
    
    setTimeout(async () => {
        await renderPosts(); // This now loads from database
        setupEventListeners();
        checkForNewPostNotification();
        updateUIForUserRole();
    }, 100);
});

function getAllPosts() {
    return JSON.parse(localStorage.getItem('refillPosts') || '[]');
}

function saveAllPosts(posts) {
    localStorage.setItem('refillPosts', JSON.stringify(posts));
    console.log('💾 Saved all posts to localStorage:', posts.length, 'posts');
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

>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
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
// UI UPDATE FUNCTIONS
// ============================================
function updateUIForUserRole() {
    const userRoleIndicator = document.getElementById('user-role-indicator');
    const userRoleNote = document.getElementById('user-role-note');
    const adminAddBtn = document.getElementById('admin-add-post');
    
    // Update role indicator
    if (userRoleIndicator) {
        if (window.currentUser && window.currentUser.isLoggedIn) {
            let roleText = `Welcome, ${window.currentUser.username}!`;
            let roleClass = 'user-role-indicator';
            
            if (window.currentUser.role === 'admin') {
                roleText += ' (ADMIN)';
                roleClass += ' admin-badge';
            } else if (window.currentUser.role === 'developer') {
                roleText += ' (DEVELOPER)';
            }
            
            userRoleIndicator.textContent = roleText;
            userRoleIndicator.className = roleClass;
        } else {
            userRoleIndicator.textContent = 'Welcome, Guest!';
            userRoleIndicator.className = 'user-role-indicator';
        }
    }
    
    // Update note
    if (userRoleNote) {
        if (window.currentUser && window.currentUser.isLoggedIn && 
            (window.currentUser.role === 'admin' || window.currentUser.role === 'developer')) {
            userRoleNote.innerHTML = `Click on a post to view and add comments. <span style="color:#ffcc00;">You can create new posts.</span>`;
        } else {
            userRoleNote.textContent = 'Click on a post to view and add comments.';
        }
    }
    
    // Show/hide admin add post button
    if (adminAddBtn) {
        if (window.currentUser && window.currentUser.isLoggedIn && 
            (window.currentUser.role === 'admin' || window.currentUser.role === 'developer')) {
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
            if (window.currentUser && window.currentUser.isLoggedIn && 
                (window.currentUser.role === 'admin' || window.currentUser.role === 'developer')) {
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
            if (!window.currentUser || !window.currentUser.isLoggedIn) {
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
            if (!window.currentUser || !window.currentUser.isLoggedIn) {
                alert('Please login to comment.');
                return;
            }
            
            if (commentInput) {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    addCommentToDB(commentText);
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
                    addCommentToDB(commentText);
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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageModal.classList.contains('active')) {
                closeImageModal();
            }
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Updates page loaded - Initializing...');
    
    // Wait for user system to initialize
    setTimeout(async () => {
        await renderPosts();
        setupEventListeners();
        updateUIForUserRole();
    }, 300);
});

// Make functions global
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

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