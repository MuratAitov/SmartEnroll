/**
 * Authentication service for handling user login, registration, and session management.
 */

// Store user data in session storage
let currentUser = null;

// Check if we have a user session on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to get user from session storage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUIForLoggedInUser(currentUser);
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            sessionStorage.removeItem('currentUser');
        }
    } else {
        updateUIForLoggedOutUser();
    }
});

/**
 * Attempts to log in a user with the provided credentials.
 * @param {string} userName - The username
 * @param {string} password - The password
 * @returns {Promise} A promise that resolves with the user data or rejects with an error
 */
function login(userName, password) {
    // Show a loading indicator
    const loadingIndicator = showLoadingIndicator();

    return fetch('http://localhost:5001/user_bp/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_name: userName,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid username or password');
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store user data
        currentUser = data.data;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateUIForLoggedInUser(currentUser);
        
        // Hide login modal if it exists
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        // Show success notification
        showNotification(`Welcome, ${currentUser.name}!`, 'success');
        
        return currentUser;
    })
    .catch(error => {
        showNotification(`Login failed: ${error.message}`, 'error');
        throw error;
    })
    .finally(() => {
        // Remove loading indicator
        hideLoadingIndicator(loadingIndicator);
    });
}

/**
 * Registers a new user with the provided information.
 * @param {string} userName - The username
 * @param {string} email - The email address
 * @param {string} password - The password
 * @param {string} name - The display name
 * @returns {Promise} A promise that resolves with the registration result
 */
function register(userName, email, password, name) {
    // Show a loading indicator
    const loadingIndicator = showLoadingIndicator();

    return fetch('http://localhost:5001/user_bp/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_name: userName,
            email: email,
            password: password,
            name: name
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        showNotification('Registration successful! You can now log in.', 'success');
        
        // Hide register modal if it exists
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.style.display = 'none';
        }
        
        // Show login modal if it exists
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
        
        return data;
    })
    .catch(error => {
        showNotification(`Registration failed: ${error.message}`, 'error');
        throw error;
    })
    .finally(() => {
        // Remove loading indicator
        hideLoadingIndicator(loadingIndicator);
    });
}

/**
 * Logs out the current user by clearing their session.
 */
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
    showNotification('You have been logged out', 'info');
}

/**
 * Updates the UI for a logged-in user.
 * @param {Object} user - The user data
 */
function updateUIForLoggedInUser(user) {
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        // Update user info in dropdown
        const studentName = userInfo.querySelector('.student-name');
        const studentId = userInfo.querySelector('.student-id');
        
        if (studentName) {
            studentName.textContent = user.name || 'User';
        }
        
        if (studentId) {
            studentId.textContent = `ID: ${user.user_id || ''}`;
        }
    }
    
    // Update any login/register buttons
    const loginButton = document.querySelector('.login-btn');
    const registerButton = document.querySelector('.register-btn');
    const logoutButton = document.querySelector('.logout-btn');
    
    if (loginButton) loginButton.style.display = 'none';
    if (registerButton) registerButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'block';
    
    // Add user-specific information to exports
    window.loggedInUser = user;
}

/**
 * Updates the UI for a logged-out user.
 */
function updateUIForLoggedOutUser() {
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        // Update user info in dropdown
        const studentName = userInfo.querySelector('.student-name');
        const studentId = userInfo.querySelector('.student-id');
        
        if (studentName) {
            studentName.textContent = 'Guest User';
        }
        
        if (studentId) {
            studentId.textContent = 'Please log in';
        }
    }
    
    // Update any login/register buttons
    const loginButton = document.querySelector('.login-btn');
    const registerButton = document.querySelector('.register-btn');
    const logoutButton = document.querySelector('.logout-btn');
    
    if (loginButton) loginButton.style.display = 'block';
    if (registerButton) registerButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
    
    // Remove user-specific information
    window.loggedInUser = null;
}

/**
 * Gets the current logged-in user, if any.
 * @returns {Object|null} The current user or null if not logged in
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user is logged in, false otherwise
 */
function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Shows a loading indicator while the operation is in progress.
 * @returns {HTMLElement} The loading indicator element
 */
function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay"></div>
        <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-text">Processing...</div>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('style[data-for="loading-indicator"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-for', 'loading-indicator');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9998;
            }
            .loading-content {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #142A50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            .loading-text {
                font-size: 16px;
                color: #333;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
}

/**
 * Hides the loading indicator when operation is complete.
 * @param {HTMLElement} loadingIndicator - The loading indicator to hide
 */
function hideLoadingIndicator(loadingIndicator) {
    if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}

/**
 * Shows a notification message.
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', or 'info')
 */
function showNotification(message, type) {
    // Check if this function is available globally from exportService.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback implementation if the global function doesn't exist
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#d4edda';
        notification.style.color = '#155724';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f8d7da';
        notification.style.color = '#721c24';
    } else {
        notification.style.backgroundColor = '#d1ecf1';
        notification.style.color = '#0c5460';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
} 