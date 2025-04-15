import { addEventFromForm } from './schedule.js';
import { exportToCalendar } from './export.js';
import { addEventBlockListeners } from './eventListeners.js';
import { editEventOnSchedule } from './eventEditing.js';

function initApp() {
    console.log('Initializing schedule app...');

    // Completely remove the Finals tab when in Registration
    if (typeof removeAllFinalsContent === 'function') {
        removeAllFinalsContent();
    } else {
        // Fallback if the function isn't available yet
        const finalsTab = document.getElementById("Finals");
        if (finalsTab && finalsTab.parentNode) {
            finalsTab.parentNode.removeChild(finalsTab);
        }
    }
    
    // Initialize other components
    const addEventBtn = document.querySelector('#add-event-button');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', addEventFromForm);
    }

    const exportBtn = document.querySelector('#export-button');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCalendar);
    }

    document.querySelectorAll('.event-block').forEach(block => {
        addEventBlockListeners(block);
    });
    
    // Initialize Registration view immediately
    forceSwitchToRegistration();
}

// Dedicated function to force switch to Registration view
function forceSwitchToRegistration() {
    console.log('Forcing switch to Registration view...');
    
    // First, remove Finals content completely
    if (typeof removeAllFinalsContent === 'function') {
        removeAllFinalsContent();
    } else {
        // Fallback if the function isn't available yet
        const finalsTab = document.getElementById("Finals");
        if (finalsTab && finalsTab.parentNode) {
            finalsTab.parentNode.removeChild(finalsTab);
        }
    }
    
    // Hide all other tabs and views
    document.querySelectorAll(".tab-content, .main-content-view").forEach(content => {
        if (content.id !== 'registration-view' && content.id !== 'Courses') {
            content.style.display = "none";
            content.classList.remove("active");
        }
    });
    
    // Create the registration sidebar
    if (typeof createRegistrationSidebar === 'function') {
        createRegistrationSidebar();
    }
    
    // Make sure the Registration tab is active in navigation
    const registrationTab = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationTab) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            link.style.color = '';
        });
        
        // Add active class to Registration tab
        registrationTab.classList.add('active');
        registrationTab.style.color = '#142A50';
        
        // Make sure the Registration view is active
        if (typeof openTab === 'function') {
            openTab('Registration', { currentTarget: registrationTab });
        } else {
            // Fallback if openTab function is not available
            document.querySelectorAll('.main-content-view').forEach(view => {
                if (view.id !== 'registration-view') {
                    view.style.display = 'none';
                    view.classList.remove('active');
                }
            });
            
            const registrationView = document.getElementById('registration-view');
            if (registrationView) {
                registrationView.classList.add('active');
                registrationView.style.display = 'block';
            }
        }
    }
    
    // Final safety check - ensure Finals is completely gone
    if (typeof removeAllFinalsContent === 'function') {
        setTimeout(removeAllFinalsContent, 0);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
window.editEventOnSchedule = editEventOnSchedule;

// Import setupFinalsTabSwitching but don't call it yet
import { setupFinalsTabSwitching } from './finals.js';
// We'll only set up Finals tab when explicitly requested

document.addEventListener('DOMContentLoaded', function () {
    console.log('Main application initialization starting...');

    // Remove Finals content completely
    if (typeof removeAllFinalsContent === 'function') {
        removeAllFinalsContent();
    } else {
        const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
        finalsElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }

    initializeNavigation();
    initializeDropdowns();
    setupSidebarTabs();
    applyThemeToggle();
    configureDivisionButtons();
    setupUserDropdown();
    
    // Force switch to Registration tab
    forceSwitchToRegistration();
    
    // We'll set up Finals tab switching but won't show it by default
    setupFinalsTabSwitching();
    
    initializeDefaultViews();

    if (typeof initThemeToggle === 'function') initThemeToggle();
    if (typeof checkBackendConnection === 'function') checkBackendConnection();

    // Set up the tab change handlers
    setupTabChangeHandlers();

    const searchButton = document.querySelector('#Courses .search-btn');
    if (searchButton) {
        if (typeof fetchData === 'function') {
            searchButton.addEventListener('click', fetchData);
        } else {
            setTimeout(() => {
                if (typeof fetchData === 'function') {
                    searchButton.addEventListener('click', fetchData);
                } else {
                    searchButton.onclick = function () {
                        const criteria = {};
                        const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
                        if (subjectInput && subjectInput.value.trim()) {
                            criteria.subject = subjectInput.value.trim().toUpperCase();
                        }
                        if (typeof generateMockSections === 'function') {
                            const mockData = generateMockSections(criteria);
                            if (typeof displaySections === 'function') {
                                displaySections(mockData);
                            }
                        } else {
                            alert('Search functionality requires the course.js script. Criteria: ' + JSON.stringify(criteria));
                        }
                    };
                }
            }, 1000);
        }
    }

    const addEventButton = document.querySelector('#RecurringEvents .search-btn');
    if (addEventButton && typeof addEventFromForm === 'function') {
        addEventButton.addEventListener('click', addEventFromForm);
    }

    document.querySelectorAll('#RecurringEvents .weekday-btn').forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('selected');
        });
    });

    const inputFields = document.querySelectorAll('#Courses input[type="text"]');
    inputFields.forEach(input => {
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' && typeof fetchData === 'function') fetchData();
        });
    });

    // After a delay, do another check to ensure Registration view is active
    setTimeout(forceSwitchToRegistration, 300);

    console.log('Application initialized successfully');
});

// Set up tab change handlers to properly separate Registration and Finals
function setupTabChangeHandlers() {
    // Registration tab handler
    const registrationTab = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationTab) {
        registrationTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // First completely remove Finals content
            if (typeof removeAllFinalsContent === 'function') {
                removeAllFinalsContent();
            }
            
            // Then open Registration tab
            if (typeof openTab === 'function') {
                openTab('Registration', { currentTarget: this });
            } else {
                forceSwitchToRegistration();
            }
        });
    }

    // Finals tab handler - will create/restore Finals content when clicked
    const finalsTab = document.querySelector('.nav-links a[href="#Finals"], .nav-links a[data-tab="Finals"]');
    if (finalsTab) {
        finalsTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Handle Finals tab click differently - we'll need to recreate the content
            // since we're removing it completely when in Registration view
            if (typeof handleFinalsTabClick === 'function') {
                handleFinalsTabClick(this);
            } else if (typeof openTab === 'function') {
                openTab('Finals', { currentTarget: this });
            }
        });
    }
}

// This function handles Finals tab click
function handleFinalsTabClick(tabButton) {
    // First, hide all other content
    document.querySelectorAll(".tab-content, .main-content-view").forEach(content => {
        content.style.display = "none";
        content.classList.remove("active");
    });
    
    // Create or restore Finals content
    let finalsTab = document.getElementById('Finals');
    
    // If Finals content was stored, restore it
    if (!finalsTab && window._storedFinalsTab) {
        // Restore the stored Finals tab
        finalsTab = window._storedFinalsTab;
        
        // Find appropriate parent to add it back to
        const mainContent = document.querySelector('.main-content, main');
        if (mainContent) {
            mainContent.appendChild(finalsTab);
        } else {
            document.body.appendChild(finalsTab);
        }
    } 
    // If Finals tab doesn't exist at all, we need to create it
    else if (!finalsTab) {
        finalsTab = document.createElement('div');
        finalsTab.id = 'Finals';
        finalsTab.className = 'tab-content';
        
        // Basic structure for Finals view
        finalsTab.innerHTML = `
            <div class="semester-toggle">
                <button id="fall-btn" class="semester-switch active">Fall</button>
                <button id="spring-btn" class="semester-switch">Spring</button>
            </div>
            <div id="fall-finals" class="finals-container">
                <table class="finals-table">
                    <thead>
                        <tr>
                            <th>Class Days</th>
                            <th>Class Time</th>
                            <th>Final Exam Time</th>
                            <th>Final Exam Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Fall finals data will be populated dynamically -->
                    </tbody>
                </table>
            </div>
            <div id="spring-finals" class="finals-container" style="display:none;">
                <table class="finals-table">
                    <thead>
                        <tr>
                            <th>Class Days</th>
                            <th>Class Time</th>
                            <th>Final Exam Time</th>
                            <th>Final Exam Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Spring finals data will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        `;
        
        // Add to DOM
        const mainContent = document.querySelector('.main-content, main');
        if (mainContent) {
            mainContent.appendChild(finalsTab);
        } else {
            document.body.appendChild(finalsTab);
        }
        
        // Set up semester switching functionality
        const fallBtn = document.getElementById('fall-btn');
        const springBtn = document.getElementById('spring-btn');
        const fallFinals = document.getElementById('fall-finals');
        const springFinals = document.getElementById('spring-finals');
        
        if (fallBtn && springBtn && fallFinals && springFinals) {
            fallBtn.addEventListener('click', () => {
                fallBtn.classList.add('active');
                springBtn.classList.remove('active');
                fallFinals.style.display = 'block';
                springFinals.style.display = 'none';
            });
            
            springBtn.addEventListener('click', () => {
                springBtn.classList.add('active');
                fallBtn.classList.remove('active');
                springFinals.style.display = 'block';
                fallFinals.style.display = 'none';
            });
        }
    }
    
    // Make Finals content visible
    if (finalsTab) {
        finalsTab.style.display = 'block';
        finalsTab.classList.add('active');
    }
    
    // Update navigation highlight
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        link.style.color = '';
    });
    
    if (tabButton) {
        tabButton.classList.add('active');
        tabButton.style.color = '#142A50';
    }
}

// Make functions available globally
window.forceSwitchToRegistration = forceSwitchToRegistration;
window.handleFinalsTabClick = handleFinalsTabClick;
