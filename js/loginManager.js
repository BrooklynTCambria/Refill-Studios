// js/loginManager.js
async function handleLogin() {
    console.log('handleLogin called');
    
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    
    console.log('Inputs found:', {
        username: !!usernameInput,
        password: !!passwordInput
    });
    
    if (!usernameInput || !passwordInput) {
        console.error('Login inputs not found');
        alert('Form inputs not found. Please refresh the page.');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Login attempt for:', username);
    
    // Validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (window.loginUser) {
        console.log('Calling loginUser...');
        try {
            const result = await window.loginUser(username, password);
            console.log('Login result:', result);
            
            if (result.success) {
                alert('Login successful! Welcome back ' + result.user.username + '!');
                window.location.href = 'updates.html';
            } else {
                alert(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    } else {
        console.error('window.loginUser is not available');
        alert('Login system not available. Please check console for errors.');
    }
}

// Wait for DOM to load and attach the event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for login button...');
    
    // Find the login button
    const loginBtn = document.getElementById('log-in-button');
    
    if (loginBtn) {
        console.log('Login button found:', loginBtn);
        loginBtn.addEventListener('click', handleLogin);
    } else {
        console.error('Login button not found! Looking for #log-in-button');
    }
    
    // Handle the "Sign Up" link
    const signUpBtn = document.getElementById('sign-up-button');
    if (signUpBtn) {
        signUpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }
});// js/loginManager.js
async function handleLogin() {
    console.log('handleLogin called');
    
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    
    console.log('Inputs found:', {
        username: !!usernameInput,
        password: !!passwordInput
    });
    
    if (!usernameInput || !passwordInput) {
        console.error('Login inputs not found');
        alert('Form inputs not found. Please refresh the page.');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Login attempt for:', username);
    
    // Validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (window.loginUser) {
        console.log('Calling loginUser...');
        try {
            const result = await window.loginUser(username, password);
            console.log('Login result:', result);
            
            if (result.success) {
                alert('Login successful! Welcome back ' + result.user.username + '!');
                window.location.href = 'updates.html';
            } else {
                alert(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    } else {
        console.error('window.loginUser is not available');
        alert('Login system not available. Please check console for errors.');
    }
}

// Wait for DOM to load and attach the event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for login button...');
    
    // Find the login button
    const loginBtn = document.getElementById('log-in-button');
    
    if (loginBtn) {
        console.log('Login button found:', loginBtn);
        loginBtn.addEventListener('click', handleLogin);
    } else {
        console.error('Login button not found! Looking for #log-in-button');
    }
    
    // Handle the "Sign Up" link
    const signUpBtn = document.getElementById('sign-up-button');
    if (signUpBtn) {
        signUpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }
});