/**
 * Handles user authentication with the backend
 */

// Store user data in sessionStorage after login
function storeUserSession(userData) {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('isLoggedIn', 'true');
}

// Clear user data on logout
function clearUserSession() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
}

// Check if user is logged in
function isUserLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Get current user data
function getCurrentUser() {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Handle user login
async function loginUser(username, password) {
    try {
        const response = await fetch('http://localhost:5001/user_bp/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_name: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Login successful:', data);
            storeUserSession(data.data);
            return { success: true, data: data.data };
        } else {
            console.error('Login failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Handle user registration
async function registerUser(username, email, password, name) {
    try {
        const response = await fetch('http://localhost:5001/user_bp/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_name: username,
                email: email,
                password: password,
                name: name
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Registration successful:', data);
            return { success: true, data: data.data };
        } else {
            console.error('Registration failed:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Handle user logout
function logoutUser() {
    clearUserSession();
    window.location.href = 'login.html'; // Redirect to login page
}

// Initialize the auth system
function initAuth() {
    console.log('Initializing auth system...');
    
    // Update UI based on login state
    updateUserInterface();
    
    // Add event listener for logout button
    const logoutLinks = document.querySelectorAll('a[href="#signout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    });
}

// Update the UI based on login state
function updateUserInterface() {
    const user = getCurrentUser();
    
    // Check if we're on the login page
    const isLoginPage = window.location.href.includes('login.html');
    
    if (user) {
        // User is logged in, update UI elements
        const studentNameElements = document.querySelectorAll('.student-name');
        const studentIdElements = document.querySelectorAll('.student-id');
        
        studentNameElements.forEach(el => {
            el.textContent = user.name || 'Student';
        });
        
        studentIdElements.forEach(el => {
            el.textContent = `ID: ${user.user_id || ''}`;
        });
        
        console.log('UI updated with user data');
        
        // If on login page but logged in, redirect to index
        if (isLoginPage) {
            window.location.href = 'index.html';
        }
    } else {
        // If on a protected page but not logged in, redirect to login
        if (!isLoginPage) {
            console.log('Not logged in, redirecting to login page');
            window.location.href = 'login.html';
        }
    }
}

// Common notification system to be used across the application
function showNotification(message, type = 'info', duration = 3000) {
    // First try to use any existing notification system
    if (typeof window.showToast === 'function') {
        return window.showToast(message, duration);
    }
    
    // Otherwise create our own toast notification
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Add type-specific styling
    if (type === 'error') {
        toast.style.backgroundColor = 'rgba(220, 53, 69, 0.9)'; // Bootstrap danger
    } else if (type === 'success') {
        toast.style.backgroundColor = 'rgba(40, 167, 69, 0.9)'; // Bootstrap success
    }
    
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, duration);
}

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', initAuth); 