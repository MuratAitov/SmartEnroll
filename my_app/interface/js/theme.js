function toggleTheme() {
    const body = document.body;
    const logoImg = document.querySelector('.logo img');
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    
    // Update theme toggle buttons text
    themeToggles.forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
    
    // Update logo based on theme with new path
    if (isDarkMode) {
        logoImg.src = 'my_app/interface/assets/GU Logo/IMG_4570.jpg'; // Updated dark mode logo path
    } else {
        logoImg.src = 'my_app/interface/assets/GU Logo/IMG_4571.jpg'; // Light mode logo should also be in GU Logo folder
    }
}