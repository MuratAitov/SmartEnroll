// File: auth/session.js
function storeUserSession(userData) {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('isLoggedIn', 'true');
}

function clearUserSession() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
}

function isUserLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// File: auth/api.js
async function loginUser(username, password) {
    try {
        console.log('Attempting to login user at backend endpoint');
        const response = await fetch('http://localhost:5001/user_bp/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: username, password }),
            credentials: 'include' // Include cookies in the request
        });
        
        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (response.ok) {
            storeUserSession(data.data);
            return { success: true, data: data.data };
        } else {
            console.error('Login failed with status:', response.status, data.error);
            return { success: false, error: data.error || 'Login failed. Check your credentials.' };
        }
    } catch (error) {
        console.error('Network error during login:', error);
        return { success: false, error: 'Network error. Please check your connection to the backend server.' };
    }
}

async function registerUser(username, email, password, name) {
    try {
        console.log('Attempting to register user at backend endpoint');
        const response = await fetch('http://localhost:5001/user_bp/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: username, email, password, name }),
            credentials: 'include' // Include cookies in the request
        });
        
        console.log('Registration response status:', response.status);
        const data = await response.json();
        console.log('Registration response data:', data);
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            console.error('Registration failed with status:', response.status, data.error);
            return { success: false, error: data.error || 'Registration failed. Try a different username.' };
        }
    } catch (error) {
        console.error('Network error during registration:', error);
        return { success: false, error: 'Network error. Please check your connection to the backend server.' };
    }
}

// File: auth/ui.js
function logoutUser() {
    clearUserSession();
    window.location.href = 'login.html';
}

function checkBackendConnection() {
    console.log('Checking backend connection...');
    return fetch('http://localhost:5001/user_bp/login', { 
        method: 'OPTIONS',
        cache: 'no-cache'
    })
    .then(response => {
        console.log('Backend connection successful');
        return true;
    })
    .catch(error => {
        console.error('Backend connection failed:', error);
        return false;
    });
}

function initAuth() {
    updateUserInterface();
    document.querySelectorAll('a[href="#signout"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            logoutUser();
        });
    });
    
    // Check if we're on the login page
    if (window.location.href.includes('login.html')) {
        checkBackendConnection().then(isConnected => {
            if (!isConnected) {
                const statusElement = document.getElementById('status-message');
                if (statusElement) {
                    statusElement.innerHTML = `
                        <strong>Backend server not detected.</strong><br>
                        <p style="font-size: 0.8em; margin-top: 5px;">
                            The application will work in demo mode. To connect to the backend server:
                            <br>1. Make sure it's running on port 5001
                            <br>2. Check your network connection
                        </p>
                    `;
                    statusElement.className = 'status-message info';
                    statusElement.style.display = 'block';
                }
            }
        });
    }
}

function updateUserInterface() {
    const user = getCurrentUser();
    const isLoginPage = window.location.href.includes('login.html');

    if (user) {
        document.querySelectorAll('.student-name').forEach(el => {
            el.textContent = user.name || 'Student';
        });
        document.querySelectorAll('.student-id').forEach(el => {
            el.textContent = `ID: ${user.user_id || ''}`;
        });
        if (isLoginPage) window.location.href = 'index.html';
    } else if (!isLoginPage) {
        window.location.href = 'login.html';
    }
}

function openAuthTab(tabId, button) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    button.classList.add('active');
}

function showStatusMessage(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + type;
    statusElement.style.display = 'block';
    
    // Make network errors more noticeable with longer display time
    const displayTime = message.includes('Network error') || 
                       message.includes('Cannot connect') ? 
                       10000 : 5000;
    
    // For connection errors, add a retry button
    if (message.includes('Network error') || message.includes('Cannot connect')) {
        // Add some guidance text
        const helpText = document.createElement('p');
        helpText.textContent = 'Make sure the backend server is running on port 5001.';
        helpText.style.fontSize = '0.8em';
        helpText.style.marginTop = '5px';
        
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry Connection';
        retryButton.style.marginTop = '10px';
        retryButton.style.padding = '5px 10px';
        retryButton.style.cursor = 'pointer';
        
        retryButton.addEventListener('click', () => {
            statusElement.textContent = 'Retrying connection...';
            statusElement.className = 'status-message info';
            
            // Test connection to backend
            fetch('http://localhost:5001/user_bp/login', { 
                method: 'OPTIONS',
                cache: 'no-cache'
            })
            .then(response => {
                showStatusMessage('Connection successful! Please try again.', 'success');
            })
            .catch(error => {
                showStatusMessage('Still unable to connect to the server. Check if the backend is running.', 'error');
            });
        });
        
        // Clear existing content and add new elements
        statusElement.appendChild(document.createElement('br'));
        statusElement.appendChild(helpText);
        statusElement.appendChild(retryButton);
    }
    
    setTimeout(() => {
        // Only hide if it's still the same message
        if (statusElement.textContent.includes(message)) {
            statusElement.style.display = 'none';
        }
    }, displayTime);
    
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    }
}

// File: auth/form-handlers.js
document.addEventListener('DOMContentLoaded', () => {
    initAuth();

    document.getElementById('login-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = 'Connecting to server...';
        statusElement.className = 'status-message info';
        statusElement.style.display = 'block';
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const result = await loginUser(username, password);
            if (result.success) {
                showStatusMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                // Check if we're getting a network error
                if (result.error.includes('Network error')) {
                    showStatusMessage('Cannot connect to server. Using demo mode...', 'error');
                    // Use mock login for demo purposes when server is unavailable
                    setTimeout(() => {
                        const mockUser = { user_id: 'demo123', name: 'Demo User' };
                        storeUserSession(mockUser);
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showStatusMessage(result.error || 'Login failed. Please try again.', 'error');
                }
            }
        } catch (err) {
            console.error('Error during login process:', err);
            showStatusMessage('An unexpected error occurred. Please try again.', 'error');
        }
    });

    document.getElementById('register-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = 'Connecting to server...';
        statusElement.className = 'status-message info';
        statusElement.style.display = 'block';
        
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const result = await registerUser(username, email, password, name);
            if (result.success) {
                showStatusMessage('Registration successful! Please log in.', 'success');
                this.reset();
                openAuthTab('login-tab', document.querySelector('.tab-button'));
            } else {
                // Check if we're getting a network error
                if (result.error.includes('Network error')) {
                    showStatusMessage('Cannot connect to server. Please try again later.', 'error');
                } else {
                    showStatusMessage(result.error || 'Registration failed. Please try again.', 'error');
                }
            }
        } catch (err) {
            console.error('Error during registration process:', err);
            showStatusMessage('An unexpected error occurred. Please try again.', 'error');
        }
    });
});
