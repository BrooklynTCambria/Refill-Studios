// header-system.js - Universal Header System for All Pages

function createUniversalHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const rightSection = header.querySelector('.right');
    if (!rightSection) return;
    
    // Make sure we have user data
    if (!window.currentUser) {
        window.currentUser = {
            username: 'Guest',
            role: 'user',
            isLoggedIn: false,
            profilePic: 'images/account.png'
        };
        
        // Try to load from localStorage
        const savedUser = JSON.parse(localStorage.getItem('refillUser'));
        if (savedUser) {
            Object.assign(window.currentUser, savedUser);
            window.currentUser.isLoggedIn = true;
        }
    }
    
    // Get current notification setting
    const notifyNewPosts = localStorage.getItem('notifyNewPosts') !== 'false';
    
    // Create dropdown HTML
    const dropdownHTML = `
        <div class="account-dropdown">
            <div class="account-trigger" id="account-trigger">
                <img src="${window.currentUser.profilePic || 'images/account.png'}" alt="Account" class="profile-pic-small" id="profile-pic-header">
                <p class="account-link" id="account-link-text">${window.currentUser.username}</p>
            </div>
            <div class="dropdown-content" id="dropdown-content">
                <!-- Account Info Display (only when logged in) -->
                ${window.currentUser.isLoggedIn ? `
                <div class="account-info-display">
                    <div class="account-info-item">
                        <span class="info-label">User:</span>
                        <span class="info-value">${window.currentUser.username}</span>
                    </div>
                    <div class="account-info-item">
                        <span class="info-label">Role:</span>
                        <span class="info-value">${window.currentUser.role}</span>
                    </div>
                    <div class="account-info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">Logged In</span>
                    </div>
                </div>
                ` : ''}
                
                ${window.currentUser.isLoggedIn ? `
                <!-- Notification Toggle (only when logged in) -->
                <div class="notification-toggle">
                    <div class="notification-text">
                        <span class="dropdown-icon">🔔</span>
                        <span>New Post Alerts</span>
                        <span class="notification-badge" id="notification-badge" style="display: none;">!</span>
                    </div>
                    <label class="toggle-switch-small">
                        <input type="checkbox" id="notify-toggle" ${notifyNewPosts ? 'checked' : ''}>
                        <span class="toggle-slider-small"></span>
                    </label>
                </div>
                ` : ''}
                
                <!-- Account Settings (only when logged in) -->
                ${window.currentUser.isLoggedIn ? `
                <div class="dropdown-item" id="settings-item">
                    <span class="dropdown-icon">⚙️</span>
                    <span>Account Settings</span>
                </div>
                ` : ''}
                
                <div class="dropdown-divider"></div>
                
                <!-- Login/Logout Button -->
                ${window.currentUser.isLoggedIn ? `
                <div class="dropdown-item" id="logout-item">
                    <span class="dropdown-icon">🚪</span>
                    <span>Logout</span>
                </div>
                ` : `
                <div class="dropdown-item" id="login-item">
                    <span class="dropdown-icon">🔑</span>
                    <span>Login / Register</span>
                </div>
                `}
            </div>
        </div>
    `;
    
    rightSection.innerHTML = dropdownHTML;
    setupDropdownEvents();
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
    
    // Click handling for dropdown items
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
                if (window.currentUser && window.currentUser.isLoggedIn) {
                    console.log('Navigating to account-settings.html');
                    window.location.href = 'account-settings.html';
                }
                break;
                
            case 'logout-item':
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to logout?')) {
                    // Clear user data
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('refillUser');
                    localStorage.removeItem('profilePic');
                    
                    // Update current user object
                    window.currentUser = {
                        username: 'Guest',
                        role: 'user',
                        isLoggedIn: false,
                        profilePic: 'images/account.png'
                    };
                    
                    alert('Logged out successfully.');
                    
                    // Redirect or reload based on current page
                    const currentPage = window.location.pathname;
                    if (currentPage.includes('updates.html')) {
                        window.location.reload();
                    } else {
                        window.location.href = 'updates.html';
                    }
                }
                break;
        }
        
        // Close dropdown after clicking
        dropdownContent.classList.remove('active');
    });
    
    // Notification toggle
    const notifyToggle = document.getElementById('notify-toggle');
    if (notifyToggle) {
        notifyToggle.addEventListener('change', function(e) {
            e.stopPropagation();
            localStorage.setItem('notifyNewPosts', this.checked.toString());
            
            if (this.checked) {
                console.log('Notifications enabled');
            } else {
                console.log('Notifications disabled');
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

// Navigation handlers
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure user-system.js has loaded
    setTimeout(() => {
        createUniversalHeader();
    }, 50);
    
    // Navigation button handlers
    const indexBtn = document.getElementById('index-button');
    const gamesBtn = document.getElementById('games-button');
    const updatesBtn = document.getElementById('updates-button');
    
    if (indexBtn) {
        indexBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    if (gamesBtn) {
        gamesBtn.addEventListener('click', function() {
            window.location.href = 'games.html';
        });
    }
    
    if (updatesBtn) {
        updatesBtn.addEventListener('click', function() {
            window.location.href = 'updates.html';
        });
    }
});