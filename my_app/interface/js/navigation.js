/**
 * This file handles main navigation between different views of the application
 */

// Store a flag to ensure the initialization only happens once
let navigationInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent duplicate initialization
    if (navigationInitialized) return;
    navigationInitialized = true;
    
    console.log('Initializing navigation...');
    
    // Auth check will be handled by auth.js, so we don't duplicate it here

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
        if (!e.target.matches('.nav-button') && 
            !e.target.matches('.export-button') && 
            !e.target.matches('.arrow') && 
            !e.target.matches('.semester-button')) {
            const dropdowns = document.querySelectorAll('.dropdown-content, .export-dropdown, .semester-content');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Export button functionality
    const exportButton = document.querySelector('.export-button');
    if (exportButton) {
        exportButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent document click from immediately closing dropdown
            document.querySelector('.export-dropdown').classList.toggle('show');
        });
    }

    // User dropdown functionality
    const navButton = document.querySelector('.nav-button');
    if (navButton) {
        navButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent document click from immediately closing dropdown
            document.querySelector('.dropdown-content').classList.toggle('show');
        });
    }

    // Semester dropdown functionality
    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent document click from immediately closing dropdown
            document.querySelector('.semester-content').classList.toggle('show');
        });
    }

    // We don't need to duplicate the logout handler since it's handled in auth.js
});

// Function to change semester
function changeSemester(semester) {
    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.innerHTML = semester + ' <span class="arrow">▼</span>';
    }
    
    // Close the dropdown
    const semesterContent = document.querySelector('.semester-content');
    if (semesterContent) {
        semesterContent.classList.remove('show');
    }
    
    // You can add additional logic here to update content based on semester
    console.log('Semester changed to:', semester);
    
    // Use the common notification system
    showToast(`Semester changed to ${semester}`);
}

// Function to display toast notifications
// Making this a window property so it can be accessed from auth.js
window.showToast = function(message, duration = 3000) {
    try {
        // Use the common notification system from auth.js if available
        if (typeof showNotification === 'function') {
            return showNotification(message, 'info', duration);
        }
        
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after duration
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    } catch (error) {
        console.error('Error showing toast notification:', error);
    }
};