async function handleRegister() {
    console.log('handleRegister called'); // Debug log
    
    const emailInput = document.getElementById('email-input');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const confirmInput = document.getElementById('confirm-password-input');
    
    console.log('Inputs found:', {
        email: emailInput,
        username: usernameInput,
        password: passwordInput,
        confirm: confirmInput
    });
    
    if (!emailInput || !usernameInput || !passwordInput || !confirmInput) {
        console.error('Register inputs not found');
        alert('Form inputs not found. Please refresh the page.');
        return;
    }
    
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();
    
    console.log('Form data:', { email, username, password: '***', confirmPassword: '***' });
    
    // Validation
    if (!email || !username || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simple email validation
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }
    
    // Use the global register function
    if (window.registerUser) {
        console.log('Calling registerUser...');
        try {
            const result = await window.registerUser(username, email, password);
            console.log('Registration result:', result);
            
            if (result.success) {
                alert('Registration successful! Welcome to Refill Studios.');
                window.location.href = 'updates.html';
            } else {
                alert(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        }
    } else {
        console.error('window.registerUser is not available');
        alert('Registration system not available. Please check console for errors.');
    }
}

// Wait for DOM to load and attach the event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for register button...');
    
    // Try to find the register button (could be register-button or sign-up-button)
    const registerBtn = document.getElementById('register-button') || document.getElementById('sign-up-button');
    
    if (registerBtn) {
        console.log('Register button found:', registerBtn);
        registerBtn.addEventListener('click', handleRegister);
    } else {
        console.error('Register button not found! Looking for #register-button or #sign-up-button');
    }
    
    // Also handle the "Already have an account? click Here" link
    const accountLink = document.getElementById('account-link-here');
    if (accountLink) {
        accountLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'account.html';
        });
    }
});