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
        const response = await fetch('http://localhost:5001/user_bp/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: username, password })
        });
        const data = await response.json();
        if (response.ok) {
            storeUserSession(data.data);
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function registerUser(username, email, password, name) {
    try {
        const response = await fetch('http://localhost:5001/user_bp/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: username, email, password, name })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// File: auth/ui.js
function logoutUser() {
    clearUserSession();
    window.location.href = 'login.html';
}

function initAuth() {
    updateUserInterface();
    document.querySelectorAll('a[href="#signout"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            logoutUser();
        });
    });
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
    setTimeout(() => statusElement.style.display = 'none', 5000);
    if (typeof showNotification === 'function') showNotification(message, type);
}

// File: auth/form-handlers.js
document.addEventListener('DOMContentLoaded', () => {
    initAuth();

    document.getElementById('login-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const result = await loginUser(username, password);
        if (result.success) {
            showStatusMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            showStatusMessage(result.error || 'Login failed. Please try again.', 'error');
        }
    });

    document.getElementById('register-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const result = await registerUser(username, email, password, name);
        if (result.success) {
            showStatusMessage('Registration successful! Please log in.', 'success');
            this.reset();
            openAuthTab('login-tab', document.querySelector('.tab-button'));
        } else {
            showStatusMessage(result.error || 'Registration failed. Please try again.', 'error');
        }
    });
});
