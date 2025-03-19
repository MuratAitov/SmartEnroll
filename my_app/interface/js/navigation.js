/**
 * This file handles main navigation between different views of the application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation between main views
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
    
    // Show/hide dropdowns
    document.addEventListener('click', function(e) {
        // Close any open dropdown if clicking outside of it
        if (!e.target.matches('.nav-button') && !e.target.matches('.export-button')) {
            const dropdowns = document.querySelectorAll('.dropdown-content, .export-dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Export button functionality
    const exportButton = document.querySelector('.export-button');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            document.querySelector('.export-dropdown').classList.toggle('show');
        });
    }

    // User dropdown functionality
    const navButton = document.querySelector('.nav-button');
    if (navButton) {
        navButton.addEventListener('click', function() {
            document.querySelector('.dropdown-content').classList.toggle('show');
        });
    }
});