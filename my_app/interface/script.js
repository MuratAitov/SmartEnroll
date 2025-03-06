// Utility Functions
function toggleTheme() {
    const body = document.body;
    const logoImg = document.querySelector('.logo img');
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    
    // Update theme toggle buttons text
    themeToggles.forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
    
    // Update logo based on theme with new path
    if (isDarkMode) {
        logoImg.src = '../GU Logo/IMG_4570.jpg'; // Dark mode logo
    } else {
        logoImg.src = '../GU Logo/IMG_4571.jpg'; // Light mode logo
    }
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

// Add this function to handle day panel toggling
function toggleDayPanel(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

// Add this function to create the context menu
function createContextMenu(x, y, eventBlock) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = `
        <div class="menu-item edit">Edit Event</div>
        <div class="menu-item color">Change Color</div>
        <div class="menu-item duplicate">Duplicate</div>
        <div class="menu-item delete">Delete</div>
    `;

    // Add event listeners for menu items
    menu.querySelector('.edit').addEventListener('click', () => {
        // Get current values
        const currentName = eventBlock.querySelector('.event-name').textContent;
        const currentTime = eventBlock.querySelector('.event-time').textContent;
        const [currentStart, currentEnd] = currentTime.split(' - ');

        // Create edit form HTML
        const editForm = document.createElement('div');
        editForm.className = 'edit-form';
        editForm.innerHTML = `
            <div class="form-group">
                <input type="text" id="edit-name" placeholder="Event Name" value="${currentName}">
            </div>
            <div class="form-group">
                <div class="weekday-buttons">
                    <button class="weekday-btn" data-day="T">T</button>
                    <button class="weekday-btn" data-day="W">W</button>
                    <button class="weekday-btn" data-day="R">R</button>
                    <button class="weekday-btn" data-day="F">F</button>
                    <button class="weekday-btn" data-day="M">M</button>
                </div>
            </div>
            <div class="form-group">
                <input type="time" id="edit-start" value="${currentStart}">
            </div>
            <div class="form-group">
                <input type="time" id="edit-end" value="${currentEnd}">
            </div>
            <div class="edit-buttons">
                <button class="save-btn">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        // Show edit form
        const editDialog = document.createElement('div');
        editDialog.className = 'edit-dialog';
        editDialog.appendChild(editForm);
        document.body.appendChild(editDialog);

        // Add event listeners for weekday buttons
        editForm.querySelectorAll('.weekday-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });

        // Handle save
        editForm.querySelector('.save-btn').addEventListener('click', () => {
            const newName = editForm.querySelector('#edit-name').value;
            const newStart = editForm.querySelector('#edit-start').value;
            const newEnd = editForm.querySelector('#edit-end').value;
            const selectedDays = Array.from(editForm.querySelectorAll('.weekday-btn.selected'))
                .map(btn => btn.dataset.day);
            
            // Validate inputs
            if (!newName || !newStart || !newEnd) {
                alert('Please fill in all fields');
                return;
            }
            if (selectedDays.length === 0) {
                alert('Please select at least one day');
                return;
            }

            // Remove existing event blocks
            const cell = eventBlock.parentElement;
            cell.innerHTML = '';

            // Create new event blocks for each selected day
            selectedDays.forEach(day => {
                const dayIndex = ['M', 'T', 'W', 'R', 'F'].indexOf(day) + 1;
                const startCell = document.querySelector(`table tr:nth-child(${startHour - 8 + 2}) td:nth-child(${dayIndex + 1})`);
                
                if (startCell) {
                    addEventToSchedule(newName, [day], newStart, newEnd);
                }
            });

            editDialog.remove();
        });

        // Handle cancel
        editForm.querySelector('.cancel-btn').addEventListener('click', () => {
            editDialog.remove();
        });

        menu.remove();
    });

    menu.querySelector('.color').addEventListener('click', () => {
        // Remove any existing color picker
        const existingPicker = document.querySelector('.color-picker');
        if (existingPicker) {
            existingPicker.remove();
        }

        // Create color picker
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        
        // Define colors
        const colors = [
            '#808080', // Gray
            '#4A90E2', // Blue
            '#B41231', // Red
            '#357ABD', // Light Blue
            '#002467', // Dark Blue
            '#2ECC71', // Green
            '#E67E22', // Orange
            '#9B59B6', // Purple
            '#E74C3C', // Bright Red
            '#1ABC9C'  // Turquoise
        ];

        // Add color options
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            
            colorOption.addEventListener('click', () => {
                // Get the event name to find related blocks
                const eventName = eventBlock.querySelector('.event-name').textContent;
                const eventTime = eventBlock.querySelector('.event-time').textContent;
                
                // Find all event blocks with the same name and time
                const allEventBlocks = document.querySelectorAll('.event-block');
                allEventBlocks.forEach(block => {
                    if (block.querySelector('.event-name').textContent === eventName &&
                        block.querySelector('.event-time').textContent === eventTime) {
                        block.style.backgroundColor = color;
                    }
                });
                
                colorPicker.remove();
                menu.remove();
            });
            
            colorPicker.appendChild(colorOption);
        });

        // Position the color picker next to the context menu
        const menuRect = menu.getBoundingClientRect();
        colorPicker.style.left = `${menuRect.right + 5}px`;
        colorPicker.style.top = `${menuRect.top}px`;

        // Add to document
        document.body.appendChild(colorPicker);

        // Close color picker when clicking outside
        document.addEventListener('click', function closeColorPicker(e) {
            if (!colorPicker.contains(e.target) && !menu.contains(e.target)) {
                colorPicker.remove();
                document.removeEventListener('click', closeColorPicker);
            }
        });

        menu.remove();
    });

    menu.querySelector('.duplicate').addEventListener('click', () => {
        const clone = eventBlock.cloneNode(true);
        
        // Define colors for duplicates
        const colors = [
            '#E74C3C',  // Bright Red
            '#2ECC71',  // Green
            '#E67E22',  // Orange
            '#9B59B6',  // Purple
            '#1ABC9C'   // Turquoise
        ];
        
        // Get current color in RGB format for accurate comparison
        const computedStyle = window.getComputedStyle(eventBlock);
        const currentColor = computedStyle.backgroundColor;
        
        // Convert hex colors to RGB for comparison
        const availableColors = colors.filter(color => {
            const tempDiv = document.createElement('div');
            tempDiv.style.color = color;
            document.body.appendChild(tempDiv);
            const rgbColor = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            return rgbColor !== currentColor;
        });
        
        // Set a random different color for the duplicate
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        clone.style.backgroundColor = randomColor;
        
        // Get original event name
        const originalName = eventBlock.querySelector('.event-name').textContent;
        
        // Find existing copies and get the next number
        const cell = eventBlock.parentNode;
        const existingBlocks = cell.querySelectorAll('.event-block');
        let copyNumber = 0;
        
        existingBlocks.forEach(block => {
            const name = block.querySelector('.event-name').textContent;
            if (name.startsWith(originalName + ' copy')) {
                const match = name.match(/copy(\d+)?$/);
                if (match) {
                    const num = match[1] ? parseInt(match[1]) : 0;
                    copyNumber = Math.max(copyNumber, num + 1);
                } else {
                    copyNumber = Math.max(copyNumber, 1);
                }
            }
        });
        
        // Update only the clone's name
        clone.querySelector('.event-name').textContent = `${originalName} copy${copyNumber || ''}`;
        
        // Calculate width and position based on total number of blocks
        const totalBlocks = existingBlocks.length + 1;
        const blockWidth = 96 / totalBlocks;
        const gap = 2 / (totalBlocks - 1);
        
        // Reposition all blocks
        existingBlocks.forEach((block, index) => {
            block.style.width = `${blockWidth}%`;
            block.style.left = `${(index * (blockWidth + gap))}%`;
        });
        
        // Position the new clone
        clone.style.width = `${blockWidth}%`;
        clone.style.left = `${((totalBlocks - 1) * (blockWidth + gap))}%`;
        
        // Keep the same height and position
        clone.style.height = eventBlock.style.height;
        clone.style.top = eventBlock.style.top;
        
        // Add event listeners to the clone
        addEventBlockListeners(clone);
        
        // Add to the same cell
        eventBlock.parentNode.appendChild(clone);
        
        menu.remove();
    });

    // Updated delete functionality
    menu.querySelector('.delete').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this event?')) {
            const cell = eventBlock.parentElement;
            eventBlock.remove();
            
            // Get remaining blocks in the same cell
            const remainingBlocks = cell.querySelectorAll('.event-block');
            const totalBlocks = remainingBlocks.length;
            
            if (totalBlocks > 0) {
                // Recalculate width and position for remaining blocks
                const blockWidth = 96 / totalBlocks;
                const gap = 2 / (totalBlocks - 1 || 1);
                
                // Reposition remaining blocks
                remainingBlocks.forEach((block, index) => {
                    block.style.width = `${blockWidth}%`;
                    block.style.left = `${(index * (blockWidth + gap))}%`;
                });
            }
        }
        menu.remove();
    });

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Update the addEventBlockListeners function
function addEventBlockListeners(eventBlock) {
    eventBlock.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createContextMenu(e.pageX, e.pageY, eventBlock);
    });
}

// Update the addEventToSchedule function
function addEventToSchedule(eventName, days, startTime, endTime) {
    // Convert times to hour and minute numbers
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Get all selected days
    const selectedDays = [];
    document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
        const day = btn.textContent;
        const dayIndex = ['M', 'T', 'W', 'R', 'F'].indexOf(day) + 1;
        selectedDays.push(dayIndex);
    });

    // Create event blocks for each selected day
    selectedDays.forEach(dayIndex => {
        // Find the start cell
        const startRowIndex = startHour - 8 + 2; // +2 to account for header row and 8AM start
        const startCell = document.querySelector(`table tr:nth-child(${startRowIndex}) td:nth-child(${dayIndex + 1})`);
        
        if (startCell) {
            const eventBlock = document.createElement('div');
            eventBlock.className = 'event-block';
            
            // Calculate position and height based on exact times
            const startMinuteOffset = (startMinute / 60) * 60; // Convert minutes to pixels
            const endMinuteOffset = (endMinute / 60) * 60;
            const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
            
            // Set the block's style with precise positioning
            eventBlock.style.top = `${startMinuteOffset}px`;
            eventBlock.style.height = `${duration}px`;
            eventBlock.style.zIndex = '1';
            
            // Create the event content with name and time
            eventBlock.innerHTML = `
                <div class="event-name">${eventName}</div>
                <div class="event-time">${startTime} - ${endTime}</div>
            `;
            
            // Add event listeners to the new block
            addEventBlockListeners(eventBlock);

            startCell.style.position = 'relative';
            startCell.appendChild(eventBlock);
        }
    });
}

// Update the createRecurringEventsContent function to remove the export button
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

// Update the subjects array at the top of the file
const subjects = [
    'Accounting',
    'Art',
    'Business',
    'Chemistry',
    'Communication',
    'Communication Leadership',
    'Computer Science',
    'Counselor Education',
    'Criminology',
    'Critical Race & Ethnic Studies',
    'Doctoral Prg in Leadership Studies',
    'Economics',
    'Engineering Science',
    'English',
    'English Language Center',
    'Environmental Studies & Science',
    'Finance',
    'French',
    'German',
    'Health Equity',
    'History',
    'Human Physiology',
    'Integrated Media',
    'International Studies',
    'Italian',
    'Journalism',
    'Management',
    'Management Information Systems',
    'Marketing',
    'Masters Accounting',
    'Masters Business Administration',
    'Masters Business Analytics',
    'Mathematics',
    'Military Science',
    'Modern Language',
    'Music',
    'Native American Studies',
    'Nurse Anesthesia Practice',
    'Nursing Organizational Leadership',
    'Philosophy',
    'Physical Education',
    'Political Science',
    'Psychology',
    'Religious Studies',
    'Sociology',
    'Solidarity & Social Justice',
    'Spanish',
    'Special Education',
    'Teacher Education',
    'Teaching English as Second Language',
    'Transmission & Distribution',
    'Womens and Gender Studies'
];

// Add the attributes array at the top of the file
const attributes = [
    'Activity',
    'Additional Lab Fee Required',
    'BU Experiential Credits',
    'BU International Credits',
    'CATH - Catholic Studies Elective',
    'CENG - Tech Elective',
    'Climate/Sustainable/Environmental Justice',
    'Community Engaged Learning',
    'Core: Christian or Catholic',
    'Core: Communication and Speech',
    'Core: Core Integration Seminar',
    'Core: Ethics',
    'Core: Fine Arts and Design',
    'Core: First Year Seminar',
    'Core: Global Studies',
    'Core: History',
    'Core: Literature',
    'Core: Mathematics',
    'Core: Philosophy of Human Nature',
    'Core: Reasoning',
    'Core: Science Inquiry',
    'Core: Social Justice',
    'Core: Social/Behavioral Science',
    'Core: World or Comparative Religion',
    'Core: Writing',
    'Core: Writing Enriched',
    'CPEN - Tech Elective',
    'EENG - Tech Elective',
    'ENGL - American Lit Post-1900',
    'ENGL - American Lit Pre-1900',
    'ENGL - British Lit 1660-1914',
    'ENGL - British Lit Post-1660',
    'ENGL - British Lit Pre-1660',
    'ENGL - British/American Lit',
    'ENGL - Literature Post-1914',
    'ENGL - Literature Pre-1660',
    'ENGL - Multicultural Distribution',
    'ENGL - Writing',
    'ENVS - Science Tech Elective',
    'ENVS - Studies Elective',
    'FILM - Film Elective',
    'HEAL - Electives',
    'HEAL - Experiential',
    'HIST - Modern Europe',
    'HIST - Non-West/Dev Area',
    'HIST - Pre-Modern Europe',
    'HIST - U.S. History',
    'Immersive Outdoor Learning',
    'INST - Africa Region Content',
    'INST - Asian Region Content',
    'INST - Asian Studies Content',
    'INST - Difference',
    'INST - Europe Region Content',
    'INST - European Studies',
    'INST - Glbl/Incl Theme Content',
    'INST - Interactions',
    'INST - Latin Am Region Content',
    'INST - Latin American Studies',
    'INST - Mid East Region Content',
    'INST - Pol Econ Theme Content',
    'INST - War/Peace Theme Content',
    'ITAL - Studies Upper Division Elective',
    'MENG - Tech Elective',
    'On-line/Internet Course',
    'PHIL - Contemporary',
    'PHIL - Ethics or Political',
    'Science Class - Non-Science Majors',
    'SOSJ - Block A',
    'SOSJ - Block B',
    'SOSJ - Block C',
    'SOSJ - Block D',
    'Transportation Not Provided',
    'Undergraduate Core'
];

// Add the campuses array at the top of the file
const campuses = [
    'Florence',
    'Main',
    'Off-Campus/Cohort Programs',
    'Online Graduate Nursing',
    'Professional Studies Abroad'
];

// Add the instructional methods array at the top of the file
const instructionalMethods = [
    'Classroom Face-to-Face Only',
    'Hybrid Synchronous and Zoom',
    'On-Line Asynchronous Only',
    'Remote Synchronous Zoom'
];

// Update the form group for Subject in createRegistrationSidebar
function createRegistrationSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="courses-tab active">Courses</a>
            <a href="#" class="recurring-events-tab">Recurring Events</a>
            <a href="#" class="prereq-tree-tab">Pre-Req Tree</a>
        </div>
        
        <div class="courses-view">
            <div class="form-group">
                <input type="text" placeholder="Subject" id="subjectInput">
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
            
            <button class="add-course-btn">Add Course</button>
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
        <div class="prereq-tree-container" id="prereqTreeContainer">
            <div class="prereq-search-form">
                <div class="form-group">
                    <input type="text" id="prereqCourseInput" placeholder="Enter Course Code (e.g., CPSC 321)">
                    <button id="searchPrereqBtn">Search</button>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="showAllLevelsCheckbox"> 
                        Show all prerequisite levels
                    </label>
                </div>
            </div>
        </div>
    `;
}

// Add this function to handle the Enter key press
function handleEnterKeyPress(event) {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        
        // Get the form values
        const eventName = document.getElementById('eventNameInput').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const selectedDays = Array.from(document.querySelectorAll('.weekday-btn.selected'))
            .map(btn => btn.dataset.day);
        
        if (eventName && startTime && endTime && selectedDays.length > 0) {
            // Create event blocks for each selected day
            selectedDays.forEach(day => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${startTime}"]`);
                if (cell) {
                    const eventBlock = document.createElement('div');
                    eventBlock.className = 'event-block';
                    eventBlock.innerHTML = `
                        <span class="event-name">${eventName}</span>
                        <span class="event-time">${startTime} - ${endTime}</span>
                    `;
                    cell.appendChild(eventBlock);
                }
            });
            
            // Clear the form
            document.getElementById('eventNameInput').value = '';
            document.getElementById('start-time').value = '';
            document.getElementById('end-time').value = '';
            document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
                btn.classList.remove('selected');
            });
        }
    }
}

// Add event listeners to all input fields in the Recurring Events form
function initializeRecurringEventsForm() {
    const recurringEventsForm = document.querySelector('.recurring-events-view form');
    if (recurringEventsForm) {
        // Add the event listener to all input fields
        recurringEventsForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', handleEnterKeyPress);
        });
        
        // Also add the event listener to the form itself
        recurringEventsForm.addEventListener('keypress', handleEnterKeyPress);
    }
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
            exportToAppleCalendar(); // Call the export function
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

    // Initialize the Recurring Events form
    initializeRecurringEventsForm();
}

// Update the createExportDropdown function
function createExportDropdown() {
    return `
        <div class="export-dropdown">
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

// Update the export calendar functionality
function exportToAppleCalendar() {
    // Get schedule data from your grid
    const scheduleGrid = document.querySelector('.schedule-grid');
    const events = [];
    
    // Find all event blocks in the schedule
    const eventBlocks = scheduleGrid.querySelectorAll('.event-block');
    
    eventBlocks.forEach(block => {
        const eventName = block.querySelector('.event-name').textContent;
        const eventTime = block.querySelector('.event-time').textContent;
        const cell = block.closest('td');
        const day = cell.dataset.day;
        
        // Create calendar event
        const event = {
            title: eventName,
            time: eventTime,
            day: day
        };
        events.push(event);
    });
    
    // Create ICS file content
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SmartEnroll//Course Schedule//EN'
    ];
    
    events.forEach(event => {
        icsContent = icsContent.concat([
            'BEGIN:VEVENT',
            `SUMMARY:${event.title}`,
            `DTSTART:${formatDateForICS(event.day, event.time.split(' - ')[0])}`,
            `DTEND:${formatDateForICS(event.day, event.time.split(' - ')[1])}`,
            'RRULE:FREQ=WEEKLY',
            'END:VEVENT'
        ]);
    });
    
    icsContent.push('END:VCALENDAR');
    
    // Create and download the ICS file
    const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Helper function to format dates for ICS file
function formatDateForICS(day, time) {
    // Get next occurrence of the day
    const days = {'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5};
    const today = new Date();
    const targetDay = days[day];
    const daysUntilTarget = (targetDay + 7 - today.getDay()) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    // Format the date and time
    const [hours, minutes] = time.match(/(\d+):(\d+)/).slice(1);
    targetDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return targetDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Update the export calendar click handler
document.querySelector('.export-ioscalendar').addEventListener('click', function(e) {
    e.preventDefault();
    exportToAppleCalendar();
    document.querySelector('.export-dropdown').classList.remove('show');
});

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
        
        // Reset the schedule container
        const scheduleContainer = document.querySelector('.schedule-grid');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = `
                <table>
                    <tr>
                        <th></th>
                        <th>M</th>
                        <th>T</th>
                        <th>W</th>
                        <th>R</th>
                        <th>F</th>
                    </tr>
                    <tr><td>8:00 AM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>9:00 AM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>10:00 AM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>11:00 AM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>12:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>1:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>2:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>3:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>4:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>5:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>6:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>7:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>8:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>9:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>10:00 PM</td><td></td><td></td><td></td><td></td><td></td></tr>
                </table>
            `;
            // Reset any styles that might have been added
            scheduleContainer.style.padding = '';
            scheduleContainer.style.overflow = '';
        }
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

    // Update the semester button to show Spring 2025 by default
    document.querySelector('.semester-button').innerHTML = 'Spring 2025 <span class="arrow">▼</span>';

    // Add this line to your initialization code (where you initialize other components)
    initializeExportDropdown();

    // Export dropdown functionality
    const exportButton = document.querySelector('.export-button');
    const exportDropdown = document.querySelector('.export-dropdown');

    if (exportButton && exportDropdown) {
        // Toggle dropdown on button click
        exportButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
            
            // Toggle export dropdown
            exportDropdown.classList.toggle('show');
            
            // Rotate arrow
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = exportDropdown.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!exportButton.contains(e.target)) {
                exportDropdown.classList.remove('show');
                const arrow = exportButton.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });

        // Add functionality to export options
        const exportCalendar = exportDropdown.querySelector('.export-calendar');
        const exportPDF = exportDropdown.querySelector('.export-pdf');

        if (exportCalendar) {
            exportCalendar.addEventListener('click', function(e) {
                e.preventDefault();
                exportToAppleCalendar();
                exportDropdown.classList.remove('show');
            });
        }

        if (exportPDF) {
            exportPDF.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Exporting as PDF...');
                exportDropdown.classList.remove('show');
            });
        }
    }

    // Initialize prerequisite tree tab if it exists
    initializePrereqTreeTab();
    
    // Add event listener for prereq search button
    const searchPrereqBtn = document.getElementById('searchPrereqBtn');
    if (searchPrereqBtn) {
        searchPrereqBtn.addEventListener('click', function() {
            const courseInput = document.getElementById('prereqCourseInput');
            const allLevelsCheckbox = document.getElementById('showAllLevelsCheckbox');
            
            if (courseInput) {
                const courseCode = courseInput.value.trim();
                const allLevels = allLevelsCheckbox ? allLevelsCheckbox.checked : false;
                
                if (courseCode) {
                    loadPrerequisiteTree(courseCode, allLevels);
        }
    }
});
    }

    // Fix Google Calendar export functionality
    const exportGoogleCalendarLink = document.querySelector('.export-googlecalendar');
    if (exportGoogleCalendarLink) {
        // Remove any existing event listeners (to avoid duplicates)
        const newGoogleCalendarLink = exportGoogleCalendarLink.cloneNode(true);
        if (exportGoogleCalendarLink.parentNode) {
            exportGoogleCalendarLink.parentNode.replaceChild(newGoogleCalendarLink, exportGoogleCalendarLink);
        }
        
        // Add the correct event listener
        newGoogleCalendarLink.addEventListener('click', function(e) {
            e.preventDefault();
            exportToGoogleCalendar();
            
            // Close the dropdown after clicking
            const exportDropdown = document.querySelector('.export-dropdown');
            if (exportDropdown) {
                exportDropdown.classList.remove('show');
            }
            
            // Reset arrow rotation
            const exportButton = document.querySelector('.export-button');
            if (exportButton) {
                const arrow = exportButton.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    // Initialize authentication forms
    initializeAuthForms();

    // Add Course button event listener
    const addCourseBtn = document.querySelector('.add-course-btn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', addCourse);
    }

    checkApiAvailability();
    setupExportButtons();
});

// Function to initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authModal = document.getElementById('authModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    // Handle tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and forms
            authTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding form
            const tabName = this.getAttribute('data-tab');
            const form = document.getElementById(tabName + 'Form');
            if (form) {
                form.classList.add('active');
            }
        });
    });
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('loginUserName').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!userName || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            loginUser({
                user_name: userName,
                password: password
            })
            .then(response => {
                console.log('Login successful:', response);
                
                // Store user data in localStorage
                if (response.data) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    
                    // Update UI to reflect logged-in state
                    updateAuthState(true, response.data);
                    
                    // Close the auth modal
                    if (authModal) {
                        authModal.classList.remove('show');
                    }
                    
                    // Show success message
                    alert('Login successful!');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert(error.message || 'Login failed. Please try again.');
            });
        });
    }
    
    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = document.getElementById('regUserName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const name = document.getElementById('regName').value;
            
            if (!userName || !email || !password || !name) {
                alert('Please fill in all fields');
                return;
            }
            
            registerUser({
                user_name: userName,
                email: email,
                password: password,
                name: name
            })
            .then(response => {
                console.log('Registration successful:', response);
                
                // Show success message
                alert('Registration successful! You can now log in.');
                
                // Switch to login tab
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                if (loginTab) {
                    loginTab.click();
                }
                
                // Clear registration form
                registerForm.reset();
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert(error.message || 'Registration failed. Please try again.');
            });
        });
    }
    
    // Handle sign in link click
    const signInLink = document.querySelector('a[href="#signin"]');
    if (signInLink) {
        signInLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show auth modal
            if (authModal) {
                authModal.classList.add('show');
            }
            
            // Switch to login tab
            const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
            if (loginTab) {
                loginTab.click();
            }
        });
    }
    
    // Handle sign out link click
    const signOutLink = document.querySelector('a[href="#signout"]');
    if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear user data from localStorage
            localStorage.removeItem('user');
            
            // Update UI to reflect logged-out state
            updateAuthState(false);
            
            // Show success message
            alert('You have been signed out.');
        });
    }
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            updateAuthState(true, userData);
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('user');
        }
    }
}

// Function to update UI based on authentication state
function updateAuthState(isAuthenticated, userData = null) {
    const body = document.body;
    
    if (isAuthenticated && userData) {
        // Add authenticated class to body
        body.classList.add('is-authenticated');
        
        // Update username display
        const usernameElements = document.querySelectorAll('.username');
        usernameElements.forEach(element => {
            element.textContent = userData.name || userData.user_name;
        });
        
        console.log('User authenticated:', userData);
    } else {
        // Remove authenticated class from body
        body.classList.remove('is-authenticated');
        
        // Clear username display
        const usernameElements = document.querySelectorAll('.username');
        usernameElements.forEach(element => {
            element.textContent = '';
        });
        
        console.log('User logged out');
    }
}

// User Authentication Functions
function registerUser(userData) {
    return fetch('/user_bp/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Registration failed');
            });
        }
        return response.json();
    });
}

function loginUser(credentials) {
    return fetch('/user_bp/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Login failed');
            });
        }
        return response.json();
    });
}

// Update the openHerakPDF function with the correct directory path
function openHerakPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/Herak Center.pdf';  // Updated path to include directory
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';  // Remove padding for full-width PDF
        scheduleContainer.style.overflow = 'hidden';  // Prevent scrollbars
    }
}

// Also update the Jepson PDFs to use the same directory
function openJepsonFirstFloorPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/Jepson1stFloor.pdf';  // Path is already correct
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}

function openJepsonBasementPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/JepsonBasementpdf.pdf';  // Path is already correct
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}

// Show auth modal when clicking Sign In
document.querySelector('a[href="#signin"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('authModal').classList.add('show');
    document.getElementById('userDropdown').classList.remove('show');
});

// Auth tabs functionality
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and forms
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding form
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
    });
});

// Close modal when clicking outside
document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.target.classList.remove('show');
    }
});

// Initialize auth state on page load with no user data
updateAuthState(false);

// Add this function to initialize the export dropdown
function initializeExportDropdown() {
    const exportContainer = document.querySelector('.export-container');
    const exportButton = exportContainer.querySelector('.export-button');
    
    // Create and append the dropdown if it doesn't exist
    if (!exportContainer.querySelector('.export-dropdown')) {
        const exportDropdown = document.createElement('div');
        exportDropdown.className = 'export-dropdown';
        exportDropdown.innerHTML = `
            <a href="#" class="export-calendar">Export to Calendar</a>
            <a href="#" class="export-pdf">Export as PDF</a>
        `;
        exportContainer.appendChild(exportDropdown);
    }

    const exportDropdown = exportContainer.querySelector('.export-dropdown');

    // Toggle dropdown on button click
    exportButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close user dropdown if open
        const userDropdown = document.getElementById('userDropdown');
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

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!exportContainer.contains(e.target)) {
            exportDropdown.classList.remove('show');
            exportButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
        }
    });
}

// If there's a function that handles all autocomplete, modify it to exclude subject
function handleAutocomplete(inputId, listId, items) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    
    if (!input || !list) return;
    
    // Skip autocomplete for subject input
    if (inputId === 'subjectInput') return;
    
    // Continue with autocomplete for other fields
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const matches = items.filter(item => 
            item.toLowerCase().includes(value)
        );

        if (value && matches.length > 0) {
            list.innerHTML = matches
                .map(item => `<div class="autocomplete-item">${item}</div>`)
                .join('');
            list.style.display = 'block';
        } else {
            list.style.display = 'none';
        }
    });
    
    // Handle click on autocomplete item
    list.addEventListener('click', function(e) {
        if (e.target.classList.contains('autocomplete-item')) {
            input.value = e.target.textContent;
            list.style.display = 'none';
        }
    });

    // Close autocomplete list when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.style.display = 'none';
        }
    });
}

// If there's a specific function for subject autocomplete, modify it
function initializeSubjectAutocomplete() {
    // This function is now disabled as per user request
    console.log("Subject autocomplete has been disabled");
    return;
}

// Function to fetch prerequisite data from the backend
function fetchPrerequisiteGraph(courseCode, allLevels = false) {
    // Construct the API URL with query parameters
    const url = `/api/graph?course=${encodeURIComponent(courseCode)}&all=${allLevels}`;
    
    // Return the fetch promise
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching prerequisite graph:', error);
            // Return mock data in case of error for development purposes
            return {
                "nodes": [
                    {"id": courseCode, "name": "Course Not Found", "level": 0},
                    {"id": "ERROR", "name": "Connection Error", "level": 1}
                ],
                "links": [
                    {"source": "ERROR", "target": courseCode, "type": "ERROR"}
                ]
            };
        });
}

// Function to render the prerequisite tree visualization
function renderPrerequisiteTree(graphData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    if (graphData.error) {
        container.innerHTML = `<div class="error-message">${graphData.error}</div>`;
        return;
    }
    
    // Create a simple tree visualization
    const treeContainer = document.createElement('div');
    treeContainer.className = 'prereq-tree';
    
    // Group nodes by level
    const nodesByLevel = {};
    graphData.nodes.forEach(node => {
        if (!nodesByLevel[node.level]) {
            nodesByLevel[node.level] = [];
        }
        nodesByLevel[node.level].push(node);
    });
    
    // Create levels from bottom to top (highest level number to lowest)
    const levels = Object.keys(nodesByLevel).sort((a, b) => b - a);
    
    levels.forEach(level => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tree-level';
        levelDiv.dataset.level = level;
        
        nodesByLevel[level].forEach(node => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.dataset.id = node.id;
            nodeDiv.innerHTML = `
                <div class="node-content">
                    <div class="node-id">${node.id}</div>
                    <div class="node-name">${node.name}</div>
                </div>
            `;
            levelDiv.appendChild(nodeDiv);
        });
        
        treeContainer.appendChild(levelDiv);
    });
    
    // Add links between nodes
    const linksContainer = document.createElement('div');
    linksContainer.className = 'tree-links';
    
    // We'll add this later with proper SVG rendering
    
    container.appendChild(treeContainer);
    container.appendChild(linksContainer);
    
    // Add event listener for course search in prereq tree view
    const searchForm = document.createElement('div');
    searchForm.className = 'prereq-search-form';
    searchForm.innerHTML = `
        <div class="form-group">
            <input type="text" id="prereqCourseInput" placeholder="Enter Course Code (e.g., CPSC 321)">
            <button id="searchPrereqBtn">Search</button>
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="showAllLevelsCheckbox"> 
                Show all prerequisite levels
            </label>
        </div>
    `;
    
    // Insert search form at the beginning of the container
    container.insertBefore(searchForm, container.firstChild);
    
    // Add event listeners for search
    const searchBtn = document.getElementById('searchPrereqBtn');
    const courseInput = document.getElementById('prereqCourseInput');
    const allLevelsCheckbox = document.getElementById('showAllLevelsCheckbox');
    
    if (searchBtn && courseInput && allLevelsCheckbox) {
        searchBtn.addEventListener('click', () => {
            const course = courseInput.value.trim();
            if (course) {
                const allLevels = allLevelsCheckbox.checked;
                loadPrerequisiteTree(course, allLevels);
            }
        });
        
        // Also trigger search on Enter key
        courseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const course = courseInput.value.trim();
                if (course) {
                    const allLevels = allLevelsCheckbox.checked;
                    loadPrerequisiteTree(course, allLevels);
                }
            }
        });
    }
}

// Function to load and display the prerequisite tree
function loadPrerequisiteTree(courseCode, allLevels = false) {
    // Show loading indicator
    const container = document.querySelector('.prereq-tree-container');
    if (container) {
        container.innerHTML = '<div class="loading">Loading prerequisite data...</div>';
    }
    
    // Fetch data and render tree
    fetchPrerequisiteGraph(courseCode, allLevels)
        .then(data => {
            renderPrerequisiteTree(data, 'prereqTreeContainer');
        });
}

// Add event listeners for the prerequisite tree tab
function initializePrereqTreeTab() {
    const prereqTreeTab = document.querySelector('.prereq-tree-tab');
    const coursesTab = document.querySelector('.courses-tab');
    const recurringEventsTab = document.querySelector('.recurring-events-tab');
    
    const coursesView = document.querySelector('.courses-view');
    const recurringEventsView = document.querySelector('.recurring-events-view');
    const prereqTreeView = document.querySelector('.prereq-tree-view');
    
    if (prereqTreeTab && coursesTab && recurringEventsTab && 
        coursesView && recurringEventsView && prereqTreeView) {
        
    prereqTreeTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active tab
            coursesTab.classList.remove('active');
            recurringEventsTab.classList.remove('active');
        prereqTreeTab.classList.add('active');
            
            // Show/hide views
            coursesView.style.display = 'none';
            recurringEventsView.style.display = 'none';
            prereqTreeView.style.display = 'block';
        });
        
        // Add click handlers for other tabs to ensure they hide the prereq tree view
    coursesTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active tab
        coursesTab.classList.add('active');
            recurringEventsTab.classList.remove('active');
        prereqTreeTab.classList.remove('active');
            
            // Show/hide views
            coursesView.style.display = 'block';
            recurringEventsView.style.display = 'none';
            prereqTreeView.style.display = 'none';
        });
        
        recurringEventsTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active tab
        coursesTab.classList.remove('active');
            recurringEventsTab.classList.add('active');
        prereqTreeTab.classList.remove('active');
        
            // Show/hide views
            coursesView.style.display = 'none';
            recurringEventsView.style.display = 'block';
            prereqTreeView.style.display = 'none';
        });
    }
}

// Function to export schedule to Google Calendar
function exportToGoogleCalendar() {
    // Show loading indicator or notification
    alert('Exporting to Google Calendar...');
    
    // Collect schedule data to send to the server
    const scheduleData = collectScheduleData();
    
    // Check if we have courses to export
    if (!scheduleData.courses || scheduleData.courses.length === 0) {
        alert('No courses found to export. Please add courses to your schedule first.');
        return;
    }
    
    console.log('Exporting schedule data:', scheduleData);
    
    // Try server-side export first
    fetch('/export_bp/google-calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Export response:', data);
        
        // If the backend provides a URL for Google Calendar authorization, redirect to it
        if (data.authUrl) {
            window.location.href = data.authUrl;
            return;
        }
        
        // If there's no redirect URL but the export was successful
        if (data.success) {
            alert('Successfully exported to Google Calendar!');
            
            // If there's a calendar URL to view the result, offer to open it
            if (data.calendarUrl) {
                if (confirm('Your schedule has been exported. Would you like to view it in Google Calendar?')) {
                    window.open(data.calendarUrl, '_blank');
                }
            }
        } else if (data.error) {
            // Handle error response
            alert(`Error: ${data.error}`);
        } else {
            // Handle other success responses
            alert('Successfully exported to Google Calendar!');
        }
    })
    .catch(error => {
        console.error('Error exporting to Google Calendar via server:', error);
        
        // Use client-side export as fallback
        clientSideGoogleCalendarExport(scheduleData);
    });
}

// Client-side Google Calendar export (fallback when server is unavailable)
function clientSideGoogleCalendarExport(scheduleData) {
    try {
        // Create ICS file content
        const icsContent = generateICSContent(scheduleData);
        
        // Create a Blob with the ICS content
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        
        // Create a download link for the ICS file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'schedule.ics';
        
        // Append the link to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Calendar file has been downloaded. You can import this file into Google Calendar.');
        
        // Offer to open Google Calendar import page
        if (confirm('Would you like to open Google Calendar to import the file?')) {
            window.open('https://calendar.google.com/calendar/r/settings/export', '_blank');
        }
    } catch (error) {
        console.error('Error with client-side export:', error);
        alert('Unable to export to Google Calendar. Please try again later.');
    }
}

// Generate ICS file content from schedule data
function generateICSContent(scheduleData) {
    // ICS file header
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SmartEnroll//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';
    
    // Get semester information
    const semester = scheduleData.semester || 'Fall 2024';
    const year = semester.includes('2024') ? '2024' : 
                 semester.includes('2025') ? '2025' : 
                 new Date().getFullYear();
    
    // Determine the start month based on the semester
    let startMonth = '01'; // Default to January
    if (semester.includes('Spring')) {
        startMonth = '01'; // January for Spring semester
    } else if (semester.includes('Summer')) {
        startMonth = '05'; // May for Summer semester
    } else if (semester.includes('Fall')) {
        startMonth = '08'; // August for Fall semester
    }
    
    // Create a start date (first day of the semester)
    const semesterStart = `${year}${startMonth}01`;
    
    // Map of days
    const dayMap = {
        'M': 'MO',
        'T': 'TU',
        'W': 'WE',
        'R': 'TH',
        'F': 'FR'
    };
    
    // Add each course as an event
    scheduleData.courses.forEach(course => {
        // Skip if missing essential data
        if (!course.day || !course.startTime || !course.endTime) return;
        
        // Format times (convert from "10:00 AM" to "100000")
        let startTime = course.startTime.replace(/[^0-9]/g, '');
        if (startTime.length <= 2) startTime = startTime + '0000';
        else if (startTime.length <= 4) startTime = startTime + '00';
        if (course.startTime.includes('PM') && !course.startTime.includes('12:')) {
            startTime = (parseInt(startTime.substring(0, 2)) + 12) + startTime.substring(2);
        }
        
        let endTime = course.endTime.replace(/[^0-9]/g, '');
        if (endTime.length <= 2) endTime = endTime + '0000';
        else if (endTime.length <= 4) endTime = endTime + '00';
        if (course.endTime.includes('PM') && !course.endTime.includes('12:')) {
            endTime = (parseInt(endTime.substring(0, 2)) + 12) + endTime.substring(2);
        }
        
        // Ensure times are 6 digits
        while (startTime.length < 6) startTime = startTime + '0';
        while (endTime.length < 6) endTime = endTime + '0';
        
        // Create a unique ID for the event
        const eventId = `course-${course.name.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
        
        // Create the event
        icsContent += 'BEGIN:VEVENT\r\n';
        icsContent += `UID:${eventId}\r\n`;
        icsContent += `SUMMARY:${course.name}\r\n`;
        icsContent += `DESCRIPTION:Instructor: ${course.instructor || 'TBA'}\r\n`;
        icsContent += `LOCATION:Gonzaga University\r\n`;
        icsContent += `DTSTART:${semesterStart}T${startTime}Z\r\n`;
        icsContent += `DTEND:${semesterStart}T${endTime}Z\r\n`;
        
        // Add recurrence rule (weekly on the specified day)
        if (dayMap[course.day]) {
            icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[course.day]};UNTIL=${year}1215T000000Z\r\n`;
        }
        
        icsContent += 'END:VEVENT\r\n';
    });
    
    // Close the calendar
    icsContent += 'END:VCALENDAR\r\n';
    
    return icsContent;
}

// Helper function to collect schedule data from the UI
function collectScheduleData() {
    // Get the current semester
    const semesterButton = document.querySelector('.semester-button');
    const currentSemester = semesterButton ? semesterButton.textContent.trim().split(' ')[0] + ' ' + semesterButton.textContent.trim().split(' ')[1] : 'Fall 2024';
    
    // Get all course blocks from the schedule
    const courseBlocks = document.querySelectorAll('.course-block');
    const courses = [];
    
    courseBlocks.forEach(block => {
        // Extract course information
        const courseName = block.querySelector('.course-name') ? block.querySelector('.course-name').textContent : '';
        const courseTime = block.querySelector('.course-time') ? block.querySelector('.course-time').textContent : '';
        const courseInstructor = block.querySelector('.course-instructor') ? block.querySelector('.course-instructor').textContent : '';
        
        // Find which day this course is on by checking its parent cell
        const cell = block.closest('td');
        const row = cell ? cell.closest('tr') : null;
        
        if (cell && row) {
            const dayIndex = Array.from(row.cells).indexOf(cell);
            const days = ['', 'M', 'T', 'W', 'R', 'F'];
            const day = dayIndex > 0 && dayIndex < days.length ? days[dayIndex] : '';
            
            // Get the time from the first cell in the row
            const timeCell = row.cells[0];
            const time = timeCell ? timeCell.textContent : '';
            
            // Parse time information
            let startTime = '';
            let endTime = '';
            if (courseTime) {
                const timeParts = courseTime.split(' - ');
                if (timeParts.length === 2) {
                    startTime = timeParts[0];
                    endTime = timeParts[1];
                }
            }
            
            courses.push({
                name: courseName,
                day: day,
                startTime: startTime,
                endTime: endTime,
                instructor: courseInstructor
            });
        }
    });
    
    // If no courses were found in the UI, create a sample course for testing
    if (courses.length === 0) {
        console.warn('No courses found in the UI, creating a sample course for testing');
        courses.push({
            name: 'Sample Course',
            day: 'M',
            startTime: '10:00 AM',
            endTime: '11:15 AM',
            instructor: 'Sample Instructor'
        });
    }
    
    return {
        semester: currentSemester,
        courses: courses
    };
}

// Function to handle adding a course
function addCourse() {
    console.log('Add Course button clicked');
    
    // Get form values
    const subject = document.querySelector('.sidebar input[placeholder="Subject"]').value;
    const courseCode = document.querySelector('.sidebar input[placeholder="Course code"]').value;
    const instructor = document.querySelector('.sidebar input[placeholder="Instructor"]').value;
    
    console.log('Form values:', { subject, courseCode, instructor });
    
    // Check if at least subject or course code is provided
    if (!subject && !courseCode) {
        alert('Please enter at least a subject or course code');
            return;
        }
        
    // Show loading state
    showLoadingState();
    
    // Try to fetch real section data from API
    checkCourseApiAvailability()
        .then(apiAvailable => {
            if (apiAvailable) {
                console.log('Course API is available, fetching real data');
                // Logic to fetch real data would go here
                // For now, we'll still use sample data
                setTimeout(() => {
                    hideLoadingState();
                    showSectionsSidebar(subject, courseCode);
                }, 500);
            } else {
                console.log('Course API is not available, using sample data');
                // Use sample data after a short delay to simulate loading
                setTimeout(() => {
                    hideLoadingState();
                    showSectionsSidebar(subject, courseCode);
                }, 500);
            }
        })
        .catch(error => {
            console.error('Error checking API availability:', error);
            hideLoadingState();
            showSectionsSidebar(subject, courseCode);
        });
}

// Function to show sections sidebar
function showSectionsSidebar(subject, courseCode) {
    console.log('Showing sections sidebar for:', subject, courseCode);
    
    // Remove existing sections sidebar if it exists
    const existingSidebar = document.querySelector('.sections-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }
    
    // Create new sections sidebar
    const sectionsSidebar = document.createElement('div');
    sectionsSidebar.className = 'sections-sidebar';
    
    // Generate course title
    const courseTitle = subject + (courseCode ? ' ' + courseCode : '');
    
    // Generate sample sections data
    const sections = generateSampleSections(courseTitle);
    
    // Create sidebar content
    sectionsSidebar.innerHTML = `
        <div class="sections-header">
            <h3>${courseTitle} Sections</h3>
            <div class="sections-controls">
                <select class="sections-sort">
                    <option value="section">Sort by Section</option>
                    <option value="instructor">Sort by Instructor</option>
                    <option value="time">Sort by Time</option>
                </select>
                <button class="reset-sections-btn">Reset</button>
            </div>
        </div>
        <div class="sections-list">
            ${sections.map(section => `
                <div class="section-item" data-section-id="${section.id}">
                    <div class="section-number">${section.sectionNumber}</div>
                    <div class="section-details">
                        <div>${section.instructor}</div>
                        <div>${section.days.join(', ')} ${section.startTime} - ${section.endTime}</div>
                    </div>
                    <div class="section-day-blocks">
                        ${section.days.map(day => `
                            <div class="section-day-block" style="background-color: ${section.color}"></div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add to main container
    const emptySpace = document.querySelector('.empty-space');
    if (emptySpace) {
        emptySpace.parentNode.replaceChild(sectionsSidebar, emptySpace);
    } else {
        document.querySelector('main').appendChild(sectionsSidebar);
    }
    
    console.log('Sections sidebar added to DOM');
    
    // Add event listeners
    addSectionsSidebarEventListeners(sectionsSidebar, sections);
}

// Initialize course data when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Add Course button event listener
    const addCourseBtn = document.querySelector('.add-course-btn');
    if (addCourseBtn) {
        console.log('Add Course button found, attaching event listener');
        
        // Remove any existing event listeners by cloning the node
        const newAddCourseBtn = addCourseBtn.cloneNode(true);
        addCourseBtn.parentNode.replaceChild(newAddCourseBtn, addCourseBtn);
        
        // Add the event listener to the new button
        newAddCourseBtn.addEventListener('click', function(e) {
            console.log('Add Course button clicked (from event listener)');
            e.preventDefault();
            addCourse();
        });
    } else {
        console.error('Add Course button not found');
    }
    
    // ... rest of your initialization code ...
});

// Function to check if course API is available
function checkCourseApiAvailability() {
    console.log('Checking course API availability');
    
    return fetch('/course_bp/courses')
        .then(response => {
            const isAvailable = response.ok;
            console.log('Course API available:', isAvailable);
            return isAvailable;
        })
        .catch(error => {
            console.warn('Course API check failed:', error);
            return false;
        });
}

// Course API Functions
function fetchCourses() {
    return fetch('/course_bp/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch courses');
            }
        });
}

function fetchSections(courseId) {
    showLoadingState();
    
    // Log the request
    console.log(`Fetching sections for course ID: ${courseId}`);
    
    // Make the API call to get sections
    fetch(`/course_bp/sections/${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Sections data received:", data);
            
            if (data && Array.isArray(data.sections) && data.sections.length > 0) {
                // Process and display the sections
                showSectionsSidebarWithRealData(data.subject, data.course_code, data.sections);
            } else {
                console.warn("No sections found or invalid data format. Using sample data.");
                // Fall back to sample data if no sections are found
                const sampleSections = generateSampleSections(`${data.subject} ${data.course_code}`);
                showSectionsSidebar(data.subject, data.course_code, sampleSections);
            }
            
            hideLoadingState();
        })
        .catch(error => {
            console.error("Error fetching sections:", error);
            
            // Extract course info from the courseId
            let subject, courseCode;
            if (courseId.includes('-')) {
                [subject, courseCode] = courseId.split('-');
            } else {
                // Try to extract subject and code based on common patterns
                const match = courseId.match(/([A-Z]+)(\d+)/);
                if (match) {
                    subject = match[1];
                    courseCode = match[2];
                } else {
                    subject = "UNKNOWN";
                    courseCode = courseId;
                }
            }
            
            // Fall back to sample data
            const sampleSections = generateSampleSections(`${subject} ${courseCode}`);
            showSectionsSidebar(subject, courseCode, sampleSections);
            
            hideLoadingState();
        });
}

function fetchProfessors() {
    return fetch('/course_bp/professors')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch professors');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch professors');
            }
        });
}

// Function to show loading state
function showLoadingState() {
    console.log('Showing loading state');
    // Create and show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = 'Loading...';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.padding = '10px 20px';
    loadingIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '1000';
    
    document.body.appendChild(loadingIndicator);
}

// Function to hide loading state
function hideLoadingState() {
    console.log('Hiding loading state');
    // Remove loading indicator
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Function to add event listeners to sections sidebar
function addSectionsSidebarEventListeners(sidebar, sections) {
    console.log("Adding event listeners to sections sidebar");
    
    // Add click event listeners to section items
    const sectionItems = sidebar.querySelectorAll('.section-item');
    sectionItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            const section = sections.find(s => s.id === sectionId);
            
            if (section) {
                console.log("Section selected:", section);
                
                // Toggle selected class
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    // Remove from schedule
                    const courseBlock = document.querySelector(`.course-block[data-section-id="${section.id}"]`);
                    if (courseBlock) {
                        courseBlock.remove();
                    }
                    // Update credits
                    updateCredits(-3); // Assuming 3 credits per course
                } else {
                    // Deselect any other sections from the same course
                    const sameCourseItems = sidebar.querySelectorAll('.section-item.selected');
                    sameCourseItems.forEach(sameCourseItem => {
                        const sameSectionId = parseInt(sameCourseItem.getAttribute('data-section-id'));
                        const sameSection = sections.find(s => s.id === sameSectionId);
                        
                        // Check if it's the same course but different section
                        if (sameSection && sameSection.title === section.title && sameSection.id !== section.id) {
                            sameCourseItem.classList.remove('selected');
                            // Remove from schedule
                            const courseBlock = document.querySelector(`.course-block[data-section-id="${sameSection.id}"]`);
                            if (courseBlock) {
                                courseBlock.remove();
                            }
                            // Update credits (will be added back with the new section)
                            updateCredits(-3);
                        }
                    });
                    
                    this.classList.add('selected');
                    addSectionToSchedule(section);
                }
            }
        });
    });
    
    // Add sort functionality
    const sortSelect = sidebar.querySelector('.sections-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            console.log("Sorting sections by:", sortValue);
            
            const sectionsList = sidebar.querySelector('.sections-list');
            const sectionItems = Array.from(sectionsList.querySelectorAll('.section-item'));
            
            // Sort the sections based on the selected criteria
            sectionItems.sort((a, b) => {
                const sectionIdA = parseInt(a.getAttribute('data-section-id'));
                const sectionIdB = parseInt(b.getAttribute('data-section-id'));
                const sectionA = sections.find(s => s.id === sectionIdA);
                const sectionB = sections.find(s => s.id === sectionIdB);
                
                if (!sectionA || !sectionB) return 0;
                
                switch (sortValue) {
                    case 'section':
                        return sectionA.sectionNumber.localeCompare(sectionB.sectionNumber);
                    case 'instructor':
                        return sectionA.instructor.localeCompare(sectionB.instructor);
                    case 'time':
                        // Compare days first
                        const dayCompare = sectionA.days[0].localeCompare(sectionB.days[0]);
                        if (dayCompare !== 0) return dayCompare;
                        
                        // Then compare times
                        return sectionA.startTime.localeCompare(sectionB.startTime);
                    default:
                        return 0;
                }
            });
            
            // Reorder the items in the DOM
            sectionItems.forEach(item => {
                sectionsList.appendChild(item);
            });
        });
    }
    
    // Add reset button functionality
    const resetButton = sidebar.querySelector('.reset-sections-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            console.log("Resetting sections");
            
            // Deselect all sections
            const selectedSections = sidebar.querySelectorAll('.section-item.selected');
            selectedSections.forEach(item => {
                item.classList.remove('selected');
            });
            
            // Remove all course blocks for this course
            const sectionIds = sections.map(s => s.id);
            sectionIds.forEach(id => {
                const courseBlock = document.querySelector(`.course-block[data-section-id="${id}"]`);
                if (courseBlock) {
                    courseBlock.remove();
                }
            });
            
            // Reset credits (assuming all sections were 3 credits)
            const selectedCount = selectedSections.length;
            if (selectedCount > 0) {
                updateCredits(-3 * selectedCount);
            }
        });
    }
}

// Function to add a section to the schedule
function addSectionToSchedule(section) {
    // Check if we have a valid section object
    if (!section) {
        console.error("Invalid section data provided");
        return;
    }
    
    console.log("Adding section to schedule:", section); // Debug log to see what data we're working with
    
    // Extract section details
    const sectionId = section.id || section.section_id || `${section.subject}${section.courseCode}-${section.section}`;
    const courseTitle = section.title || section.course_title || "Unknown Course";
    const sectionNumber = section.section || section.section_number || "Unknown Section";
    const instructor = section.instructor || section.professor || "TBA";
    const location = section.location || section.room || "TBA";
    
    // Extract meeting times - ensure we're using the database values
    const meetingDays = section.days || section.meeting_days || [];
    const startTime = section.start_time || section.startTime || "12:00";
    const endTime = section.end_time || section.endTime || "13:00";
    
    // Convert time strings to schedule grid positions
    const startHour = convertTimeToHour(startTime);
    const endHour = convertTimeToHour(endTime);
    const duration = endHour - startHour;
    
    // Generate a consistent color based on the course code
    const courseCode = section.course_code || section.courseCode || "UNKNOWN";
    const color = generateCourseColor(courseCode);
    
    console.log(`Section ${sectionId} meets on days: ${meetingDays}, from ${startTime} to ${endTime}`);
    console.log(`Instructor: ${instructor}, Location: ${location}`);
    
    // Add the course block to each meeting day
    meetingDays.forEach(day => {
        const dayIndex = getDayIndex(day);
        if (dayIndex === -1) {
            console.warn(`Invalid day format: ${day}`);
        return;
    }
    
        // Create the course block element
        const courseBlock = document.createElement('div');
        courseBlock.className = 'course-block';
        courseBlock.style.backgroundColor = color;
        courseBlock.style.height = `${duration * 60}px`; // Each hour is 60px
        courseBlock.style.top = `${(startHour - 8) * 60}px`; // Offset by 8 (8am is the first row)
        courseBlock.style.width = '100%';
        courseBlock.style.left = '0';
        
        // Set the content of the course block
        courseBlock.innerHTML = `
            <div class="section-title">${courseCode} ${sectionNumber}</div>
            <div class="section-instructor">${instructor}</div>
            <div class="section-location">${location}</div>
            <div class="section-time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
        `;
        
        // Store the section data for reference
        courseBlock.dataset.sectionId = sectionId;
        courseBlock.dataset.courseCode = courseCode;
        courseBlock.dataset.sectionNumber = sectionNumber;
        courseBlock.dataset.instructor = instructor;
        courseBlock.dataset.location = location;
        courseBlock.dataset.startTime = startTime;
        courseBlock.dataset.endTime = endTime;
        courseBlock.dataset.day = day;
        
        // Add the course block to the schedule
        const cell = document.querySelector(`.schedule-grid tr:nth-child(${startHour - 7}) td:nth-child(${dayIndex + 2})`);
        if (cell) {
            cell.appendChild(courseBlock);
            addEventBlockListeners(courseBlock);
        } else {
            console.error(`Could not find cell for day ${day} at time ${startTime}`);
        }
    });
    
    // Update the credits display
    const credits = section.credits || 3; // Default to 3 if not specified
    updateCredits(credits);
    
    // Log success
    console.log(`Added ${courseCode} ${sectionNumber} to schedule`);
}

// Helper function to convert time string to hour number (e.g., "13:30" -> 13.5)
function convertTimeToHour(timeString) {
    // Handle different time formats
    let hours, minutes;
    
    if (timeString.includes(':')) {
        // Format: "13:30"
        [hours, minutes] = timeString.split(':').map(Number);
    } else if (timeString.includes('am') || timeString.includes('pm')) {
        // Format: "1:30pm"
        const isPM = timeString.toLowerCase().includes('pm');
        const timePart = timeString.toLowerCase().replace('am', '').replace('pm', '');
        [hours, minutes] = timePart.split(':').map(Number);
        
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
    } else {
        // Try to parse as a number
        return parseFloat(timeString) || 8; // Default to 8am if parsing fails
    }
    
    return hours + (minutes / 60);
}

// Helper function to get the day index (0 = Monday, 4 = Friday)
function getDayIndex(day) {
    // Handle different day formats
    day = day.toUpperCase();
    
    // Single letter format (M, T, W, R, F)
    if (day === 'M') return 0;
    if (day === 'T') return 1;
    if (day === 'W') return 2;
    if (day === 'R' || day === 'TH') return 3;
    if (day === 'F') return 4;
    
    // Full name format
    if (day === 'MONDAY') return 0;
    if (day === 'TUESDAY') return 1;
    if (day === 'WEDNESDAY') return 2;
    if (day === 'THURSDAY') return 3;
    if (day === 'FRIDAY') return 4;
    
    return -1; // Invalid day
}

// Helper function to format time for display
function formatTime(timeString) {
    // Try to parse and format the time consistently
    try {
        let hours, minutes, period;
        
        if (timeString.includes(':')) {
            // Format: "13:30"
            [hours, minutes] = timeString.split(':').map(Number);
            period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert to 12-hour format
        } else if (timeString.includes('am') || timeString.includes('pm')) {
            // Format: "1:30pm"
            period = timeString.toLowerCase().includes('pm') ? 'PM' : 'AM';
            const timePart = timeString.toLowerCase().replace('am', '').replace('pm', '');
            [hours, minutes] = timePart.split(':').map(Number);
        } else {
            // Try to parse as a number (hour)
            hours = parseInt(timeString);
            minutes = 0;
            period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert to 12-hour format
        }
        
        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
        console.error("Error formatting time:", e);
        return timeString; // Return original if parsing fails
    }
}

// Generate a consistent color based on course code
function generateCourseColor(courseCode) {
    // Extract the subject code (e.g., "CPSC" from "CPSC 321")
    const subject = courseCode.split(' ')[0] || courseCode;
    
    // Predefined colors for common subjects
    const subjectColors = {
        'CPSC': '#4285F4', // Blue for Computer Science
        'MATH': '#0F9D58', // Green for Math
        'ENGL': '#DB4437', // Red for English
        'HIST': '#F4B400', // Yellow for History
        'PHIL': '#673AB7', // Purple for Philosophy
        'CHEM': '#00ACC1', // Cyan for Chemistry
        'PHYS': '#FF7043', // Orange for Physics
        'BIOL': '#43A047', // Dark green for Biology
        'BUSN': '#795548', // Brown for Business
        'ECON': '#9E9E9E', // Grey for Economics
        'PSYC': '#E91E63', // Pink for Psychology
        'SOCI': '#3F51B5', // Indigo for Sociology
        'POLS': '#607D8B', // Blue Grey for Political Science
        'COMM': '#FF5722', // Deep Orange for Communication
        'RELI': '#8BC34A'  // Light Green for Religious Studies
    };
    
    // Return the color for the subject if it exists, otherwise generate one
    if (subjectColors[subject]) {
        return subjectColors[subject];
    }
    
    // Generate a color based on the hash of the subject
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
}

// Function to clear the schedule
function clearSchedule() {
    // Remove all course blocks
    const courseBlocks = document.querySelectorAll('.course-block');
    courseBlocks.forEach(block => {
        block.remove();
    });
    
    // Reset credits
    const creditsBox = document.querySelector('.credits-box');
    if (creditsBox) {
        creditsBox.textContent = '0 Credits';
    }
}

// Function to update credits display
function updateCredits(credits) {
    console.log('Updating credits by:', credits);
    
    const creditsBox = document.querySelector('.credits-box');
    if (creditsBox) {
        const currentCredits = parseInt(creditsBox.textContent.split(' ')[0]) || 0;
        const newCredits = currentCredits + credits;
        creditsBox.textContent = `${newCredits} Credits`;
    }
}

// Function to generate sample sections data
function generateSampleSections(courseTitle) {
    console.log('Generating sample sections for:', courseTitle);
    
    const colors = [
        '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', 
        '#B5EAD7', '#C7CEEA', '#F8B195', '#F67280'
    ];
    
    const numSections = Math.floor(Math.random() * 3) + 4; // 4-6 sections
    console.log('Generating', numSections, 'sections');
    
    const sections = [];
    const weekdays = ['M', 'T', 'W', 'R', 'F'];
    const instructors = [
        'Dr. Smith', 'Dr. Johnson', 'Prof. Williams', 
        'Prof. Brown', 'Dr. Jones', 'Prof. Miller'
    ];
    
    for (let i = 0; i < numSections; i++) {
        // Random days (1-3 days)
        const numDays = Math.floor(Math.random() * 3) + 1;
        const shuffledDays = [...weekdays].sort(() => 0.5 - Math.random());
        const days = shuffledDays.slice(0, numDays);
        
        // Random times
        const startHour = Math.floor(Math.random() * 8) + 8; // 8 AM - 3 PM
        const duration = Math.floor(Math.random() * 2) + 1; // 1-2 hours
        const endHour = startHour + duration;
        
        const startTime = `${startHour}:00 ${startHour >= 12 ? 'PM' : 'AM'}`;
        const endTime = `${endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`;
        
        // Random instructor and section number
        const instructor = instructors[Math.floor(Math.random() * instructors.length)];
        const sectionNumber = Math.floor(Math.random() * 10) + 1;
        
        sections.push({
            id: i + 1,
            title: courseTitle,
            sectionNumber: `Section ${sectionNumber.toString().padStart(2, '0')}`,
            days: days,
            startTime: startTime,
            endTime: endTime,
            instructor: instructor,
            color: colors[i % colors.length]
        });
    }
    
    console.log('Generated sections:', sections);
    return sections;
}

// Add CSS styles for course blocks if they don't exist
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Add CSS for course blocks if not already present
    if (!document.getElementById('course-block-styles')) {
        const style = document.createElement('style');
        style.id = 'course-block-styles';
        style.textContent = `
            .course-block {
                position: absolute;
                border-radius: 4px;
                padding: 5px;
                box-sizing: border-box;
                overflow: hidden;
                color: #fff;
                text-shadow: 0 0 2px rgba(0,0,0,0.7);
                font-size: 12px;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: transform 0.1s ease;
            }
            
            .course-block:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            .section-title {
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .schedule-grid {
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }
});

// Add function to check if the section API is available
function checkSectionApiAvailability() {
    console.log("Checking section API availability");
    
    return fetch('/section_bp/search?subject=CPSC')
        .then(response => {
            const isAvailable = response.ok;
            console.log("Section API available:", isAvailable);
            return isAvailable;
        })
        .catch(error => {
            console.warn("Section API check failed:", error);
            return false;
        });
}

// Add function to search sections using the backend API
function searchSections(params = {}) {
    console.log("Searching sections with params:", params);
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.course_code) queryParams.append('course_code', params.course_code);
    if (params.attribute) queryParams.append('attribute', params.attribute);
    if (params.instructor) queryParams.append('instructor', params.instructor);
    
    const url = `/section_bp/search?${queryParams.toString()}`;
    console.log("Fetching sections from:", url);
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Section API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Sections data received:", data);
            return data;
        })
        .catch(error => {
            console.error("Error fetching sections:", error);
            return { data: [] }; // Return empty data on error
        });
}

// Modify the addCourse function to use the section API
function addCourse() {
    console.log("Add Course button clicked");
    
    // Get form values
    const subject = document.querySelector('.sidebar input[placeholder="Subject"]').value;
    const courseCode = document.querySelector('.sidebar input[placeholder="Course code"]').value;
    const instructor = document.querySelector('.sidebar input[placeholder="Instructor"]').value;
    const attribute = document.querySelector('.sidebar input[placeholder="Attributes"]').value;
    
    console.log("Form values:", { subject, courseCode, instructor, attribute });
    
    // Validate input - at least subject or course code should be provided
    if (!subject && !courseCode) {
        alert("Please enter at least a subject or course code");
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Check if section API is available
    checkSectionApiAvailability()
        .then(apiAvailable => {
            if (apiAvailable) {
                console.log("Section API is available, fetching real data");
                
                // Prepare search parameters
                const searchParams = {
                    subject: subject,
                    course_code: courseCode,
                    instructor: instructor || undefined,
                    attribute: attribute || undefined
                };
                
                // Search for sections using the API
                return searchSections(searchParams)
                    .then(result => {
                        hideLoadingState();
                        
                        if (result.data && result.data.length > 0) {
                            // Show sections sidebar with real data
                            showSectionsSidebarWithRealData(subject, courseCode, result.data);
                        } else {
                            console.log("No sections found, using sample data");
                            showSectionsSidebar(subject, courseCode);
                        }
                    });
            } else {
                console.log("Section API is not available, using sample data");
                // Use sample data after a short delay to simulate loading
                setTimeout(() => {
                    hideLoadingState();
                    showSectionsSidebar(subject, courseCode);
                }, 500);
            }
        })
        .catch(error => {
            console.error("Error checking API availability:", error);
            hideLoadingState();
            showSectionsSidebar(subject, courseCode);
        });
}

// Add function to display sections sidebar with real data from the API
function showSectionsSidebarWithRealData(subject, courseCode, sectionsData) {
    console.log("Showing sections sidebar with real data:", sectionsData);
    
    // Create the sidebar element
    const sidebar = document.createElement('div');
    sidebar.className = 'sections-sidebar';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'sections-header';
    header.innerHTML = `
        <h3>${subject} ${courseCode}</h3>
        <button class="close-btn">&times;</button>
    `;
    
    // Create the controls
    const controls = document.createElement('div');
    controls.className = 'sections-controls';
    controls.innerHTML = `
        <select class="sections-sort">
            <option value="section">Sort by Section</option>
            <option value="instructor">Sort by Instructor</option>
            <option value="time">Sort by Time</option>
        </select>
        <button class="reset-sections-btn">Reset</button>
    `;
    
    // Create the search box
    const search = document.createElement('div');
    search.className = 'sections-search';
    search.innerHTML = `
        <input type="text" placeholder="Search sections...">
    `;
    
    // Create the sections list
    const sectionsList = document.createElement('div');
    sectionsList.className = 'sections-list';
    
    // Process and add each section
    sectionsData.forEach(section => {
        // Create a section item
        const sectionItem = document.createElement('div');
        sectionItem.className = 'section-item';
        sectionItem.dataset.sectionId = section.id || `${subject}${courseCode}-${section.section_number}`;
        
        // Format meeting days for display
        let meetingDays = [];
        if (section.meeting_days && Array.isArray(section.meeting_days)) {
            meetingDays = section.meeting_days;
        } else if (section.meeting_days && typeof section.meeting_days === 'string') {
            // Handle string format (e.g., "MWF" or "M,W,F")
            if (section.meeting_days.includes(',')) {
                meetingDays = section.meeting_days.split(',').map(d => d.trim());
            } else {
                // Split string into individual characters (e.g., "MWF" -> ["M", "W", "F"])
                meetingDays = section.meeting_days.split('');
            }
        }
        
        // Format meeting days for display
        const formattedDays = meetingDays.map(day => {
            if (day === 'M') return 'Mon';
            if (day === 'T') return 'Tue';
            if (day === 'W') return 'Wed';
            if (day === 'R' || day === 'TH') return 'Thu';
            if (day === 'F') return 'Fri';
            return day;
        }).join(', ');
        
        // Format times for display
        const startTime = section.start_time || '12:00';
        const endTime = section.end_time || '13:00';
        
        // Create section HTML
        sectionItem.innerHTML = `
            <div class="section-number">
                <span>Section ${section.section_number || 'Unknown'}</span>
                <span>${section.credits || 3} cr</span>
            </div>
                    <div class="section-details">
                <div>${section.instructor || 'TBA'}</div>
                <div>${formattedDays} ${startTime}-${endTime}</div>
                <div>${section.location || 'TBA'}</div>
                    </div>
                    <div class="section-day-blocks">
                ${meetingDays.map(day => `<span class="section-day-block">${day}</span>`).join('')}
        </div>
    `;
    
        // Store the section data for later use
        sectionItem.dataset.section = JSON.stringify({
            id: section.id || `${subject}${courseCode}-${section.section_number}`,
            subject: subject,
            courseCode: courseCode,
            course_code: `${subject} ${courseCode}`,
            section: section.section_number || 'Unknown',
            title: section.title || `${subject} ${courseCode}`,
            instructor: section.instructor || 'TBA',
            days: meetingDays,
            meeting_days: meetingDays,
            start_time: startTime,
            end_time: endTime,
            location: section.location || 'TBA',
            credits: section.credits || 3
        });
        
        sectionsList.appendChild(sectionItem);
    });
    
    // Assemble the sidebar
    sidebar.appendChild(header);
    sidebar.appendChild(controls);
    sidebar.appendChild(search);
    sidebar.appendChild(sectionsList);
    
    // Add the sidebar to the document
    document.body.appendChild(sidebar);
    
    // Add event listeners
    addSectionsSidebarEventListeners(sidebar, sectionsData);
}

// Update the API availability check script to include section API
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Check all APIs availability
    checkApiAvailability(); // Check prerequisite API
    checkCourseApiAvailability(); // Check course API
    checkSectionApiAvailability(); // Check section API
    
    // ... existing code ...
    
    // Initialize the Add Course button click event
    const addCourseBtn = document.querySelector('.add-course-btn');
    if (addCourseBtn) {
        console.log("Add Course button found, attaching event listener");
        
        // Remove any existing event listeners by cloning the node
        const newAddCourseBtn = addCourseBtn.cloneNode(true);
        addCourseBtn.parentNode.replaceChild(newAddCourseBtn, addCourseBtn);
        
        // Add the event listener to the new button
        newAddCourseBtn.addEventListener('click', function(e) {
            console.log("Add Course button clicked (from event listener)");
            e.preventDefault();
            addCourse();
        });
    } else {
        console.error("Add Course button not found");
    }
    
    // ... existing code ...
});

// Check if backend APIs are available
function checkApiAvailability() {
    fetch('/api/graph?course=CPSC321&all=false')
        .then(response => {
            if (!response.ok) {
                console.warn('Prerequisite API is not available. Using mock data instead.');
            } else {
                console.log('Prerequisite API is available.');
            }
        })
        .catch(error => console.warn('Prerequisite API is not available:', error));

    fetch('/export/apple-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => console.log('Export API available:', data))
    .catch(error => console.warn('Export API is not available:', error));

    fetch('/courses/courses')
        .then(response => response.json())
        .then(data => console.log('Courses:', data))
        .catch(error => console.warn('Course API is not available:', error));

    fetch('/sections/search?subject=CPSC')
        .then(response => response.json())
        .then(data => console.log('Sections:', data))
        .catch(error => console.warn('Section API is not available:', error));
}

// Setup event listeners for export buttons
function setupExportButtons() {
    document.querySelector('.export-ioscalendar').addEventListener('click', () => {
        exportToCalendar('/export/apple-calendar');
    });

    document.querySelector('.export-googlecalendar').addEventListener('click', () => {
        exportToCalendar('/export/google-calendar');
    });
}

// Function to export calendar data
function exportToCalendar(apiUrl) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => console.log('Export Success:', data))
    .catch(error => console.error('Export Failed:', error));
}

// Function to change semester selection
function changeSemester(semester, element) {
    const button = document.querySelector('.semester-button');
    button.innerHTML = semester + ' <span class="arrow">▼</span>';
}

// Toggle dark mode theme
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');

    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
}

// Add event listeners to theme toggle buttons
document.querySelectorAll('.theme-toggle').forEach(button => {
    button.addEventListener('click', toggleTheme);
});