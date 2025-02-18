// Utility Functions
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const isDarkMode = body.classList.contains('dark-mode');
    themeToggles.forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
}

function changeSemester(semester, element) {
    const button = document.querySelector('.semester-button');
    const content = document.querySelector('.semester-content');
    
    button.innerHTML = semester + ' <span class="arrow">▼</span>';
    content.classList.remove('show');
    button.querySelector('.arrow').style.transform = 'rotate(0deg)';
}

function toggleTreeItem(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

// Add this function to create the Map sidebar content
function createMapSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="schedule-tab active">Schedule</a>
            <a href="#" class="floor-plan-tab">Floor Plan</a>
        </div>
        
        <div class="floor-tree" style="display: none;">
            <div class="tree-item">
                <div class="tree-header" onclick="toggleTreeItem(this)">
                    <span class="building-name">Jepson</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="tree-content">
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
                <div class="tree-content"></div>
            </div>
        </div>
        
        <div class="schedule-view" style="display: block;">
            <div class="weekday-panels">
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>Monday</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content show">
                        <p>No classes this day!</p>
                    </div>
                </div>
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>Tuesday</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">
                        <p>MATH 231 - Calculus (2)</p>
                    </div>
                </div>
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>Wednesday</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">
                        <p>No classes this day!</p>
                    </div>
                </div>
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>Thursday</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">
                        <p>MATH 231 - Calculus (2)</p>
                    </div>
                </div>
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>Friday</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">
                        <p>No classes this day!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add this function to handle day panel toggling
function toggleDayPanel(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

// Add this function to create the Plan Ahead content
function createRecurringEventsContent() {
    return `
        <div class="recurring-events-view">
            <div class="form-group">
                <input type="text" placeholder="Event Name">
            </div>
            
            <div class="form-group">
                <div class="weekday-buttons">
                    <button class="weekday-btn">M</button>
                    <button class="weekday-btn">T</button>
                    <button class="weekday-btn">W</button>
                    <button class="weekday-btn">R</button>
                    <button class="weekday-btn">F</button>
                </div>
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Start Time --:--" class="time-input" id="start-time" maxlength="5">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="End Time --:--" class="time-input" id="end-time" maxlength="5">
            </div>
            
            <button class="add-event-btn">Add</button>
        </div>
    `;
}

// Modify the createRegistrationSidebar function to include both views
function createRegistrationSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="courses-tab active">Courses</a>
            <a href="#" class="recurring-events-tab">Recurring Events</a>
        </div>
        
        <div class="courses-view">
            <div class="form-group">
                <input type="text" placeholder="Subject">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Course code">
            </div>
            
            <div class="form-group">
                <div class="level-buttons">
                    <button class="division-btn" id="lower-division">Lower Division</button>
                    <button class="division-btn" id="upper-division">Upper Division</button>
                </div>
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Attributes">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Instructor">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Campus">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Delivery Mode">
            </div>
        </div>

        <div class="recurring-events-view" style="display: none;">
            ${createRecurringEventsContent()}
        </div>
    `;
}

// Modify the registration click handler to include tab switching functionality
function initializeRegistrationSidebar() {
    const coursesTab = document.querySelector('.courses-tab');
    const recurringEventsTab = document.querySelector('.recurring-events-tab');
    const coursesView = document.querySelector('.courses-view');
    const recurringEventsView = document.querySelector('.recurring-events-view');
    
    // Add tab switching functionality
    coursesTab.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.add('active');
        recurringEventsTab.classList.remove('active');
        coursesView.style.display = 'block';
        recurringEventsView.style.display = 'none';
    });
    
    recurringEventsTab.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.add('active');
        coursesTab.classList.remove('active');
        recurringEventsView.style.display = 'block';
        coursesView.style.display = 'none';
    });

    // Initialize division buttons
    const divisionBtns = document.querySelectorAll('.division-btn');
    divisionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                this.style.cssText = `
                    border: 1px solid #C4C8CE;
                    color: #6c757d;
                    background-color: transparent;
                `;
            } else {
                divisionBtns.forEach(otherBtn => {
                    otherBtn.classList.remove('selected');
                    otherBtn.style.cssText = `
                        border: 1px solid #C4C8CE;
                        color: #6c757d;
                        background-color: transparent;
                    `;
                });
                this.classList.add('selected');
                this.style.cssText = `
                    border: 1px solid #002467;
                    color: #ffffff;
                    background-color: #002467;
                `;
            }
        });
    });

    // Campus dropdown functionality
    const campusDropdown = document.querySelector('.campus-dropdown');
    if (campusDropdown) {
        const dropdownButton = campusDropdown.querySelector('.dropdown-button');
        const dropdownList = campusDropdown.querySelector('.dropdown-list');
        const dropdownItems = campusDropdown.querySelectorAll('.dropdown-item');

        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownList.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = dropdownList.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedText = this.textContent;
                dropdownButton.innerHTML = selectedText + ' <span class="arrow">▼</span>';
                dropdownList.classList.remove('show');
                dropdownButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!campusDropdown.contains(e.target)) {
                dropdownList.classList.remove('show');
                const arrow = dropdownButton.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    // Weekday button functionality
    const weekdayBtns = document.querySelectorAll('.weekday-btn');
    weekdayBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    // Time input formatting
    const timeInputs = document.querySelectorAll('.time-input');
    timeInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            
            if (value.length >= 2) {
                // Insert colon after the first two digits
                value = value.slice(0, 2) + ':' + value.slice(2);
            }
            
            // Validate hours and minutes
            const parts = value.split(':');
            if (parts[0] && parseInt(parts[0]) > 23) {
                parts[0] = '23';
            }
            if (parts[1] && parseInt(parts[1]) > 59) {
                parts[1] = '59';
            }
            
            // Update the input value
            if (parts.length === 2) {
                e.target.value = parts.join(':');
            } else {
                e.target.value = value;
            }
        });

        // Add blur event to format incomplete times
        input.addEventListener('blur', function(e) {
            let value = e.target.value;
            if (value) {
                const parts = value.split(':');
                if (parts[0] && parts[0].length === 1) parts[0] = '0' + parts[0];
                if (parts[1] && parts[1].length === 1) parts[1] = '0' + parts[1];
                if (!parts[1]) parts[1] = '00';
                e.target.value = parts.join(':');
            }
        });
    });
}

// Add this function to create the export dropdown content
function createExportDropdown() {
    return `
        <div class="dropdown-content export-dropdown">
            <a href="#" class="export-calendar">Export to Calendar</a>
            <a href="#" class="export-pdf">Export as PDF</a>
        </div>
    `;
}

// Update the semester dropdown content
function createSemesterDropdown() {
    return `
        <div class="semester-content">
            <a href="#">Summer 2025</a>
            <a href="#">Spring 2025</a>
            <a href="#">Fall 2024</a>
            <a href="#">Summer 2024</a>
            <a href="#">Spring 2024</a>
            <a href="#">Fall 2023</a>
            <a href="#">Summer 2023</a>
            <a href="#">Spring 2023</a>
        </div>
    `;
}

// Main Event Listener
document.addEventListener('DOMContentLoaded', function() {
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Semester Dropdown
    const semesterButton = document.querySelector('.semester-button');
    const semesterContent = document.querySelector('.semester-content');
    
    if (semesterButton && semesterContent) {
        // Toggle dropdown on button click
        semesterButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns if open
            const exportDropdown = document.querySelector('.export-dropdown');
            const userDropdown = document.querySelector('.user-dropdown .dropdown-content');
            if (exportDropdown) exportDropdown.classList.remove('show');
            if (userDropdown) userDropdown.classList.remove('show');
            
            semesterContent.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = semesterContent.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!semesterButton.contains(e.target) && !semesterContent.contains(e.target)) {
                semesterContent.classList.remove('show');
                const arrow = semesterButton.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });

        // Update semester text and close dropdown when option is selected
        semesterContent.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedText = this.textContent;
                semesterButton.innerHTML = selectedText + ' <span class="arrow">▼</span>';
                semesterContent.classList.remove('show');
                semesterButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
            });
        });
    }

    // Sidebar Tabs
    const sidebarTabs = document.querySelectorAll('.sidebar-tabs a');
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Theme Toggle
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    });

    // Division Buttons
    const divisionBtns = document.querySelectorAll('.division-btn');
    divisionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                this.style.cssText = `
                    border: 1px solid #C4C8CE;
                    color: #6c757d;
                    background-color: transparent;
                `;
            } else {
                divisionBtns.forEach(otherBtn => {
                    otherBtn.classList.remove('selected');
                    otherBtn.style.cssText = `
                        border: 1px solid #C4C8CE;
                        color: #6c757d;
                        background-color: transparent;
                    `;
                });
                this.classList.add('selected');
                this.style.cssText = `
                    border: 1px solid #002467;
                    color: #ffffff;
                    background-color: #002467;
                `;
            }
        });
    });

    // User Dropdown
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        const dropdownButton = document.querySelector('.user-dropdown .nav-button');

        // Toggle dropdown on button click
        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close export dropdown if open
            const exportDropdown = document.querySelector('.export-dropdown');
            if (exportDropdown) {
                exportDropdown.classList.remove('show');
            }
            
            userDropdown.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = userDropdown.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target) && 
                !e.target.matches('.user-dropdown .nav-button')) {
                userDropdown.classList.remove('show');
                const arrow = dropdownButton.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    // Set initial states
    const registrationLink = document.querySelector('.nav-links a[href="#registration"]');
    const mapLink = document.querySelector('.nav-links a[href="#map"]');
    const sidebar = document.querySelector('.sidebar');

    // Initialize registration view
    if (registrationLink) {
        registrationLink.classList.add('active');
        sidebar.innerHTML = createRegistrationSidebar();
        initializeRegistrationSidebar();
    }

    // Update Registration navigation handler
    registrationLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Always recreate the registration sidebar
        sidebar.innerHTML = createRegistrationSidebar();
        initializeRegistrationSidebar();
    });

    // Update Map navigation handler
    mapLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Update sidebar with map view
        sidebar.innerHTML = createMapSidebar();
        
        // Add tab switching functionality
        const floorPlanTab = document.querySelector('.floor-plan-tab');
        const scheduleTab = document.querySelector('.schedule-tab');
        const floorTree = document.querySelector('.floor-tree');
        const scheduleView = document.querySelector('.schedule-view');
        
        floorPlanTab.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('active');
            scheduleTab.classList.remove('active');
            floorTree.style.display = 'block';
            scheduleView.style.display = 'none';
        });
        
        scheduleTab.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('active');
            floorPlanTab.classList.remove('active');
            floorTree.style.display = 'none';
            scheduleView.style.display = 'block';
        });
    });

    // Export Dropdown
    const exportContainer = document.querySelector('.export-container');
    const exportButton = exportContainer.querySelector('.export-button');
    
    if (exportButton) {
        // Add the dropdown content after the button
        exportContainer.insertAdjacentHTML('beforeend', createExportDropdown());
        
        const exportDropdown = exportContainer.querySelector('.export-dropdown');
        
        // Toggle dropdown on button click
        exportButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close user dropdown if open
            const userDropdown = document.querySelector('.user-dropdown .dropdown-content');
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
            
            exportDropdown.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = exportDropdown.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });

        // Handle export actions
        const exportCalendar = exportContainer.querySelector('.export-calendar');
        const exportPDF = exportContainer.querySelector('.export-pdf');

        exportCalendar.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Exporting to calendar...');
            exportDropdown.classList.remove('show');
            exportButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
        });

        exportPDF.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Exporting as PDF...');
            exportDropdown.classList.remove('show');
            exportButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!exportContainer.contains(e.target)) {
                exportDropdown.classList.remove('show');
                exportButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
            }
        });
    }

    // Update the semester button to show Spring 2025 by default
    document.querySelector('.semester-button').innerHTML = 'Spring 2025 <span class="arrow">▼</span>';
});
