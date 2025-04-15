import { createContextMenu } from './contextMenu.js';

/**
 * Adds event listeners to an event block to handle context menu actions.
 * @param {HTMLElement} eventBlock - The event block element.
 */
export function addEventBlockListeners(eventBlock) {
    eventBlock.addEventListener('click', handleEventBlockClick);
}

/**
 * Handles the event block click event to trigger the context menu.
 * @param {Event} event - The click event object.
 */
function handleEventBlockClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const { pageX: x, pageY: y, currentTarget: eventBlock } = event;
    createContextMenu(x, y, eventBlock);
}

/**
 * Sets up event listeners for sidebar tabs
 */
export function setupSidebarTabListeners() {
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the tab ID from data attribute
            const tabId = this.dataset.tab;
            if (!tabId) return;
            
            // Deactivate all tabs
            document.querySelectorAll('.sidebar-tabs a').forEach(t => {
                t.classList.remove('active');
            });
            
            // Activate this tab
            this.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.sidebar .tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                tabContent.style.display = 'block';
            }
        });
    });
}

/**
 * Initialize all event listeners for the application
 */
export function initializeEventListeners() {
    // Set up sidebar tab listeners
    setupSidebarTabListeners();
    
    // Set up add event button listener
    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function() {
            // Import the function dynamically to avoid circular dependencies
            import('./eventManagement.js').then(module => {
                module.addEventFromForm();
            });
        });
    }
    
    // Set up prerequisite search button listener
    const searchPrereqBtn = document.getElementById('search-prereq-btn');
    if (searchPrereqBtn) {
        searchPrereqBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('prereq-search-input');
            if (searchInput && searchInput.value.trim()) {
                // Import prereqService dynamically
                import('./prereqService.js').then(module => {
                    if (typeof module.searchPrerequisites === 'function') {
                        module.searchPrerequisites();
                    } else {
                        console.error('searchPrerequisites function not found in prereqService module');
                    }
                });
            }
        });
    }
    
    // Set up course search button listener
    const searchCoursesBtn = document.getElementById('search-courses-btn');
    if (searchCoursesBtn) {
        searchCoursesBtn.addEventListener('click', function() {
            // Import course module dynamically
            import('./course.js').then(module => {
                if (typeof module.fetchCourses === 'function') {
                    module.fetchCourses();
                } else {
                    // Fallback to calling the global function if available
                    if (typeof window.fetchCourses === 'function') {
                        window.fetchCourses();
                    } else {
                        console.error('fetchCourses function not found');
                    }
                }
            });
        });
    }
}
