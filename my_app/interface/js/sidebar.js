/**
 * This script consolidates functionality related to the sidebar's dynamic features
 * including creating different views for maps, schedules, and registration processes.
 */

/**
 * This script handles sidebar tab functionality and related interactions
 */

// Make sure sidebar is visible with proper styling
function ensureSidebarVisible() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
        sidebar.style.backgroundColor = 'white';
        sidebar.style.zIndex = '10';
        console.log('Sidebar visibility enforced');
        
        // Force visibility of tab buttons
        const tabButtons = sidebar.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.style.display = 'block';
            button.style.color = button.classList.contains('active') ? '#142A50' : '#333';
        });
        
        // Make sure active tab content is visible
        const activeTab = sidebar.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.style.display = 'block';
        }
        
        // Debug element styling
        const debugEl = document.getElementById('debug-sidebar');
        if (debugEl) {
            debugEl.style.display = 'block';
            debugEl.style.backgroundColor = '#f8f9fa';
            debugEl.style.color = '#333';
            debugEl.style.padding = '8px';
            debugEl.style.borderRadius = '4px';
            debugEl.style.margin = '0 0 15px 0';
        }
    }
    
    // Ensure the grid is also visible
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'flex';
    }
    
    // Remove any registration title and placeholder if present
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(header => {
        if (header.textContent.toLowerCase().includes('registration')) {
            header.style.display = 'none';
        }
    });
    
    document.querySelectorAll('p').forEach(p => {
        if (p.textContent.toLowerCase().includes('content for registration')) {
            p.style.display = 'none';
        }
    });
}

// Switch between sidebar tabs
function openTab(tabName, event) {
    console.log('Opening tab:', tabName);
    
    // Ensure sidebar is visible
    ensureSidebarVisible();
    
    // Update debug display if it exists
    if (typeof updateDebug === 'function') {
        updateDebug('openTab', `'${tabName}'`);
    }
    
    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }
    
    // Remove active class from all tab buttons
    var tabButtons = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
        tabButtons[i].style.color = "#333";
    }
    
    // Show the selected tab content
    var selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = "block";
        selectedTab.classList.add("active");
        
        // Make sure form elements inside the tab are visible
        const formElements = selectedTab.querySelectorAll('input, button, .button-group, .day-selector');
        formElements.forEach(el => {
            el.style.display = el.tagName === 'INPUT' || el.tagName === 'BUTTON' ? 'block' : 'flex';
            if (el.tagName === 'INPUT') {
                el.style.width = '100%';
            }
        });
    }
    
    // Add active class to the clicked button
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
        event.currentTarget.style.color = "#142A50";
    }
}

// Toggle filter buttons active state
function toggleFilterButton(button) {
    console.log('Toggling filter button:', button.textContent);
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        button.style.backgroundColor = '#f5f5f5';
        button.style.borderColor = '#142A50';
        button.style.color = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.borderColor = '#e0e0e0';
        button.style.color = '#333';
    }
    
    // Update debug display if it exists
    if (typeof updateDebug === 'function') {
        updateDebug('toggleFilterButton', `'${button.textContent}'`);
    }
}

// Toggle day buttons selected state
function toggleDayButton(button) {
    console.log('Toggling day button:', button.textContent);
    button.classList.toggle('selected');
    
    if (button.classList.contains('selected')) {
        button.style.backgroundColor = '#142A50';
        button.style.color = 'white';
        button.style.borderColor = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.borderColor = '#e0e0e0';
    }
    
    // Update debug display if it exists
    if (typeof updateDebug === 'function') {
        updateDebug('toggleDayButton', `'${button.textContent}'`);
    }
}

// Initialize the sidebar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing sidebar");
    
    // Immediate visibility enforcement with a small delay to ensure DOM is ready
    setTimeout(ensureSidebarVisible, 100);
    
    // Set default active tab
    var coursesTab = document.getElementById("Courses");
    if (coursesTab) {
        coursesTab.style.display = "block";
        coursesTab.classList.add("active");
    }
    
    var coursesButton = document.querySelector('.tab-button[onclick*="Courses"]');
    if (coursesButton) {
        coursesButton.classList.add("active");
        coursesButton.style.color = "#142A50";
    }
    
    // Add click events to filter buttons
    var filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(function(button) {
        // Ensure button is visible and properly styled
        button.style.display = 'block';
        button.style.padding = '12px';
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        
        button.addEventListener('click', function() {
            toggleFilterButton(this);
        });
    });
    
    // Add click events to day buttons
    var dayButtons = document.querySelectorAll('.day-button');
    dayButtons.forEach(function(button) {
        // Ensure button is visible and properly styled
        button.style.display = 'block';
        button.style.padding = '12px 8px';
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        
        button.addEventListener('click', function() {
            toggleDayButton(this);
        });
    });
    
    // Make sure all form inputs are visible and styled
    document.querySelectorAll('.search-form input').forEach(input => {
        input.style.display = 'block';
        input.style.width = '100%';
        input.style.padding = '12px 15px';
        input.style.marginBottom = '15px';
        input.style.color = '#333';
    });
    
    // Make sure search buttons are visible and styled
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.backgroundColor = '#142A50';
        btn.style.color = 'white';
        btn.style.padding = '12px 0';
    });
    
    // Initialize debug display if it exists
    if (document.getElementById('debug-sidebar')) {
        console.log('Debug sidebar display ready');
    }
    
    // Double enforcement after a longer delay to catch any post-rendering issues
    setTimeout(ensureSidebarVisible, 500);
});

// Utility function for tree item toggle
function toggleTreeItem(header) {
    var content = header.nextElementSibling;
    var arrow = header.querySelector('.arrow');
    
    console.log('Toggling tree item:', header.textContent.trim());
    
    if (content.style.display === "block") {
        content.style.display = "none";
        arrow.style.transform = "";
    } else {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
    
    // Update debug display if it exists
    if (typeof updateDebug === 'function') {
        updateDebug('toggleTreeItem', `'${header.textContent.trim()}'`);
    }
}

// Utility function for semester change
function changeSemester(semester) {
    console.log('Changing semester to:', semester);
    
    var button = document.querySelector('.semester-button');
    if (button) {
        button.innerHTML = semester + ' <span class="arrow">▼</span>';
    }
    
    // Update debug display if it exists
    if (typeof updateDebug === 'function') {
        updateDebug('changeSemester', `'${semester}'`);
    }
}

// Functions to generate various sidebar content
function createBuildingTree() {
    return `
        <div class="tree-item">
            <div class="tree-header" onclick="toggleTreeItem(this)">
                <span class="building-name">Jepson</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content" style="display: none;">
                <div class="tree-subitem">Lower-level</div>
                <div class="tree-subitem">First floor</div>
                <div class="tree-subitem">Second floor</div>
            </div>
        </div>
        <div class="tree-item">
            <div class="tree-header" onclick="toggleTreeItem(this)">
                <span class="building-name">Herak</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content" style="display: none;"></div>
        </div>
    `;
}

function createWeekdayPanels() {
    const days = {
        Monday: "No classes this day!",
        Tuesday: "MATH 231 - Calculus (2)",
        Wednesday: "No classes this day!",
        Thursday: "MATH 231 - Calculus (2)",
        Friday: "No classes this day!"
    };

    return `
        <div class="weekday-panels">
            ${Object.entries(days).map(([day, content]) => `
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>${day}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">${content}</div>
                </div>
            `).join('')}
        </div>
    `;
}
