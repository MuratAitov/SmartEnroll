/**
 * sidebar-tabs.js - Handles the sidebar tab functionality
 * This file contains a standalone solution for sidebar tabs
 */

// Execute this code when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("sidebar-tabs.js: Initializing sidebar tabs");
    
    // Force the sidebar tabs container to be visible with CSS
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-tabs {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 100 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Get the tabs and content elements
    const tabs = document.querySelectorAll('.sidebar-tabs a');
    const tabsContainer = document.querySelector('.sidebar-tabs');
    const contents = document.querySelectorAll('.sidebar-content');
    
    // MutationObserver to monitor and fix any display changes to the tabs container
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || 
                 mutation.attributeName === 'class')) {
                
                // If the tabs are hidden, make them visible again
                if (window.getComputedStyle(tabsContainer).display === 'none' ||
                    window.getComputedStyle(tabsContainer).visibility === 'hidden') {
                    console.warn("sidebar-tabs.js: Tabs container hidden! Restoring...");
                    tabsContainer.style.display = 'flex';
                    tabsContainer.style.visibility = 'visible';
                }
            }
        });
    });
    
    // Start observing the tabs container
    if (tabsContainer) {
        observer.observe(tabsContainer, { 
            attributes: true,
            attributeFilter: ['style', 'class'] 
        });
    }
    
    // Function to show the content for a specific tab
    function showContent(tabName) {
        // Map tab names to content IDs
        const contentMapping = {
            'Courses': 'courses-content',
            'Recurring Events': 'recurring-events-content',
            'Pre-Req Tree': 'pre-req-tree-content'
        };
        
        // Hide all content sections first
        contents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Get the ID for this tab name
        const contentId = contentMapping[tabName];
        if (contentId) {
            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.style.display = 'block';
            } else {
                console.warn(`sidebar-tabs.js: Content ID ${contentId} not found!`);
            }
        } else {
            console.warn(`sidebar-tabs.js: No content mapping for tab "${tabName}"`);
            // Fallback: show the first content section
            if (contents.length > 0) {
                contents[0].style.display = 'block';
            }
        }
    }
    
    // Add click handlers to each tab
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // Prevent default link behavior
            e.preventDefault();
            
            // Get the tab name
            const tabName = this.textContent.trim();
            console.log(`sidebar-tabs.js: Tab clicked: "${tabName}"`);
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to the clicked tab
            this.classList.add('active');
            
            // Show the corresponding content
            showContent(tabName);
            
            // Extra check to ensure the tabs container is still visible
            setTimeout(() => {
                if (window.getComputedStyle(tabsContainer).display === 'none') {
                    tabsContainer.style.display = 'flex';
                    console.log("sidebar-tabs.js: Restored tab container visibility");
                }
            }, 50);
        });
    });
    
    // Initialize the active tab
    const activeTab = document.querySelector('.sidebar-tabs a.active');
    if (activeTab) {
        console.log(`sidebar-tabs.js: Initial active tab: "${activeTab.textContent.trim()}"`);
        showContent(activeTab.textContent.trim());
    } else if (tabs.length > 0) {
        // If no active tab, set the first one as active
        tabs[0].classList.add('active');
        showContent(tabs[0].textContent.trim());
    }
    
    console.log("sidebar-tabs.js: Initialization complete");
}); 