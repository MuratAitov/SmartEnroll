/**
 * Manages theme settings (light/dark mode) for the application.
 */

// Store the reference to the event listener for cleanup
let themeToggleListener = null;

/**
 * Initializes theme functionality on page load
 */
function initTheme() {
    console.log('Initializing theme system...');
    
    // Set initial theme based on user preference or default
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
        document.body.classList.add('dark-mode');
        updateThemeToggleText(true);
        updateLogoImage(true);
    } else {
        updateThemeToggleText(false);
        updateLogoImage(false);
    }
    
    // Set up theme toggle listeners
    setupThemeToggleListeners();
}

/**
 * Sets up event listeners for theme toggle buttons
 */
function setupThemeToggleListeners() {
    // Remove any existing listeners to prevent duplicates
    if (themeToggleListener) {
        document.removeEventListener('click', themeToggleListener);
    }
    
    // Add click event listener for theme toggle buttons
    themeToggleListener = function(e) {
        if (e.target.classList.contains('theme-toggle')) {
            toggleTheme();
        }
    };
    
    document.addEventListener('click', themeToggleListener);
}

/**
 * Toggles between light and dark mode themes.
 */
function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    
    // Store the theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update UI elements
    updateThemeToggleText(isDarkMode);
    updateLogoImage(isDarkMode);
}

/**
 * Updates the text content of theme toggle buttons.
 * @param {boolean} isDarkMode - Indicates if dark mode is active.
 */
function updateThemeToggleText(isDarkMode) {
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
}

/**
 * Updates the logo image based on the current theme.
 * @param {boolean} isDarkMode - Indicates if dark mode is active.
 */
function updateLogoImage(isDarkMode) {
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        // Use relative paths for better path handling
        logoImg.src = isDarkMode 
            ? './assets/GU Logo/IMG_4570.jpg'  // Dark mode logo
            : './assets/GU Logo/IMG_4571.jpg'; // Light mode logo
    }
}

// Initialize the theme system when the document is ready
document.addEventListener('DOMContentLoaded', initTheme);
