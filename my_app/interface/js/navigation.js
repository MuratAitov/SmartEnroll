/**
 * navigationManager.js
 * Responsible for managing navigation, dropdowns, themes, and view switching.
 */

// ------------------------- Initialization Control ------------------------- //
let navigationInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    if (navigationInitialized) return;
    navigationInitialized = true;

    console.log('Initializing navigation...');
    initializeNavigation();
    initializeDropdowns();
    initializeDefaultViews();
    setupSidebarTabs();
    applyThemeToggle();
    configureDivisionButtons();
    setupUserDropdown();

    // Finals tab visibility
    const finalsTab = document.getElementById('Finals');
    if (finalsTab) finalsTab.style.display = 'none';

    // Default view: registration
    const registrationLink = document.querySelector('.nav-links a[data-view="registration"]');
    if (registrationLink) {
        registrationLink.classList.add('active');
        const registrationView = document.getElementById('registration-view');
        if (registrationView) registrationView.style.display = 'flex';
    }
});

// ------------------------- Navigation Between Views ------------------------- //
function initializeNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const viewToShow = this.getAttribute('data-view');

            // Finals tab visibility
            const finalsTab = document.getElementById('Finals');
            if (finalsTab) finalsTab.style.display = (viewToShow === 'finals') ? 'block' : 'none';

            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.style.display = (viewToShow === 'finals') ? 'none' : 'block';

            const mainContent = document.querySelector('main');
            if (mainContent) mainContent.style.gridTemplateColumns = (viewToShow === 'finals') ? '1fr' : '';

            document.querySelectorAll('.view-container').forEach(container => container.style.display = 'none');

            const viewContainer = document.getElementById(`${viewToShow}-view`) || document.getElementById('registration-view');
            if (viewContainer) viewContainer.style.display = 'flex';
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.matches('.nav-button, .export-button, .arrow, .semester-button')) {
            document.querySelectorAll('.dropdown-content, .export-dropdown, .semester-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    const exportButton = document.querySelector('.export-button');
    if (exportButton) {
        exportButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.export-dropdown')?.classList.toggle('show');
        });
    }

    const navButton = document.querySelector('.nav-button');
    if (navButton) {
        navButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.dropdown-content')?.classList.toggle('show');
        });
    }

    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.semester-content')?.classList.toggle('show');
        });
    }
}

// ------------------------- Dropdowns & Sidebar ------------------------- //
function initializeDropdowns() {
    setupDropdown('.semester-button', '.semester-content');
    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.export-dropdown']);
}

function setupSidebarTabs() {
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-tabs a').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function applyThemeToggle() {
    document.querySelectorAll('.theme-toggle').forEach(toggle => {
        toggle.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    });
}

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

function setupUserDropdown() {
    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.export-dropdown']);
}

function initializeDefaultViews() {
    const sidebar = document.querySelector('.sidebar');
    setupNavView('.nav-links a[href="#registration"]', sidebar, createRegistrationSidebar, initializeRegistrationSidebar);
    setupNavView('.nav-links a[href="#map"]', sidebar, createMapSidebar, setupMapView);
    document.querySelector('.semester-button').innerHTML = 'Spring 2025 <span class="arrow">▼</span>';
}

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

function setupDropdown(buttonSelector, dropdownSelector, closeOtherSelectors = []) {
    const button = document.querySelector(buttonSelector);
    const dropdown = document.querySelector(dropdownSelector);
    if (button && dropdown) {
        button.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            closeOtherSelectors.forEach(selector => {
                document.querySelector(selector)?.classList.remove('show');
            });
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', e => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// ------------------------- Utilities ------------------------- //
function changeSemester(semester) {
    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.innerHTML = `${semester} <span class="arrow">▼</span>`;
    }
    const semesterContent = document.querySelector('.semester-content');
    if (semesterContent) semesterContent.classList.remove('show');
    console.log('Semester changed to:', semester);
    showToast(`Semester changed to ${semester}`);
}

window.showToast = function(message, duration = 3000) {
    try {
        if (typeof showNotification === 'function') {
            return showNotification(message, 'info', duration);
        }
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    } catch (error) {
        console.error('Error showing toast notification:', error);
    }
};

function setupMapView() {
    const floorPlanTab = document.querySelector('.floor-plan-tab');
    const scheduleTab = document.querySelector('.schedule-tab');
    const floorTree = document.querySelector('.floor-tree');
    const scheduleView = document.querySelector('.schedule-view');

    if (floorPlanTab && scheduleTab && floorTree && scheduleView) {
        const deactivateTabs = () => {
            floorPlanTab.classList.remove('active');
            scheduleTab.classList.remove('active');
            floorTree.style.display = 'none';
            scheduleView.style.display = 'none';
        };
        floorPlanTab.addEventListener('click', e => {
            e.preventDefault();
            deactivateTabs();
            floorPlanTab.classList.add('active');
            floorTree.style.display = 'block';
        });
        scheduleTab.addEventListener('click', e => {
            e.preventDefault();
            deactivateTabs();
            scheduleTab.classList.add('active');
            scheduleView.style.display = 'block';
        });
    }
}
