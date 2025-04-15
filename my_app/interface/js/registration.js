function createRegistrationSidebar() {
    console.log('Creating registration sidebar...');
    
    // Create sidebar tabs if not present
    let sidebarTabs = document.querySelector('.sidebar-tabs');
    if (!sidebarTabs) {
        sidebarTabs = document.createElement('div');
        sidebarTabs.className = 'sidebar-tabs';
        
        // Add tab options with names matching the image
        const tabs = [
            { id: 'Courses', name: 'Courses' },
            { id: 'RecurringEvents', name: 'Events' },
            { id: 'PrereqSearch', name: 'PreReq' }
        ];
        
        tabs.forEach(tab => {
            const tabLink = document.createElement('a');
            tabLink.href = '#';
            tabLink.textContent = tab.name;
            tabLink.dataset.tab = tab.id;
            tabLink.addEventListener('click', function(e) {
                e.preventDefault();
                switchSidebarTab(tab.id);
            });
            sidebarTabs.appendChild(tabLink);
        });
        
        // Add the tabs to the sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.insertBefore(sidebarTabs, sidebar.firstChild);
        }
    }
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    // Clear existing content except the tabs
    const existingTabs = sidebar.querySelector('.sidebar-tabs');
    sidebar.innerHTML = '';
    if (existingTabs) {
        sidebar.appendChild(existingTabs);
    }
    
    // Create the Courses tab content to match the image
    const coursesTab = document.createElement('div');
    coursesTab.id = 'Courses';
    coursesTab.className = 'tab-content active';
    coursesTab.style.background = 'white';
    
    // Add course search form that matches the image
    coursesTab.innerHTML = `
        <div class="search-form" style="background: white; padding: 15px; border-radius: 8px;">
        <div class="form-group">
                <input type="text" id="subject-input" placeholder="Subject" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white;">
        </div>
            
        <div class="form-group">
                <input type="text" id="course-code-input" placeholder="Course code" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white;">
        </div>
        
            <div class="division-buttons" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button class="division-btn" id="lower-div-btn" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Lower Division</button>
                <button class="division-btn" id="upper-div-btn" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Upper Division</button>
        </div>
        
        <div class="form-group">
                <input type="text" id="attributes-input" placeholder="Attributes" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white; font-style: italic;">
        </div>
            
        <div class="form-group">
                <input type="text" id="instructor-input" placeholder="Instructor" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white; font-style: italic;">
        </div>
            
        <div class="form-group">
                <input type="text" id="campus-input" placeholder="Campus" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white; font-style: italic;">
        </div>
            
        <div class="form-group">
                <input type="text" id="methods-input" placeholder="Instructional Methods" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; background: white; font-style: italic;">
        </div>
        
            <button id="search-courses-btn" class="search-btn" style="width: 100%; padding: 12px; background: #142A50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; margin-top: 5px;">
                Search Courses
            </button>
        </div>
        
        <div id="sections-list" class="search-results" style="background: white;">
            <div class="no-results">
                Enter search criteria above and click "Search Courses"
            </div>
        </div>
    `;
    
    sidebar.appendChild(coursesTab);
    
    // Add backend status indicator
    addBackendStatusIndicator(coursesTab);
    
    // Add event listeners for buttons
    setTimeout(() => {
        // Add event listener for the search button
        const searchBtn = document.getElementById('search-courses-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                console.log('Search button clicked');
                fetchCourses();
            });
        }
        
        // Add event listeners for division buttons
        const lowerDivBtn = document.getElementById('lower-div-btn');
        const upperDivBtn = document.getElementById('upper-div-btn');
        
        if (lowerDivBtn) {
            lowerDivBtn.addEventListener('click', function() {
                toggleDivisionButton(this, upperDivBtn);
            });
        }
        
        if (upperDivBtn) {
            upperDivBtn.addEventListener('click', function() {
                toggleDivisionButton(this, lowerDivBtn);
            });
        }
        
        // Add event listeners for Enter key in input fields
        const inputFields = coursesTab.querySelectorAll('input[type="text"]');
        inputFields.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchBtn.click();
                }
            });
        });
    }, 100);
    
    // Create RecurringEvents tab content
    const eventsTab = document.createElement('div');
    eventsTab.id = 'RecurringEvents';
    eventsTab.className = 'tab-content';
    
    // Add recurring events form
    eventsTab.innerHTML = `
        <div class="recurring-events-view">
            <div class="form-group">
                <input type="text" placeholder="Event Name">
            </div>
            <div class="form-group">
                <div class="time-inputs">
                    <input type="time" placeholder="Start Time" class="time-input">
                    <input type="time" placeholder="End Time" class="time-input">
                </div>
            </div>
            <div class="form-group">
                <div class="day-selection">
                    <div class="weekday-buttons">
                        <button class="weekday-btn" data-day="M">M</button>
                        <button class="weekday-btn" data-day="T">T</button>
                        <button class="weekday-btn" data-day="W">W</button>
                        <button class="weekday-btn" data-day="R">R</button>
                        <button class="weekday-btn" data-day="F">F</button>
                    </div>
                </div>
            </div>
            <button class="add-event-btn">Add Event</button>
        </div>
    `;
    
    sidebar.appendChild(eventsTab);
    
    // Create PrereqSearch tab content
    const prereqTab = document.createElement('div');
    prereqTab.id = 'PrereqSearch';
    prereqTab.className = 'tab-content';
    
    // Add prerequisite search form
    prereqTab.innerHTML = `
        <div class="prereq-search">
            <div class="form-group">
                <input type="text" id="prereq-search-input" placeholder="Course Code (e.g., CPSC 121)">
            </div>
            <button id="search-prereq-btn" class="search-btn">Show Prerequisite Tree</button>
        </div>
        <div id="prereq-results"></div>
    `;
    
    sidebar.appendChild(prereqTab);
    
    // Activate the Courses tab by default
    switchSidebarTab('Courses');
    
    // Ensure the Registration tab is active in the navigation
    const registrationLink = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationLink) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        registrationLink.classList.add('active');
    }
    
    return true;
}

// Helper function to completely remove Finals content from the page
function removeAllFinalsContent() {
    // Remove any Finals elements still in the DOM
    const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
    finalsElements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    // Clear any Finals-related content from the main area
    const mainContent = document.querySelector('.main-content, main');
    if (mainContent) {
        const finalsInMain = mainContent.querySelector('#Finals');
        if (finalsInMain) {
            mainContent.removeChild(finalsInMain);
        }
    }
}

// Helper function to generate time rows for the schedule grid
function generateTimeRows() {
    let rows = '';
    for (let hour = 8; hour <= 21; hour++) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'pm' : 'am';
        rows += `
            <tr>
                <td class="time-column">${displayHour} ${ampm}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }
    return rows;
}

// Function to display sections in the UI
function displaySections(sections) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) return;
    
    if (!sections || sections.length === 0) {
        sectionsList.innerHTML = '<div class="no-results-message">No courses found matching your criteria</div>';
        return;
    }
    
    // Group sections by course
    const courseGroups = {};
    
    // Track unique sections to avoid duplicates
    const uniqueSectionIds = new Set();
    
    // Filter to keep only unique sections
    const uniqueSections = sections.filter(section => {
        // Create a unique identifier for each section
        const sectionId = `${section.subject}-${section.course_code}-${section.section_number}`;
        
        // If we've seen this section before, skip it
        if (uniqueSectionIds.has(sectionId)) {
            return false;
        }
        
        // Otherwise, add it to our set and keep it
        uniqueSectionIds.add(sectionId);
        return true;
    });
    
    // Group the unique sections by course
    uniqueSections.forEach(section => {
        const courseKey = `${section.subject}-${section.course_code}`;
        if (!courseGroups[courseKey]) {
            courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(section);
    });
    
    // Clear previous results
    sectionsList.innerHTML = '';
    
    // Display each course group
    Object.entries(courseGroups).forEach(([courseKey, courseSections]) => {
        const [subject, courseCode] = courseKey.split('-');
        
        // Create course container
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        
        // Create course header
        const courseHeader = document.createElement('div');
        courseHeader.className = 'course-header';
        courseHeader.innerHTML = `
            <h3>${subject} ${courseCode}</h3>
            <div class="section-count">${courseSections.length} section${courseSections.length !== 1 ? 's' : ''}</div>
        `;
        courseItem.appendChild(courseHeader);
        
        // Create sections list
        const sectionList = document.createElement('div');
        sectionList.className = 'section-list';
        
        // Add each section
        courseSections.forEach(section => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';
            
            sectionItem.innerHTML = `
                    <div class="section-header">
                        <h4>Section ${section.section_number}</h4>
                    </div>
                <p class="section-schedule"><strong>Schedule:</strong> ${section.schedule}</p>
                <p class="section-instructor"><strong>Instructor:</strong> ${section.instructor}</p>
                <p class="section-location"><strong>Location:</strong> ${section.location}</p>
                <p class="section-credits"><strong>Credits:</strong> ${section.credits}</p>
                    <div class="section-actions">
                        <button class="add-section-btn" 
                    onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')">
                            Add to Schedule
                        </button>
                        <button class="search-prereq-btn"
                    onclick="displayPrerequisiteTree('${section.subject}${section.course_code}')">
                            View Prerequisites
                        </button>
                </div>
            `;
            sectionList.appendChild(sectionItem);
        });
        
        courseItem.appendChild(sectionList);
        sectionsList.appendChild(courseItem);
    });
    
    // Store the data globally for reference in other functions
    window.sectionsData = uniqueSections;
}

// Helper function to determine availability class
function getAvailabilityClass(section) {
    const ratio = section.seats_available / section.total_seats;
    if (section.seats_available === 0) return 'full';
    if (ratio < 0.2) return 'limited';
    return 'available';
}

// Function to explicitly initialize registration view - call this on page load
function initializeRegistrationView() {
    console.log('Initializing Registration view directly');
    
    // Remove Finals tab completely from the DOM
    removeAllFinalsContent();
    
    // Create registration sidebar
    const result = createRegistrationSidebar();
    
    // If successful, ensure registration is visible
    if (result) {
        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'block';
            registrationView.classList.add('active');
        }
    }
    
    // Call our direct autocomplete implementation
    setTimeout(applyDirectAutocomplete, 500);
    
    // Ensure schedule grid is visible
    ensureScheduleGridVisible();
    
    return result;
}

// Export functions that might be used elsewhere
window.createRegistrationSidebar = createRegistrationSidebar;
window.displaySections = displaySections;
window.initializeRegistrationView = initializeRegistrationView;
window.removeAllFinalsContent = removeAllFinalsContent;

// Add this line to export createRegistrationSidebar as initializeRegistrationSidebar
window.initializeRegistrationSidebar = createRegistrationSidebar;

// Auto-initialize on script load with highest priority
document.addEventListener('DOMContentLoaded', function() {
    // Remove Finals content immediately
    setTimeout(removeAllFinalsContent, 0);
    
    // Initialize registration view next
    setTimeout(initializeRegistrationView, 10);
    
    // Do another check after a short delay
    setTimeout(removeAllFinalsContent, 100);
    
    // Set up autocomplete for search inputs
    setupSearchAutocomplete();
    
    // Ensure schedule grid is visible
    ensureScheduleGridVisible();
});

/**
 * Sets up autocomplete functionality for the search inputs
 */
function setupSearchAutocomplete() {
    console.log('Setting up autocomplete for search inputs');
    
    // First, make sure the inputs exist
    const subjectInput = document.querySelector('#subject-input');
    const courseCodeInput = document.querySelector('#course-code-input');
    const attributesInput = document.querySelector('#attributes-input');
    const instructorInput = document.querySelector('#instructor-input');
    const campusInput = document.querySelector('#campus-input');
    const methodsInput = document.querySelector('#methods-input');
    
    // Log the found inputs for debugging
    console.log('Found inputs:', {
        subject: subjectInput,
        courseCode: courseCodeInput,
        attributes: attributesInput,
        instructor: instructorInput,
        campus: campusInput,
        methods: methodsInput
    });
    
    // Common subjects for autocomplete
    const commonSubjects = [
        'ACCT', 'BIOL', 'BUSN', 'CHEM', 'COMM', 'CPSC', 
        'ECON', 'ENGL', 'HIST', 'MATH', 'PHIL', 'PHYS', 
        'POLS', 'PSYC', 'SOCI', 'SPAN', 'THEA'
    ];
    
    // Common course codes for autocomplete
    const commonCourseCodes = [
        '101', '102', '121', '122', '201', '202', 
        '211', '221', '223', '260', '301', '302', 
        '321', '322', '350', '401', '402', '421'
    ];
    
    // Common attributes for autocomplete
    const commonAttributes = [
        'Core Curriculum', 'Writing Intensive', 'Service Learning',
        'Global Studies', 'Social Justice', 'Fine Arts'
    ];
    
    // Common instructor names for autocomplete
    const commonInstructors = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 
        'Miller', 'Davis', 'Garcia', 'Wilson', 'Taylor',
        'Olivares', 'Anderson', 'Thomas', 'Jackson', 'White'
    ];
    
    // Common campus locations for autocomplete
    const commonCampuses = [
        'Main Campus', 'Downtown', 'Extension Center', 'Online'
    ];
    
    // Common instructional methods for autocomplete
    const commonMethods = [
        'In Person', 'Online', 'Hybrid', 'Field Study', 'Independent Study'
    ];
    
    // Setup autocomplete for each input
    if (subjectInput) {
        setupInputAutocomplete(subjectInput, commonSubjects);
    }
    
    if (courseCodeInput) {
        setupInputAutocomplete(courseCodeInput, commonCourseCodes);
    }
    
    if (attributesInput) {
        setupInputAutocomplete(attributesInput, commonAttributes);
    }
    
    if (instructorInput) {
        setupInputAutocomplete(instructorInput, commonInstructors);
    }
    
    if (campusInput) {
        setupInputAutocomplete(campusInput, commonCampuses);
    }
    
    if (methodsInput) {
        setupInputAutocomplete(methodsInput, commonMethods);
    }
    
    // Try again after a delay if any inputs weren't found
    setTimeout(() => {
        if (!subjectInput) {
            const delayedSubjectInput = document.querySelector('#subject-input');
            if (delayedSubjectInput) {
                setupInputAutocomplete(delayedSubjectInput, commonSubjects);
            }
        }
        
        if (!courseCodeInput) {
            const delayedCourseCodeInput = document.querySelector('#course-code-input');
            if (delayedCourseCodeInput) {
                setupInputAutocomplete(delayedCourseCodeInput, commonCourseCodes);
            }
        }
        
        if (!attributesInput) {
            const delayedAttributesInput = document.querySelector('#attributes-input');
            if (delayedAttributesInput) {
                setupInputAutocomplete(delayedAttributesInput, commonAttributes);
            }
        }
        
        if (!instructorInput) {
            const delayedInstructorInput = document.querySelector('#instructor-input');
            if (delayedInstructorInput) {
                setupInputAutocomplete(delayedInstructorInput, commonInstructors);
            }
        }
        
        if (!campusInput) {
            const delayedCampusInput = document.querySelector('#campus-input');
            if (delayedCampusInput) {
                setupInputAutocomplete(delayedCampusInput, commonCampuses);
            }
        }
        
        if (!methodsInput) {
            const delayedMethodsInput = document.querySelector('#methods-input');
            if (delayedMethodsInput) {
                setupInputAutocomplete(delayedMethodsInput, commonMethods);
            }
        }
    }, 500);
}

/**
 * Sets up autocomplete for a specific input field
 * @param {HTMLInputElement} inputElement - The input element to add autocomplete to
 * @param {Array<string>} items - The list of autocomplete options
 */
function setupInputAutocomplete(inputElement, items) {
    console.log('Setting up autocomplete for', inputElement.placeholder || inputElement.id);
    
    // First, check if autocomplete is already set up for this input
    if (inputElement.parentNode.classList.contains('autocomplete-container')) {
        console.log('Autocomplete already set up for this input');
        return;
    }
    
    // Create autocomplete container
    // Parse the schedule to get days and times
    const scheduleInfo = parseSchedule(section.schedule);
    if (!scheduleInfo) {
        console.error('Could not parse schedule:', section.schedule);
        alert('Error: Could not parse schedule information');
        return;
    }
    
    // Add the course to each day in the schedule
    scheduleInfo.days.forEach(day => {
        addCourseToScheduleGrid(subject, courseCode, sectionNumber, day, scheduleInfo.startHour, scheduleInfo.endHour, section);
    });
    
    // Alert the user
    alert(`Added ${subject} ${courseCode} section ${sectionNumber} to your schedule`);
}

// Helper function to parse a schedule string like "MWF 10:00 AM - 10:50 AM"
function parseSchedule(scheduleStr) {
    try {
        // Extract days and times
        const parts = scheduleStr.split(' ');
        if (parts.length < 4) return null;
        
        const days = parts[0].split('').map(day => {
            // Convert R to TH for Thursday
            return day === 'R' ? 'TH' : day;
        });
        
        // Find start and end times
        let startTimeIndex = -1;
        let endTimeIndex = -1;
        
        for (let i = 1; i < parts.length; i++) {
            if (parts[i].includes(':')) {
                if (startTimeIndex === -1) {
                    startTimeIndex = i;
                } else {
                    endTimeIndex = i;
                    break;
                }
            }
        }
        
        if (startTimeIndex === -1 || endTimeIndex === -1) return null;
        
        // Combine time with AM/PM
        const startTime = parts[startTimeIndex] + ' ' + parts[startTimeIndex + 1];
        const endTime = parts[endTimeIndex] + ' ' + parts[endTimeIndex + 1];
        
        // Convert to decimal hours (e.g., 10:30 AM -> 10.5)
        const startHour = parseTimeToDecimal(startTime);
        const endHour = parseTimeToDecimal(endTime);
        
        return { days, startHour, endHour };
    } catch (error) {
        console.error('Error parsing schedule:', error);
        return null;
    }
}

// Helper function to convert time strings to decimal hours
function parseTimeToDecimal(timeStr) {
    try {
        // Example: "10:30 AM"
        const parts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (!parts) return null;
        
        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const isPM = parts[3].toUpperCase() === 'PM';
        
        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        // Convert to decimal
        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing time:', error);
        return null;
    }
}

// Function to add a course to the schedule grid
function addCourseToScheduleGrid(subject, courseCode, sectionNumber, day, startHour, endHour, section) {
    // Convert day to column index
    const dayMap = { 'M': 1, 'T': 2, 'W': 3, 'TH': 4, 'F': 5 };
    const colIndex = dayMap[day];
    
    if (!colIndex) {
        console.error('Invalid day:', day);
        return;
    }
    
    // Calculate row based on start time (assuming 8 AM is row 2)
    const rowIndex = Math.floor((startHour - 8) + 2);
    const durationHours = endHour - startHour;
    
    // Get the schedule table
    const scheduleTable = document.querySelector('.schedule-grid table');
    if (!scheduleTable) {
        console.error('Schedule table not found');
        return;
    }
    
    // Get the cell for this time slot
    const cell = scheduleTable.rows[rowIndex]?.cells[colIndex];
    if (!cell) {
        console.error('Cell not found at row', rowIndex, 'col', colIndex);
        return;
    }
    
    // Set position relative for absolute positioning of event block
    cell.style.position = 'relative';
    
    // Create course block
    const courseBlock = document.createElement('div');
    courseBlock.className = 'course-block';
    
    // Generate a random color for the course
    const courseColor = getRandomCourseColor(`${subject}${courseCode}`);
    
    // Calculate position and height within the cell
    const topOffset = (startHour % 1) * 60; // Convert fractional hour to minutes
    const heightPx = durationHours * 60; // Convert hours to minutes
    
    // Set styles for the course block
    courseBlock.style.cssText = `
        position: absolute;
        background-color: ${courseColor};
        color: white;
        width: 100%;
        left: 0;
        padding: 8px;
        border-radius: 4px;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 1;
        top: ${topOffset}px;
        height: ${heightPx}px;
    `;
    
    // Set content of the course block
    courseBlock.innerHTML = `
        <div class="event-name">${subject} ${courseCode}</div>
        <div class="event-location">${section.location || 'TBA'}</div>
        <div class="event-time">${formatTimeForDisplay(startHour)} - ${formatTimeForDisplay(endHour)}</div>
        <div class="event-instructor">${section.instructor || 'TBA'}</div>
    `;
    
    // Add data attributes for tracking
    courseBlock.dataset.subject = subject;
    courseBlock.dataset.courseCode = courseCode;
    courseBlock.dataset.sectionNumber = sectionNumber;
    courseBlock.dataset.day = day;
    
    // Add the course block to the cell
    cell.appendChild(courseBlock);
    
    // Add event listeners for interaction
    import('./eventListeners.js').then(module => {
        if (typeof module.addEventBlockListeners === 'function') {
            module.addEventBlockListeners(courseBlock);
        }
    });
}

// Helper function to format a decimal hour to a readable time
function formatTimeForDisplay(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.floor((decimalHour - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to generate a random color based on course code
function getRandomCourseColor(courseCode) {
    // Generate a hash from the course code
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
        hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to HSL (hue, saturation, lightness)
    // Use a fixed saturation and lightness for readability
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
}

// Make functions globally available
window.addSectionToSchedule = addSectionToSchedule;

/**
 * Toggles the selection state of a division button
 * @param {HTMLElement} clickedButton - The button that was clicked
 * @param {HTMLElement} otherButton - The other button to deselect
 */
function toggleDivisionButton(clickedButton, otherButton) {
    // Toggle the clicked button
    clickedButton.classList.toggle('selected');
    
    // Update styling
    if (clickedButton.classList.contains('selected')) {
        clickedButton.style.backgroundColor = '#142A50';
        clickedButton.style.color = 'white';
        clickedButton.style.borderColor = '#142A50';
        
        // Deselect the other button if selected
        if (otherButton && otherButton.classList.contains('selected')) {
            otherButton.classList.remove('selected');
            otherButton.style.backgroundColor = '';
            otherButton.style.color = '';
            otherButton.style.borderColor = '';
        }
    } else {
        // Reset styling if deselected
        clickedButton.style.backgroundColor = '';
        clickedButton.style.color = '';
        clickedButton.style.borderColor = '';
    }
}

// Check if the backend API is available
function checkBackendConnection() {
    console.log('Checking backend connection status...');
    
    return fetch('http://localhost:5001/user_bp/login', {
        method: 'OPTIONS', // Use OPTIONS instead of GET to avoid triggering authentication errors
        cache: 'no-cache'
    })
    .then(response => {
        console.log('Backend connection response:', response.status);
        // Any response means the server is reachable
        return { connected: true };
    })
    .catch(error => {
        console.error('Backend connection error:', error);
        return { connected: false, error: error };
    });
}

// Add the backend-status element to the Courses tab
function addBackendStatusIndicator(coursesTab) {
    if (!coursesTab) return;
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'backend-status';
    statusContainer.innerHTML = `
        <span class="status-label">Backend Status:</span>
        <span id="backend-status" class="status-connecting">Checking...</span>
    `;
    coursesTab.appendChild(statusContainer);
    
    checkBackendConnection()
        .then(result => {
    const statusElement = document.getElementById('backend-status');
    if (!statusElement) return;
    
            if (result.connected) {
                statusElement.textContent = 'Connected';
                statusElement.className = 'status-connected';
                console.log('Backend connection established');
            } else {
                statusElement.textContent = 'Disconnected';
                statusElement.className = 'status-disconnected';
                console.log('Backend connection failed');
                
                // Display a message about connection failure
                const connectionMessage = document.createElement('div');
                connectionMessage.className = 'connection-error-notice';
                connectionMessage.innerHTML = `
                    <p>Unable to connect to the backend server. Please ensure the server is running.</p>
                    <button id="refresh-connection" class="btn">Refresh Connection</button>
                `;
                coursesTab.appendChild(connectionMessage);
                
                // Add refresh button functionality
                document.getElementById('refresh-connection')?.addEventListener('click', () => {
                    statusElement.textContent = 'Reconnecting...';
                    statusElement.className = 'status-connecting';
                    connectionMessage.style.display = 'none';
                    
                    checkBackendConnection()
                        .then(newResult => {
                            if (newResult.connected) {
                                statusElement.textContent = 'Connected';
                                statusElement.className = 'status-connected';
                                // Show success toast
                                if (typeof showNotification === 'function') {
                                    showNotification('Successfully connected to the backend server', 'success');
                                }
            } else {
                                statusElement.textContent = 'Disconnected';
                                statusElement.className = 'status-disconnected';
                                connectionMessage.style.display = 'block';
                                // Show error toast
                                if (typeof showNotification === 'function') {
                                    showNotification('Still unable to connect to the backend server.', 'error');
                                }
                            }
                        });
                });
            }
        });
}

// Direct implementation of autocomplete
function applyDirectAutocomplete() {
    console.log("Applying direct autocomplete to search inputs");
    
    // Define our search data
    const subjects = ["ACCT", "ADMN", "AERO", "AMST", "ANTH", "AORT", "ARAB", "ARTA", "ASTR", "BADM", "BIOE", "BIOL", "BLOC", "BMIS", "BMM", "BRCT", "BUSN", "CATH", "CHEM", "CHIN", "CLAS", "CMCN", "COGS", "COML", "COMM", "COSC", "CPSC", "CRJS", "CSCI", "DANC", "DAUS", "DATA", "DEBG", "ECON", "EDCE", "EDDI", "EDEL", "EDPE", "EDSP", "EDTE", "EDUC", "EECE", "EGNR", "ELED", "ELTD", "ENGL", "ENVS", "ETHN", "ETRM", "EURO", "EXSC", "FACE", "FILM", "FINA", "FREN", "GEOG", "GEOL", "GERM", "GLOB", "GNBH", "GREK", "GRGC", "GUWC", "HEAL", "HIST", "HONS", "HPHY", "HRMT", "IBUS", "INST", "INTE", "IRPS", "ITAL", "ITEC", "JAPN", "JOUR", "KORN", "LACE", "LATN", "LAW", "LBUS", "LIBR", "LSCI", "MAIC", "MATH", "MBA", "METL", "MFAT", "MFIN", "MGMT", "MILS", "MKTG", "MSBA", "MSCR", "MSIN", "MTAX", "MUSC", "NTAS", "NURS", "OPER", "PJMN", "PHIL", "PHYS", "POLS", "PRLS", "PSYC", "RELI", "SOCI", "SPAN", "SPED", "SPMT", "THEA", "UNIV", "WGST"];
    const courses = ["100", "101", "102", "110", "121", "122", "200", "201", "202", "211", "212", "221", "223", "224", "260", "300", "301", "302", "310", "311", "312", "320", "321", "322", "323", "324", "325", "330", "331", "332", "340", "341", "342", "350", "351", "352", "360", "361", "362", "400", "401", "402", "410", "411", "412", "420", "421", "422", "430", "431", "432", "440", "441", "442", "450", "451", "452", "460", "461", "462", "470", "471", "472", "480", "481", "482", "490", "491", "492", "499"];
    const instructors = ["Smith, John", "Johnson, Sarah", "Robert Johnson", "Emily Davis", "Michael Brown"];
    const attributes = ["Core Curriculum", "Writing Intensive", "Service Learning", "Global Studies", "Social Justice", "Fine Arts"];
    const campuses = ["Main Campus", "Downtown", "Extension Center", "Online"];
    const methods = ["In Person", "Online", "Hybrid", "Field Study", "Independent Study"];

    // First, let's inject the CSS directly into the document to ensure styles are applied
    injectAutocompleteStyles();
    
    // Select all search inputs in the course tab
    const subjectInput = document.querySelector('#subject-input');
    const courseInput = document.querySelector('#course-code-input');
    const attributesInput = document.querySelector('#attributes-input');
    const instructorInput = document.querySelector('#instructor-input');
    const campusInput = document.querySelector('#campus-input');
    const methodsInput = document.querySelector('#methods-input');
    
    console.log("Found inputs:", { 
        subject: subjectInput,
        course: courseInput,
        attributes: attributesInput,
        instructor: instructorInput,
        campus: campusInput,
        methods: methodsInput
    });
    
    // Create dropdowns for each input
    if (subjectInput) {
        createDirectDropdown(subjectInput, 'subject-dropdown', subjects);
    }
    
    if (courseInput) {
        createDirectDropdown(courseInput, 'course-dropdown', courses);
    }
    
    if (attributesInput) {
        createDirectDropdown(attributesInput, 'attributes-dropdown', attributes);
    }
    
    if (instructorInput) {
        createDirectDropdown(instructorInput, 'instructor-dropdown', instructors);
    }
    
    if (campusInput) {
        createDirectDropdown(campusInput, 'campus-dropdown', campuses);
    }
    
    if (methodsInput) {
        createDirectDropdown(methodsInput, 'methods-dropdown', methods);
    }
}

function createDirectDropdown(inputElement, dropdownId, items) {
    console.log(`Creating dropdown ${dropdownId} for`, inputElement);
    
    // Get parent to position relative to
    const parentElement = inputElement.parentElement;
    if (!parentElement) return;
    
    // Set relative positioning on parent
    parentElement.style.position = 'relative';
    
    // Create dropdown container with z-index to ensure it appears above other elements
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border: 2px solid #4A90E2;
            border-radius: 0 0 4px 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 9999;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            display: none;
        `;
        parentElement.appendChild(dropdown);
    }
    
    // Set up input event listeners
    inputElement.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        updateDropdown(dropdown, items, value);
    });
    
    inputElement.addEventListener('focus', function() {
        dropdown.style.display = 'block';
        updateDropdown(dropdown, items, this.value.toLowerCase());
    });
    
    document.addEventListener('click', function(event) {
        if (!inputElement.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Add keyboard navigation
    inputElement.addEventListener('keydown', function(e) {
        handleKeyboardNavigation(e, dropdown, inputElement);
    });
}

function updateDropdown(dropdown, items, query) {
    // Clear previous items
    dropdown.innerHTML = '';
    
    // Filter items based on query
    const filteredItems = query 
        ? items.filter(item => item.toLowerCase().includes(query))
        : items;
    
    // Handle empty results
    if (filteredItems.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'autocomplete-item no-results';
        noResults.textContent = 'No matching items found';
        dropdown.appendChild(noResults);
        dropdown.style.display = 'block';
        return;
    }
    
    // Show all filtered items
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'autocomplete-item';
        
        // Highlight the matching part
        const itemText = item;
        const index = itemText.toLowerCase().indexOf(query);
        
        if (query && index !== -1) {
            const before = itemText.substring(0, index);
            const match = itemText.substring(index, index + query.length);
            const after = itemText.substring(index + query.length);
            
            itemElement.innerHTML = `${before}<strong style="color: #4A90E2; text-decoration: underline;">${match}</strong>${after}`;
            } else {
            itemElement.textContent = itemText;
        }
        
        itemElement.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        
        itemElement.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f9ff';
        });
        
        itemElement.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'white';
        });
        
        itemElement.addEventListener('click', function() {
            dropdown.style.display = 'none';
            inputElement.value = item;
        });
        
        dropdown.appendChild(itemElement);
    });
    
    dropdown.style.display = 'block';
}

function handleKeyboardNavigation(event, dropdown, inputElement) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    const selected = dropdown.querySelector('.selected');
    let index = -1;
    
    if (selected) {
        for (let i = 0; i < items.length; i++) {
            if (items[i] === selected) {
                index = i;
                break;
            }
        }
    }
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (dropdown.style.display === 'none') {
                dropdown.style.display = 'block';
                updateDropdown(dropdown, items, inputElement.value.toLowerCase());
            } else {
                if (index < items.length - 1) {
                    if (selected) selected.classList.remove('selected');
                    items[index + 1].classList.add('selected');
                    items[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            if (index > 0) {
                if (selected) selected.classList.remove('selected');
                items[index - 1].classList.add('selected');
                items[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            break;
            
        case 'Enter':
            if (selected) {
                event.preventDefault();
                inputElement.value = selected.textContent;
                dropdown.style.display = 'none';
            }
            break;
            
        case 'Escape':
            dropdown.style.display = 'none';
            break;
    }
}

function injectAutocompleteStyles() {
    const styleId = 'autocomplete-direct-styles';
    
    // Only inject if not already present
    if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
            .autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: white;
                border: 2px solid #4A90E2;
                border-radius: 0 0 4px 4px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 9999;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .autocomplete-item {
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            }
            
            .autocomplete-item:hover,
            .autocomplete-item.selected {
                background-color: #f5f9ff;
            }
            
            .autocomplete-item:last-child {
                border-bottom: none;
            }
            
            .autocomplete-item.no-results {
                padding: 10px;
                text-align: center;
                color: #666;
                font-style: italic;
            }
            
            body.dark-mode .autocomplete-dropdown {
                background-color: #2c3e50;
                border-color: #4A90E2;
            }
            
            body.dark-mode .autocomplete-item {
                border-bottom-color: #3a4a5c;
                color: #e0e0e0;
            }
            
            body.dark-mode .autocomplete-item:hover,
            body.dark-mode .autocomplete-item.selected {
                background-color: #3a4a5c;
            }
            
            body.dark-mode .autocomplete-item.no-results {
                color: #aaa;
            }
            
            .form-group {
                position: relative;
            }
        `;
        
        document.head.appendChild(styleElement);
        console.log("Injected autocomplete styles");
    }
}

function initializeFormHandlers() {
    // Course search form - get elements and check if they exist
    const subjectInput = document.getElementById('course-subject');
    const courseCodeInput = document.getElementById('course-code');
    const instructorInput = document.getElementById('course-instructor');
    const searchButton = document.querySelector('.search-btn');
    
    // Division buttons
    const undergradBtn = document.getElementById('undergrad-btn');
    const gradBtn = document.getElementById('grad-btn');
    let currentDivision = 'undergrad';
    
    // Personal event form
    const eventNameInput = document.getElementById('event-name');
    const startTimeInput = document.getElementById('event-start-time');
    const endTimeInput = document.getElementById('event-end-time');
    const addEventButton = document.getElementById('add-event-btn');
    
    // Day selection buttons
    const dayButtons = document.querySelectorAll('.day-button');
    let selectedDays = [];
    
    // Initialize division buttons - check if elements exist first
    if (undergradBtn && gradBtn) {
        undergradBtn.addEventListener('click', () => {
            undergradBtn.classList.add('active');
            gradBtn.classList.remove('active');
            currentDivision = 'undergrad';
        });
        
        gradBtn.addEventListener('click', () => {
            gradBtn.classList.add('active');
            undergradBtn.classList.remove('active');
            currentDivision = 'grad';
        });
    }
    
    // Initialize day selection - check if elements exist
    if (dayButtons && dayButtons.length > 0) {
        dayButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('selected');
                const day = button.getAttribute('data-day');
                
                if (button.classList.contains('selected')) {
                    selectedDays.push(day);
                } else {
                    selectedDays = selectedDays.filter(d => d !== day);
                }
            });
        });
    }
    
    // Initialize autocomplete for subjects - check if element exists
    if (subjectInput) {
        initializeAutocomplete(subjectInput, getSubjects);
    }
    
    // Initialize autocomplete for instructors - check if element exists
    if (instructorInput) {
        initializeAutocomplete(instructorInput, getInstructors);
    }
    
    // Search button event - check if element exists
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchParams = {
                subject: subjectInput ? subjectInput.value : '',
                courseCode: courseCodeInput ? courseCodeInput.value : '',
                instructor: instructorInput ? instructorInput.value : '',
                division: currentDivision,
                days: selectedDays
            };
            
            searchCourses(searchParams);
        });
    }
    
    // Add personal event button - check if element exists
    if (addEventButton && eventNameInput && startTimeInput && endTimeInput) {
        addEventButton.addEventListener('click', () => {
            const eventData = {
                name: eventNameInput.value,
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                days: selectedDays
            };
            
            if (validateEventData(eventData)) {
                addPersonalEvent(eventData);
                clearEventForm();
            } else {
                showNotification('Please fill in all event fields and select at least one day', 'error');
            }
        });
    }
}

function initializeAutocomplete(inputElement, dataFetchFunction) {
    let dropdown;
    let currentFocus = -1;
    
    // Create dropdown container
    const createDropdown = () => {
        // Remove any existing dropdown
        if (dropdown) dropdown.remove();
        
        dropdown = document.createElement('div');
        dropdown.classList.add('autocomplete-dropdown');
        inputElement.parentNode.appendChild(dropdown);
    };
    
    // Add items to the dropdown
    const updateDropdown = (items) => {
        dropdown.innerHTML = '';
        
        if (items.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('no-results');
            noResults.textContent = 'No matches found';
            dropdown.appendChild(noResults);
        } else {
            items.forEach((item, index) => {
                const element = document.createElement('div');
                element.classList.add('autocomplete-item');
                element.textContent = item;
                
                element.addEventListener('click', () => {
                    inputElement.value = item;
                    closeDropdown();
                });
                
                dropdown.appendChild(element);
            });
        }
        
        dropdown.classList.add('show');
    };
    
    // Close the dropdown
    const closeDropdown = () => {
        if (dropdown) {
            dropdown.classList.remove('show');
            currentFocus = -1;
        }
    };
    
    // Input event
    inputElement.addEventListener('input', () => {
        const value = inputElement.value.trim();
        
        if (value.length === 0) {
            closeDropdown();
            return;
        }
        
        createDropdown();
        const matchingItems = dataFetchFunction(value);
        updateDropdown(matchingItems);
    });
    
    // Handle keyboard navigation
    inputElement.addEventListener('keydown', (e) => {
        if (!dropdown || !dropdown.classList.contains('show')) return;
        
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        // Arrow down
        if (e.key === 'ArrowDown') {
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActive(items);
            e.preventDefault();
        }
        // Arrow up
        else if (e.key === 'ArrowUp') {
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
            setActive(items);
            e.preventDefault();
        }
        // Enter
        else if (e.key === 'Enter' && currentFocus > -1) {
            e.preventDefault();
            if (items[currentFocus]) {
                inputElement.value = items[currentFocus].textContent;
                closeDropdown();
            }
        }
        // Escape
        else if (e.key === 'Escape') {
            closeDropdown();
        }
    });
    
    // Set the active item
    const setActive = (items) => {
        items.forEach(item => item.classList.remove('selected'));
        if (currentFocus >= 0 && currentFocus < items.length) {
            items[currentFocus].classList.add('selected');
            items[currentFocus].scrollIntoView({ block: 'nearest' });
        }
    };
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            closeDropdown();
        }
    });
}

// Mock data fetch functions
function getSubjects(query) {
    const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
    return subjects.filter(subject => subject.toLowerCase().includes(query.toLowerCase()));
}

function getInstructors(query) {
    const instructors = ['John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Davis', 'Michael Brown'];
    return instructors.filter(instructor => instructor.toLowerCase().includes(query.toLowerCase()));
}

function searchCourses(params) {
    // This function should now make actual API calls
    console.log('Searching courses with params:', params);
    
    // For now, just update the UI with a message
    const resultsContainer = document.querySelector('.search-results');
    
    if (!params.subject && !params.courseCode && !params.instructor && 
        !params.attributes && !params.campus && !params.methods && !params.division) {
        resultsContainer.innerHTML = '<div class="no-results-message">Please enter search criteria</div>';
        return;
    }
    
    // Construct criteria object for the backend
    const criteria = {};
    if (params.subject) criteria.subject = params.subject;
    if (params.courseCode) criteria.course_code = params.courseCode;
    if (params.attributes) criteria.attributes = params.attributes;
    if (params.instructor) criteria.instructor = params.instructor;
    if (params.campus) criteria.campus = params.campus;
    if (params.methods) criteria.methods = params.methods;
    if (params.division) criteria.division = params.division;
    
    // Start loading
    resultsContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Searching courses...</p></div>';
    
    // Call the fetch function
    fetchSectionsFromBackend(criteria)
        .then(sections => {
            displaySections(sections);
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            resultsContainer.innerHTML = '<div class="error-message">Failed to fetch courses. Please try again later.</div>';
        });
}

function validateEventData(eventData) {
    return eventData.name && eventData.startTime && eventData.endTime && eventData.days.length > 0;
}

function addPersonalEvent(eventData) {
    console.log('Adding personal event:', eventData);
    showNotification('Personal event added', 'success');
    
    // Here you would typically update the calendar view
    // For demonstration, we'll just show a success message
}

function clearEventForm() {
    const eventNameInput = document.getElementById('event-name');
    const startTimeInput = document.getElementById('event-start-time');
    const endTimeInput = document.getElementById('event-end-time');
    
    // Check if elements exist before manipulating them
    if (eventNameInput) eventNameInput.value = '';
    if (startTimeInput) startTimeInput.value = '';
    if (endTimeInput) endTimeInput.value = '';
    
    // Deselect all day buttons
    document.querySelectorAll('.day-button.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function initializeDragAndDrop() {
    const courseItems = document.querySelectorAll('.course-item');
    const scheduleGrid = document.querySelector('.schedule-grid');
    
    courseItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.innerHTML);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    
    if (scheduleGrid) {
        scheduleGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.add('drop-hover');
            }
        });
        
        scheduleGrid.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.remove('drop-hover');
            }
        });
        
        scheduleGrid.addEventListener('drop', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.remove('drop-hover');
                const data = e.dataTransfer.getData('text/plain');
                
                // Create a course block in the schedule
                const courseBlock = document.createElement('div');
                courseBlock.classList.add('course-block');
                courseBlock.innerHTML = data;
                
                cell.appendChild(courseBlock);
            }
        });
    }
}

// Initialize the form handlers when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createRegistrationSidebar();
    // Wait a bit to ensure elements are created before initializing form handlers
    setTimeout(initializeFormHandlers, 500);
});

/**
 * Ensures the schedule grid is always visible
 */
function ensureScheduleGridVisible() {
    console.log('Ensuring schedule grid visibility');
    
    // Try multiple selector approaches to find the schedule container
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid, .main-content');
    const scheduleView = document.querySelector('.schedule-view');
    
    // If we can't find the container, create it
    if (!scheduleContainer) {
        console.log('Schedule container not found, creating it');
        createScheduleGrid();
        return;
    }
    
    if (scheduleContainer) {
        scheduleContainer.style.display = 'flex';
        scheduleContainer.style.visibility = 'visible';
        scheduleContainer.style.opacity = '1';
        scheduleContainer.style.minHeight = '600px';
        scheduleContainer.style.flex = '1';
    }
    
    if (scheduleView) {
        scheduleView.style.display = 'flex';
        scheduleView.style.visibility = 'visible';
        scheduleView.style.opacity = '1';
    }
    
    // Make sure the container is in the DOM
    const contentContainer = document.querySelector('.content-container, main');
    if (contentContainer && !contentContainer.contains(scheduleContainer)) {
        contentContainer.appendChild(scheduleContainer);
    }
}

/**
 * Creates the schedule grid if it doesn't exist
 */
function createScheduleGrid() {
    console.log('Creating schedule grid');
    
    const contentContainer = document.querySelector('.content-container, main');
    if (!contentContainer) {
        console.error('Content container not found');
        return;
    }
    
    // Create schedule container
    const scheduleContainer = document.createElement('div');
    scheduleContainer.className = 'schedule-container';
    scheduleContainer.style.display = 'flex';
    scheduleContainer.style.flexDirection = 'column';
    scheduleContainer.style.flex = '1';
    scheduleContainer.style.minHeight = '600px';
    scheduleContainer.style.backgroundColor = '#fff';
    scheduleContainer.style.borderRadius = '8px';
    scheduleContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    
    // Add header
    const scheduleHeader = document.createElement('div');
    scheduleHeader.className = 'schedule-header';
    scheduleHeader.style.padding = '20px';
    scheduleHeader.style.borderBottom = '1px solid #ecf0f1';
    scheduleHeader.style.display = 'flex';
    scheduleHeader.style.justifyContent = 'space-between';
    scheduleHeader.style.alignItems = 'center';
    
    scheduleHeader.innerHTML = `
        <h2>Course Schedule</h2>
        <div class="term-selector">
            <button class="term-btn active">Term 1 (Fall)</button>
            <button class="term-btn">Term 2 (Winter)</button>
        </div>
    `;
    
    scheduleContainer.appendChild(scheduleHeader);
    
    // Create schedule view with time column and grid
    const scheduleView = document.createElement('div');
    scheduleView.className = 'schedule-view';
    scheduleView.style.display = 'flex';
    scheduleView.style.flex = '1';
    scheduleView.style.overflowX = 'auto';
    
    // Add time column
    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    timeColumn.style.width = '80px';
    timeColumn.style.flexShrink = '0';
    timeColumn.style.borderRight = '1px solid #ecf0f1';
    
    timeColumn.innerHTML = `
        <div class="time-header"></div>
        <div class="time-slot">8:00</div>
        <div class="time-slot">9:00</div>
        <div class="time-slot">10:00</div>
        <div class="time-slot">11:00</div>
        <div class="time-slot">12:00</div>
        <div class="time-slot">13:00</div>
        <div class="time-slot">14:00</div>
        <div class="time-slot">15:00</div>
        <div class="time-slot">16:00</div>
        <div class="time-slot">17:00</div>
        <div class="time-slot">18:00</div>
        <div class="time-slot">19:00</div>
    `;
    
    scheduleView.appendChild(timeColumn);
    
    // Create grid
    const scheduleGrid = document.createElement('div');
    scheduleGrid.className = 'schedule-grid';
    scheduleGrid.style.flex = '1';
    scheduleGrid.style.display = 'grid';
    scheduleGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    scheduleGrid.style.gridTemplateRows = '50px repeat(12, 60px)';
    
    // Add day headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.style.fontWeight = '500';
        dayHeader.style.display = 'flex';
        dayHeader.style.alignItems = 'center';
        dayHeader.style.justifyContent = 'center';
        dayHeader.style.borderBottom = '1px solid #ecf0f1';
        dayHeader.style.borderRight = '1px solid #ecf0f1';
        dayHeader.textContent = day;
        
        scheduleGrid.appendChild(dayHeader);
    });
    
    // Add time cells for each day and time
    const dayLetters = ['M', 'T', 'W', 'TH', 'F'];
    for (let hour = 8; hour <= 19; hour++) {
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
            const cell = document.createElement('div');
            cell.className = 'schedule-cell';
            cell.dataset.day = dayLetters[dayIndex];
            cell.dataset.time = `${hour}:00`;
            cell.style.borderBottom = '1px solid #ecf0f1';
            cell.style.borderRight = '1px solid #ecf0f1';
            cell.style.position = 'relative';
            
            scheduleGrid.appendChild(cell);
        }
    }
    
    scheduleView.appendChild(scheduleGrid);
    scheduleContainer.appendChild(scheduleView);
    
    // Add to content container
    contentContainer.appendChild(scheduleContainer);
    
    console.log('Schedule grid created and added to the page');
    return scheduleContainer;
}

// Make this function available globally
window.ensureScheduleGridVisible = ensureScheduleGridVisible;
window.createScheduleGrid = createScheduleGrid;

// Run immediately on script load
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(ensureScheduleGridVisible, 0);
        });
    } else {
        setTimeout(ensureScheduleGridVisible, 0);
    }
})();

// Also run when registration tab is clicked
document.addEventListener('click', function(e) {
    if (e.target && (e.target.href === 'registration.html' || e.target.dataset.tab === 'Registration')) {
        setTimeout(ensureScheduleGridVisible, 0);
    }
});