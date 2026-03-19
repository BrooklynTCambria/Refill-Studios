// updated-updates.js - Backend-connected Updates Page

let currentPostId = null;

// ============================================
// POSTS MANAGEMENT
// ============================================

async function loadPostsFromStorage() {
    try {
        const response = await fetch('api/posts.php');
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Failed to load posts:', error);
        return [];
    }
}

async function getAllPosts() {
    return await loadPostsFromStorage();
}

async function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    postsList.innerHTML = '';
    
    const allPosts = await getAllPosts();
    
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
            imageHtml = `
                <div class="post-image-container" style="display: block;">
                    <img src="${post.image.dataUrl}" alt="Post Image" class="post-image" onclick="openImageModal('${post.image.dataUrl}')">
                    <div class="image-label">📎 Attached Image</div>
                </div>
            `;
        }
        
        postElement.innerHTML = `
            <h3 class="post-header">${post.header}</h3>
            <p class="post-description">${post.description}</p>
            ${imageHtml}
            <div class="post-meta">
                ${post.author} | ${post.author_role} | <span class="bold-date">${new Date(post.created_at).toLocaleDateString()}</span>
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

async function loadComments(postId) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    const allPosts = await getAllPosts();
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
                <span>${comment.username} | ${new Date(comment.created_at).toLocaleTimeString()}</span>
                ${comment.is_dev ? '<span class="dev-badge">DEV</span>' : ''}
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

async function addComment(text) {
    if (!text.trim()) return;
    
    if (!window.currentUser.isLoggedIn) {
        alert('Please login to comment.');
        return;
    }
    
    try {
        const response = await fetch('api/comments.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: currentPostId,
                text: text.trim()
            })
        });
        
        if (response.ok) {
            // Reload comments
            await loadComments(currentPostId);
            
            // Clear input and hide form
            const commentInput = document.getElementById('comment-input');
            const commentForm = document.getElementById('comment-form');
            
            if (commentInput) commentInput.value = '';
            if (commentForm) commentForm.classList.remove('active');
        }
    } catch (error) {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment. Please try again.');
    }
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
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
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
        indexButton.addEventListener('click', () => window.location.href = 'index.html');
    }
    
    if (gamesButton) {
        gamesButton.addEventListener('click', () => window.location.href = 'games.html');
    }
    
    if (updatesButton) {
        updatesButton.addEventListener('click', () => window.location.href = 'updates.html');
    }
    
    // Admin add post button
    const adminAddBtn = document.getElementById('admin-add-post');
    if (adminAddBtn) {
        adminAddBtn.addEventListener('click', () => {
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
    
    // Close modal when clicking outside
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
        checkForNewPostNotification();
        updateUIForUserRole();
    }, 100);
});

// Make functions available globally
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;