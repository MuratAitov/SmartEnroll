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
                    <div class="tree-subitem" onclick="openJepsonBasementPDF()">Lower-level</div>
                    <div class="tree-subitem" onclick="openJepsonFirstFloorPDF()">First floor</div>
                    <div class="tree-subitem">Second floor</div>
                </div>
            </div>
            <div class="tree-item">
                <div class="tree-header" onclick="openHerakPDF()">
                    <span class="building-name">Herak</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="tree-content">
                </div>
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

function createRecurringEventsContent() {
    return `
        <div class="recurring-events-view">
            <div class="form-group">
                <input type="text" placeholder="Event Name" id="eventNameInput">
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

function createRegistrationSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="courses-tab active">Courses</a>
            <a href="#" class="recurring-events-tab">Recurring Events</a>
            <a href="#" class="prereq-tree-tab">Pre-Req Tree</a>
        </div>
        
        <div class="courses-view">
            <div class="form-group">
                <input type="text" placeholder="Subject" id="subjectInput" autocomplete="off">
                <div class="autocomplete-list" id="subjectList"></div>
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
                <input type="text" placeholder="Attributes" id="attributeInput" autocomplete="off">
                <div class="autocomplete-list" id="attributeList"></div>
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Instructor">
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Campus" id="campusInput" autocomplete="off">
                <div class="autocomplete-list" id="campusList"></div>
            </div>
            
            <div class="form-group">
                <input type="text" placeholder="Instructional Methods" id="methodsInput" autocomplete="off">
                <div class="autocomplete-list" id="methodsList"></div>
            </div>
        </div>

        <div class="recurring-events-view" style="display: none;">
            ${createRecurringEventsContent()}
        </div>

        <div class="prereq-tree-view" style="display: none;">
            ${createPreReqTreeContent()}
        </div>
    `;
}

// Add this function to create the Pre-Req Tree content
function createPreReqTreeContent() {
    return `
        <div class="prereq-tree-container">
            <!-- Pre-req tree content will go here -->
            <div class="coming-soon">
                Pre-Requisite Tree View Coming Soon
            </div>
        </div>
    `;
}

// Modify the registration click handler to include tab switching functionality
function initializeRegistrationSidebar() {
    const coursesTab = document.querySelector('.courses-tab');
    const recurringEventsTab = document.querySelector('.recurring-events-tab');
    const prereqTreeTab = document.querySelector('.prereq-tree-tab');
    const coursesView = document.querySelector('.courses-view');
    const recurringEventsView = document.querySelector('.recurring-events-view');
    const prereqTreeView = document.querySelector('.prereq-tree-view');
    
    // Tab switching
    if (recurringEventsTab) {
        recurringEventsTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            coursesTab.classList.remove('active');
            prereqTreeTab.classList.remove('active');
            
            // Add active class to recurring events tab
            recurringEventsTab.classList.add('active');
            
            // Show/hide views
            coursesView.style.display = 'none';
            recurringEventsView.style.display = 'block';
            prereqTreeView.style.display = 'none';
        });
    }

    if (coursesTab) {
        coursesTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            recurringEventsTab.classList.remove('active');
            prereqTreeTab.classList.remove('active');
            
            // Add active class to courses tab
            coursesTab.classList.add('active');
            
            // Show/hide views
            coursesView.style.display = 'block';
            recurringEventsView.style.display = 'none';
            prereqTreeView.style.display = 'none';
        });
    }

    if (prereqTreeTab) {
        prereqTreeTab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            coursesTab.classList.remove('active');
            recurringEventsTab.classList.remove('active');
            
            // Add active class to pre-req tree tab
            prereqTreeTab.classList.add('active');
            
            // Show/hide views
            coursesView.style.display = 'none';
            recurringEventsView.style.display = 'none';
            prereqTreeView.style.display = 'block';
        });
    }

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

    // Subject autocomplete
    const subjectInput = document.getElementById('subjectInput');
    const subjectList = document.getElementById('subjectList');

    if (subjectInput && subjectList) {
        subjectInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = subjects.filter(subject => 
                subject.toLowerCase().includes(value)
            );

            if (value && matches.length > 0) {
                subjectList.innerHTML = matches
                    .map(subject => `<div class="autocomplete-item">${subject}</div>`)
                    .join('');
                subjectList.style.display = 'block';
            } else {
                subjectList.style.display = 'none';
            }
        });

        // Handle click on autocomplete item
        subjectList.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                subjectInput.value = e.target.textContent;
                subjectList.style.display = 'none';
            }
        });

        // Close autocomplete list when clicking outside
        document.addEventListener('click', function(e) {
            if (!subjectInput.contains(e.target) && !subjectList.contains(e.target)) {
                subjectList.style.display = 'none';
            }
        });
    }

    // Attributes autocomplete
    const attributeInput = document.getElementById('attributeInput');
    const attributeList = document.getElementById('attributeList');

    if (attributeInput && attributeList) {
        attributeInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = attributes.filter(attribute => 
                attribute.toLowerCase().includes(value)
            );

            if (value && matches.length > 0) {
                attributeList.innerHTML = matches
                    .map(attribute => `<div class="autocomplete-item">${attribute}</div>`)
                    .join('');
                attributeList.style.display = 'block';
            } else {
                attributeList.style.display = 'none';
            }
        });

        // Handle click on autocomplete item
        attributeList.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                attributeInput.value = e.target.textContent;
                attributeList.style.display = 'none';
            }
        });

        // Close autocomplete list when clicking outside
        document.addEventListener('click', function(e) {
            if (!attributeInput.contains(e.target) && !attributeList.contains(e.target)) {
                attributeList.style.display = 'none';
            }
        });
    }

    // Campus autocomplete
    const campusInput = document.getElementById('campusInput');
    const campusList = document.getElementById('campusList');

    if (campusInput && campusList) {
        campusInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = campuses.filter(campus => 
                campus.toLowerCase().includes(value)
            );

            if (value && matches.length > 0) {
                campusList.innerHTML = matches
                    .map(campus => `<div class="autocomplete-item">${campus}</div>`)
                    .join('');
                campusList.style.display = 'block';
            } else {
                campusList.style.display = 'none';
            }
        });

        // Handle click on autocomplete item
        campusList.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                campusInput.value = e.target.textContent;
                campusList.style.display = 'none';
            }
        });

        // Close autocomplete list when clicking outside
        document.addEventListener('click', function(e) {
            if (!campusInput.contains(e.target) && !campusList.contains(e.target)) {
                campusList.style.display = 'none';
            }
        });
    }

    // Instructional Methods autocomplete
    const methodsInput = document.getElementById('methodsInput');
    const methodsList = document.getElementById('methodsList');

    if (methodsInput && methodsList) {
        methodsInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = instructionalMethods.filter(method => 
                method.toLowerCase().includes(value)
            );

            if (value && matches.length > 0) {
                methodsList.innerHTML = matches
                    .map(method => `<div class="autocomplete-item">${method}</div>`)
                    .join('');
                methodsList.style.display = 'block';
            } else {
                methodsList.style.display = 'none';
            }
        });

        // Handle click on autocomplete item
        methodsList.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                methodsInput.value = e.target.textContent;
                methodsList.style.display = 'none';
            }
        });

        // Close autocomplete list when clicking outside
        document.addEventListener('click', function(e) {
            if (!methodsInput.contains(e.target) && !methodsList.contains(e.target)) {
                methodsList.style.display = 'none';
            }
        });
    }

    // Add event button functionality
    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function() {
            const eventName = document.getElementById('eventNameInput').value;
            const startTime = document.getElementById('start-time').value;
            const endTime = document.getElementById('end-time').value;
            
            // Basic validation
            if (!eventName) {
                alert('Please enter an event name');
                return;
            }
            if (!startTime || !endTime) {
                alert('Please enter both start and end times');
                return;
            }
            if (!document.querySelector('.weekday-btn.selected')) {
                alert('Please select at least one day');
                return;
            }

            // Validate time format
            const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                alert('Please enter valid times in HH:MM format');
                return;
            }

            // Add event to schedule
            addEventToSchedule(eventName, null, startTime, endTime);
            
            // Clear inputs after successful addition
            document.getElementById('eventNameInput').value = '';
            document.getElementById('start-time').value = '';
            document.getElementById('end-time').value = '';
            document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
                btn.classList.remove('selected');
            });
        });
    }

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
            exportToCalendar(); // Call the export function
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
}
