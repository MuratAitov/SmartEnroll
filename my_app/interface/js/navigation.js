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
            
            // Get the view to show from data-view attribute
            const viewToShow = this.getAttribute('data-view');
            
            // Hide all view containers first
            document.querySelectorAll('.view-container').forEach(container => {
                container.style.display = 'none';
            });
            
            // Show the selected view container
            let viewContainer;
            
            // Handle different view transitions
            if (viewToShow === 'map') {
                console.log('Switching to Map view');
                viewContainer = document.getElementById('map-view');
            } else if (viewToShow === 'finals') {
                console.log('Switching to Finals view');
                viewContainer = document.getElementById('finals-view');
            } else if (viewToShow === 'rmp') {
                console.log('Switching to Rate My Professor view');
                viewContainer = document.getElementById('rmp-view');
            } else if (viewToShow === 'reflection') {
                console.log('Switching to Reflection view');
                viewContainer = document.getElementById('reflection-view');
            } else {
                // Default to registration view
                console.log('Switching to Registration view');
                viewContainer = document.getElementById('registration-view');
            }
            
            // Display the selected view
            if (viewContainer) {
                viewContainer.style.display = 'flex';
            }
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