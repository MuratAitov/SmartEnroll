/**
 * Toggles between light and dark mode themes.
 */
function toggleTheme() {
    const body = document.body;
    const logoImg = document.querySelector('.logo img');
    const themeToggles = document.querySelectorAll('.theme-toggle');

    // Toggle dark mode class on body
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');

    // Update theme toggle buttons text
    updateThemeToggleText(isDarkMode);

    // Update the logo based on the theme
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
        logoImg.src = isDarkMode 
            ? 'my_app/interface/assets/GU Logo/IMG_4570.jpg'  // Dark mode logo
            : 'my_app/interface/assets/GU Logo/IMG_4571.jpg'; // Light mode logo
    }
}
