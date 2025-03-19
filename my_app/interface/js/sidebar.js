/**
 * This script consolidates functionality related to the sidebar's dynamic features
 * including creating different views for maps, schedules, and registration processes.
 */

/**
 * This script handles sidebar tab functionality and related interactions
 */

// Switch between sidebar tabs
function openTab(tabName, event) {
    console.log('Opening tab:', tabName);
    
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
    }
    
    // Show the selected tab content
    var selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = "block";
        selectedTab.classList.add("active");
    }
    
    // Add active class to the clicked button
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }
}

// Toggle filter buttons active state
function toggleFilterButton(button) {
    button.classList.toggle('active');
}

// Toggle day buttons selected state
function toggleDayButton(button) {
    button.classList.toggle('selected');
}

// Initialize the sidebar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing sidebar");
    
    // Set default active tab
    var coursesTab = document.getElementById("Courses");
    if (coursesTab) {
        coursesTab.style.display = "block";
        coursesTab.classList.add("active");
    }
    
    var coursesButton = document.querySelector('.tab-button[onclick*="Courses"]');
    if (coursesButton) {
        coursesButton.classList.add("active");
    }
    
    // Add click events to filter buttons
    var filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            toggleFilterButton(this);
        });
    });
    
    // Add click events to day buttons
    var dayButtons = document.querySelectorAll('.day-button');
    dayButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            toggleDayButton(this);
        });
    });
});

// Utility function for tree item toggle
function toggleTreeItem(header) {
    var content = header.nextElementSibling;
    var arrow = header.querySelector('.arrow');
    
    if (content.style.display === "block") {
        content.style.display = "none";
        arrow.style.transform = "";
    } else {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
}

// Utility function for semester change
function changeSemester(semester) {
    var button = document.querySelector('.semester-button');
    if (button) {
        button.innerHTML = semester + ' <span class="arrow">▼</span>';
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
