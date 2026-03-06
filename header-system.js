// header-system.js - Universal Header System
function createUniversalHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const rightSection = header.querySelector('.right');
    if (!rightSection) return;
    
    // Get notification setting
    const notifyNewPosts = localStorage.getItem('notifyNewPosts') !== 'false';
    
    // Create dropdown HTML
    const dropdownHTML = `
        <div class="account-dropdown">
            <div class="account-trigger" id="account-trigger">
                <img src="${window.currentUser.profilePic || 'images/account.png'}" alt="Account" class="profile-pic-small" id="profile-pic-header">
                <p class="account-link" id="account-link-text">${window.currentUser.username}</p>
            </div>
            <div class="dropdown-content" id="dropdown-content">
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
                
                <div class="dropdown-item" id="settings-item">
                    <span class="dropdown-icon">⚙️</span>
                    <span>Account Settings</span>
                </div>
                
                <div class="dropdown-divider"></div>
                
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
    
    if (!accountTrigger || !dropdownContent) return;
    
    // Toggle dropdown
    accountTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });
    
    // Handle dropdown item clicks
    dropdownContent.addEventListener('click', function(e) {
        const target = e.target.closest('.dropdown-item');
        if (!target) return;
        
        const id = target.id;
        
        switch(id) {
            case 'login-item':
                window.location.href = 'account.html';
                break;
                
            case 'settings-item':
                if (window.currentUser.isLoggedIn) {
                    window.location.href = 'account-settings.html';
                }
                break;
                
            case 'logout-item':
                if (window.logoutUser) {
                    window.logoutUser();
                }
                break;
        }
        
        dropdownContent.classList.remove('active');
    });
    
    // Notification toggle
    const notifyToggle = document.getElementById('notify-toggle');
    if (notifyToggle) {
        notifyToggle.addEventListener('change', function() {
            localStorage.setItem('notifyNewPosts', this.checked.toString());
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

// Initialize header after user system loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for user system to initialize
    setTimeout(() => {
        createUniversalHeader();
    }, 100);
});