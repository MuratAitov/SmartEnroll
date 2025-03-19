document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeDropdowns();
    setupSidebarTabs();
    applyThemeToggle();
    configureDivisionButtons();
    setupUserDropdown();
    createRegistrationSidebar();
    initializeDefaultViews();
});

/**
 * Initializes navigation links and sets up active link switching.
 */
function initializeNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Initializes dropdown menus for semesters and exports.
 */
function initializeDropdowns() {
    setupDropdown('.semester-button', '.semester-content');
    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.export-dropdown']);
}

/**
 * Sets up sidebar tab switching functionality.
 */
function setupSidebarTabs() {
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-tabs a').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Applies theme toggling functionality.
 */
function applyThemeToggle() {
    document.querySelectorAll('.theme-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    });
}

/**
 * Configures division selection buttons.
 */
function configureDivisionButtons() {
    const divisionBtns = document.querySelectorAll('.division-btn');
    divisionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            divisionBtns.forEach(otherBtn => {
                otherBtn.classList.remove('selected');
                resetButtonStyle(otherBtn);
            });

            this.classList.add('selected');
            setSelectedButtonStyle(this);
        });
    });
}

/**
 * Sets up user dropdown menu.
 */
function setupUserDropdown() {
    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.export-dropdown']);
}

function createRegistrationSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.innerHTML = `
        <div class="registration-content">
            <h1>Registration</h1>
            <p>Content for registration...</p>
        </div>
    `;
    // Initialize any specific behaviors needed for registration
    initializeRegistrationFeatures();
}

/**
 * Initializes the default views and navigation behavior.
 */
function initializeDefaultViews() {
    const sidebar = document.querySelector('.sidebar');
    
    setupNavView('.nav-links a[href="#registration"]', sidebar, createRegistrationSidebar, initializeRegistrationSidebar);
    setupNavView('.nav-links a[href="#map"]', sidebar, createMapSidebar, setupMapView);

    document.querySelector('.semester-button').innerHTML = 'Spring 2025 <span class="arrow">▼</span>';
}

/**
 * Helper function to initialize a dropdown.
 * @param {string} buttonSelector - The dropdown button selector.
 * @param {string} dropdownSelector - The dropdown content selector.
 * @param {Array} closeOtherSelectors - Other dropdowns to close (optional).
 */
function setupDropdown(buttonSelector, dropdownSelector, closeOtherSelectors = []) {
    const button = document.querySelector(buttonSelector);
    const dropdown = document.querySelector(dropdownSelector);
    
    if (button && dropdown) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            closeOtherSelectors.forEach(selector => {
                const otherDropdown = document.querySelector(selector);
                if (otherDropdown) otherDropdown.classList.remove('show');
            });

            dropdown.classList.toggle('show');
            toggleDropdownArrow(button, dropdown);
        });

        document.addEventListener('click', function (e) {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                resetDropdownArrow(button);
            }
        });

        dropdown.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', function (e) {
                e.preventDefault();
                button.innerHTML = `${this.textContent} <span class="arrow">▼</span>`;
                dropdown.classList.remove('show');
                resetDropdownArrow(button);
            });
        });
    }
}

/**
 * Sets up navigation link behavior.
 * @param {string} linkSelector - The navigation link selector.
 * @param {HTMLElement} sidebar - The sidebar element.
 * @param {Function} sidebarContentFunc - Function to generate sidebar content.
 * @param {Function} initFunc - Initialization function for the sidebar.
 */
function setupNavView(linkSelector, sidebar, sidebarContentFunc, initFunc) {
    const link = document.querySelector(linkSelector);
    if (link) {
        link.classList.add('active');
        sidebar.innerHTML = sidebarContentFunc();
        initFunc();

        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            sidebar.innerHTML = sidebarContentFunc();
            initFunc();
        });
    }
}

/**
 * Toggles the dropdown arrow rotation.
 * @param {HTMLElement} button - The dropdown button element.
 * @param {HTMLElement} dropdown - The dropdown content element.
 */
function toggleDropdownArrow(button, dropdown) {
    const arrow = button.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

/**
 * Resets the dropdown arrow rotation.
 * @param {HTMLElement} button - The dropdown button element.
 */
function resetDropdownArrow(button) {
    const arrow = button.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
    }
}

/**
 * Resets button styles to default state.
 * @param {HTMLElement} button - The button element.
 */
function resetButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #C4C8CE;
        color: #6c757d;
        background-color: transparent;
    `;
}

/**
 * Applies the selected button style.
 * @param {HTMLElement} button - The button element.
 */
function setSelectedButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #002467;
        color: #ffffff;
        background-color: #002467;
    `;
}

/**
 * Configures the Map view navigation.
 */
function setupMapView() {
    const floorPlanTab = document.querySelector('.floor-plan-tab');
    const scheduleTab = document.querySelector('.schedule-tab');
    const floorTree = document.querySelector('.floor-tree');
    const scheduleView = document.querySelector('.schedule-view');

    if (floorPlanTab && scheduleTab && floorTree && scheduleView) {
        floorPlanTab.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.add('active');
            scheduleTab.classList.remove('active');
            floorTree.style.display = 'block';
            scheduleView.style.display = 'none';
        });

        scheduleTab.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.add('active');
            floorPlanTab.classList.remove('active');
            floorTree.style.display = 'none';
            scheduleView.style.display = 'block';
        });
    }
}
