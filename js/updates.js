let currentPostId = null;

// POSTS MANAGEMENT

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

// Delete a post
async function deletePost(postId, postHeader) {
    if (!confirm(`Are you sure you want to delete the post "${postHeader}"? This will also delete all comments on this post.`)) {
        return;
    }
    
    try {
        const response = await fetch('api/posts.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: postId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Post deleted successfully!');
            // Reload posts
            await renderPosts();
            // Clear comments section
            const commentsList = document.getElementById('comments-list');
            if (commentsList) {
                commentsList.innerHTML = '<div class="empty-comments">Select a post to view comments</div>';
            }
            currentPostId = null;
        } else {
            alert(result.error || 'Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
    }
}

// Delete a comment
async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    try {
        const response = await fetch('api/comments.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId: commentId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Comment deleted successfully!');
            // Reload comments for current post
            if (currentPostId) {
                await loadComments(currentPostId);
            }
        } else {
            alert(result.error || 'Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment: ' + error.message);
    }
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
        
        // Check if current user can delete this post
        const canDelete = window.currentUser && 
                         (window.currentUser.role === 'admin' || 
                          (window.currentUser.isLoggedIn && window.currentUser.id === post.user_id));
        
        // Image HTML
        let imageHtml = '';
        if (post.image && post.image.dataUrl) {
            imageHtml = `
                <div class="post-image-container" style="display: block;">
                    <img src="${post.image.dataUrl}" alt="Post Image" class="post-image" onclick="openImageModal('${post.image.dataUrl}')">
                    <div class="image-label">📎 Attached Image</div>
                </div>
            `;
        }
        
        postElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <h3 class="post-header" style="flex: 1;">${escapeHtml(post.header)}</h3>
                ${canDelete ? `
                    <button class="delete-post-btn" data-post-id="${post.id}" data-post-header="${escapeHtml(post.header)}" 
                            style="background: none; border: none; color: #ff6666; cursor: pointer; font-size: 18px; padding: 5px 10px;" 
                            title="Delete Post">🗑️</button>
                ` : ''}
            </div>
            <p class="post-description">${escapeHtml(post.description)}</p>
            ${imageHtml}
            <div class="post-meta">
                ${escapeHtml(post.author)} | ${escapeHtml(post.author_role)} | <span class="bold-date">${new Date(post.created_at).toLocaleDateString()}</span>
            </div>
        `;
        
        postsList.appendChild(postElement);
        
        // Set first post as active
        if (index === 0) {
            currentPostId = post.id;
        }
    });
    
    // Add click events to posts and delete buttons
    setTimeout(() => {
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            post.addEventListener('click', function(e) {
                // Don't trigger if clicking on delete button
                if (e.target.classList.contains('delete-post-btn')) return;
                
                posts.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                currentPostId = parseInt(this.getAttribute('data-post-id'));
                loadComments(currentPostId);
            });
        });
        
        // Add delete post button event listeners
        const deleteButtons = document.querySelectorAll('.delete-post-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = parseInt(btn.getAttribute('data-post-id'));
                const postHeader = btn.getAttribute('data-post-header');
                deletePost(postId, postHeader);
            });
        });
        
        // Load comments for first post
        if (allPosts.length > 0) {
            loadComments(currentPostId);
        }
    }, 100);
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// COMMENTS MANAGEMENT

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
            commentElement.setAttribute('data-comment-id', comment.id);
            
            // Check if current user can delete this comment
            const canDelete = window.currentUser && 
                             (window.currentUser.role === 'admin' || 
                              (window.currentUser.isLoggedIn && window.currentUser.id === comment.user_id));
            
            const commentHeader = document.createElement('div');
            commentHeader.className = 'comment-header';
            commentHeader.innerHTML = `
                <span>${escapeHtml(comment.username)} | ${new Date(comment.created_at).toLocaleString()}</span>
                <div>
                    ${comment.is_dev ? '<span class="dev-badge">DEV</span>' : ''}
                    ${canDelete ? `
                        <button class="delete-comment-btn" data-comment-id="${comment.id}" 
                                style="background: none; border: none; color: #ff6666; cursor: pointer; font-size: 14px; margin-left: 10px;" 
                                title="Delete Comment">🗑️</button>
                    ` : ''}
                </div>
            `;
            
            const commentText = document.createElement('p');
            commentText.className = 'comment-text';
            commentText.textContent = comment.text;
            
            commentElement.appendChild(commentHeader);
            commentElement.appendChild(commentText);
            commentsList.appendChild(commentElement);
        });
        
        // Add delete comment button event listeners
        const deleteCommentBtns = document.querySelectorAll('.delete-comment-btn');
        deleteCommentBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = parseInt(btn.getAttribute('data-comment-id'));
                deleteComment(commentId);
            });
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
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment. Please try again.');
    }
}

// IMAGE MODAL FUNCTIONALITY

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

// Also update the user role indicator display
function updateUIForUserRole() {
    const userRoleIndicator = document.getElementById('user-role-indicator');
    const userRoleNote = document.getElementById('user-role-note');
    const adminAddBtn = document.getElementById('admin-add-post');
    
    // Update role indicator
    if (userRoleIndicator) {
        let roleText = '';
        let roleClass = 'user-role-indicator';
        
        if (window.currentUser.role === 'Default') {
            roleText = `Welcome, ${window.currentUser.username}! (Default - Comment Only)`;
            roleClass += ' default-badge';
        } else {
            roleText = `Welcome, ${window.currentUser.username}! (${window.currentUser.role} - Can Create Posts)`;
            roleClass += ' creative-badge';
        }
        
        userRoleIndicator.textContent = roleText;
        userRoleIndicator.className = roleClass;
    }
    
    // Update note
    if (userRoleNote) {
        if (window.currentUser.can_post) {
            userRoleNote.innerHTML = `Click on a post to view and add comments. <span style="color:#a3d9a3;">✓ You can create new posts.</span>`;
        } else {
            userRoleNote.innerHTML = `Click on a post to view and add comments. <span style="color:#ffcc00;">ℹ️ Select a creative role in Account Settings to create posts.</span>`;
        }
    }
    
    // Show/hide admin add post button
    if (adminAddBtn) {
        if (window.currentUser.can_post) {
            adminAddBtn.style.display = 'flex';
        } else {
            adminAddBtn.style.display = 'none';
        }
    }
}

// EVENT LISTENERS SETUP

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
            if (window.currentUser.can_post) {
                window.location.href = 'create-post.html';
            } else {
                alert('You need to select a creative role (Artist, Programmer, Modeler, etc.) to create posts.\n\nGo to Account Settings to select your role.');
                window.location.href = 'account-settings.html';
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

// INITIALIZATION

document.addEventListener('DOMContentLoaded', function() {
    console.log('Updates page loaded - Initializing...');
    
    // Wait for user system to initialize
    setTimeout(async () => {
        await renderPosts();
        setupEventListeners();
        updateUIForUserRole();
    }, 100);
});

// Make functions available globally
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;