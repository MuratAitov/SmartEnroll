/**
 * This file handles course search and registration functionality
 */

// Initialize global state
window.sectionsData = [];

/**
 * Initiates fetching of all necessary data.
 */
function fetchData() {
    // Get the values from input fields
    const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
    const courseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]');
    const attributeInput = document.querySelector('#Courses input[placeholder="Attributes"]');
    const instructorInput = document.querySelector('#instructor-input');
    
    // Create search criteria object
    const criteria = {};
    
    if (subjectInput && subjectInput.value.trim()) {
        criteria.subject = subjectInput.value.trim().toUpperCase();
        // <-- toUpperCase(), потому что в БД subject = 'MATH'
    }
    
    if (courseCodeInput && courseCodeInput.value.trim()) {
        criteria.course_code = courseCodeInput.value.trim();
    }
    
    if (attributeInput && attributeInput.value.trim()) {
        criteria.attribute = attributeInput.value.trim();
    }
    
    if (instructorInput && instructorInput.value.trim()) {
        criteria.instructor = instructorInput.value.trim();
    }
    
    // Clear the courses list before fetching new data
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        coursesList.innerHTML = '';
    }
    
    // If we have criteria, fetch sections from real server, otherwise show courses
    if (Object.keys(criteria).length > 0) {
        fetchSections(criteria);
    } else {
        // Show mock course data if no search criteria
    fetchCourses();
    }
}

/**
 * Checks if the backend is available and connects to it
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
function checkBackendConnection() {
    return new Promise((resolve) => {
        // Try to ping an endpoint that's guaranteed to exist (like the root endpoint)
        fetch('http://localhost:5001/')
        .then(response => {
                resolve(response.status < 400); // Resolve true if status is not an error
        })
        .catch(error => {
            console.error('Backend connection failed:', error);
                resolve(false); // Resolve false if there's an error
                });
    });
}

/**
 * Sets up the autocomplete functionality for the instructor input field
 */
function setupInstructorAutocomplete() {
    console.log('Setting up instructor autocomplete');
    const instructorInput = document.getElementById('instructor-input');
    if (!instructorInput) {
        console.warn('Instructor input not found');
        return;
    }
    
    // Use a mock data approach instead of relying on a backend endpoint
    const mockInstructors = [
        "Dr. Smith", "Dr. Johnson", "Prof. Williams", "Prof. Brown", 
        "Dr. Jones", "Dr. Garcia", "Prof. Miller", "Prof. Davis",
        "Dr. Rodriguez", "Dr. Martinez", "Prof. Hernandez", "Prof. Lopez"
    ];
    
    console.log('Using mock instructors data:', mockInstructors);
    
    // Store the instructors list for later use
    window.instructors = mockInstructors;
    
    // Set up autocomplete with the mock instructors
    setupCustomAutocomplete(instructorInput, mockInstructors);
}

/**
 * Sets up a custom autocomplete feature for an input element
 * @param {HTMLInputElement} inputElement - The input element to apply autocomplete to
 * @param {Array} items - The array of items for autocomplete suggestions
 */
function setupCustomAutocomplete(inputElement, items) {
    // Create autocomplete container
    const container = document.createElement('div');
    container.className = 'autocomplete-container';

    // Insert container after input
    inputElement.parentNode.insertBefore(container, inputElement.nextSibling);

    // Move input inside container
    container.appendChild(inputElement);

    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'autocomplete-list';
    container.appendChild(dropdownList);

    // Event handlers
    inputElement.addEventListener('input', function() {
        const value = this.value.toLowerCase();

        // Hide dropdown if input is empty
        if (!value) {
            dropdownList.style.display = 'none';
            return;
        }

        // Filter items based on input
        const filteredItems = items.filter(item =>
            item.toLowerCase().includes(value)
        ).slice(0, 10); // Limit to 10 suggestions

        // Populate dropdown
        if (filteredItems.length > 0) {
            dropdownList.innerHTML = '';

            filteredItems.forEach(item => {
                const element = document.createElement('div');
                element.className = 'autocomplete-item';
                element.innerHTML = highlightMatches(item, value);

                element.addEventListener('click', function() {
                    inputElement.value = item;
                    dropdownList.style.display = 'none';
                });

                dropdownList.appendChild(element);
            });

            dropdownList.style.display = 'block';
        } else {
            dropdownList.style.display = 'none';
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdownList.style.display = 'none';
        }
    });

    // Show dropdown when focusing on input
    inputElement.addEventListener('focus', function() {
        const value = this.value.toLowerCase();
        if (value) {
            // Trigger input event to show matching items
            this.dispatchEvent(new Event('input'));
        }
    });

    // Add keyboard navigation
    inputElement.addEventListener('keydown', function(e) {
        const items = dropdownList.querySelectorAll('.autocomplete-item');
        if (!items.length) return;

        const currentSelected = dropdownList.querySelector('.selected');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!currentSelected) {
                items[0].classList.add('selected');
            } else {
                const nextSibling = currentSelected.nextElementSibling;
                if (nextSibling) {
                    currentSelected.classList.remove('selected');
                    nextSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSelected) {
                const prevSibling = currentSelected.previousElementSibling;
                if (prevSibling) {
                    currentSelected.classList.remove('selected');
                    prevSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'Enter') {
            if (currentSelected) {
                e.preventDefault();
                inputElement.value = currentSelected.textContent;
                dropdownList.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
        }
    });
}

/**
 * Highlights matched text in autocomplete suggestions
 * @param {string} text - The full text
 * @param {string} query - The search query to highlight
 * @returns {string} HTML with matched parts wrapped in <strong> tags
 */
function highlightMatches(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

/**
 * Shows connection error in the sections list
 */
function displayConnectionError() {
    const sectionsList = document.getElementById('sections-list');
    if (sectionsList) {
        sectionsList.innerHTML = `
            <div class="connection-error">
                <h3>Backend Connection Error</h3>
                <p>Could not connect to the course database. Using sample data for demonstration.</p>
                <button id="use-mock-data-btn" class="btn btn-primary">Load Sample Courses</button>
        </div>
    `;
        
        // Add event listener to the button
        const mockDataBtn = document.getElementById('use-mock-data-btn');
        if (mockDataBtn) {
            mockDataBtn.addEventListener('click', function() {
                // Get values from search criteria if any
                const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
                const courseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]');
                
                const criteria = {};
                if (subjectInput && subjectInput.value.trim()) {
                    criteria.subject = subjectInput.value.trim().toUpperCase();
                }
                if (courseCodeInput && courseCodeInput.value.trim()) {
                    criteria.course_code = courseCodeInput.value.trim();
                }
                
                // Generate and display mock data
                const mockSections = createMockSectionsBasedOnCriteria(criteria);
                displaySections(mockSections);
                
                // Show notification
                showNotification('Loaded sample courses for testing', 'info');
            });
        }
    }
}

/**
 * Fetches a list of courses from the backend.
 */
function fetchCourses() {
    // Display mock course data instead of trying to fetch
        updateCoursesListWithMockData();
}

/**
 * Updates the course list with mock data.
 */
function updateCoursesListWithMockData() {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) {
        console.error('Could not find courses-list element in the DOM');
        return;
    }

    console.log('Updating courses list with mock data');
    coursesList.innerHTML = '';  // Clear previous entries
    
    // Mock course data
    const mockCourses = [
        { id: '1', name: 'Introduction to Computer Science', credits: 3 },
        { id: '2', name: 'Data Structures', credits: 4 },
        { id: '3', name: 'Algorithms', credits: 3 },
        { id: '4', name: 'Database Systems', credits: 3 },
        { id: '5', name: 'Web Development', credits: 3 }
    ];
    
    // Add a success message
    const successMessage = document.createElement('div');
    successMessage.style.padding = '10px';
    successMessage.style.marginBottom = '10px';
    successMessage.style.backgroundColor = '#d4edda';
    successMessage.style.borderRadius = '4px';
    successMessage.style.color = '#155724';
    successMessage.style.fontSize = '14px';
    successMessage.textContent = `Successfully loaded ${mockCourses.length} courses`;
    coursesList.appendChild(successMessage);
    
    // Create a styled list container
    const listContainer = document.createElement('div');
    listContainer.style.border = '1px solid #e0e0e0';
    listContainer.style.borderRadius = '4px';
    listContainer.style.overflow = 'hidden';
    
    mockCourses.forEach((course, index) => {
        const li = document.createElement('div');
        li.style.padding = '12px 15px';
        li.style.borderBottom = index < mockCourses.length - 1 ? '1px solid #eee' : 'none';
        li.style.cursor = 'pointer';
        li.style.backgroundColor = 'white';
        li.style.transition = 'background-color 0.2s';
        
        // Create a more detailed course display
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 500; color: #142A50;">${course.name || 'Unnamed Course'}</div>
                    <div style="font-size: 13px; color: #666;">ID: ${course.id || 'N/A'}</div>
                </div>
                <div style="color: #666; font-size: 13px;">${course.credits || '0'} Credits</div>
            </div>
        `;
        
        // Add hover effect
        li.onmouseover = function() { 
            this.style.backgroundColor = '#f8f9fa'; 
        };
        li.onmouseout = function() { 
            this.style.backgroundColor = 'white'; 
        };
        
        // Add click handler to fetch sections
        li.onclick = function() {
            // Use mock data instead of actual API
            displayMockSections();
            
            // Highlight the selected course
            const allItems = listContainer.querySelectorAll('div');
            allItems.forEach(item => item.style.borderLeft = 'none');
            this.style.borderLeft = '4px solid #142A50';
            this.style.paddingLeft = '11px'; // Adjust padding to account for border
        };
        
        listContainer.appendChild(li);
    });
    
    coursesList.appendChild(listContainer);
}

/**
 * Fetches sections based on search criteria
 * This acts as a facade that either calls the real API or uses mock data
 * @param {Object} criteria - Search criteria
 */
function fetchSections(criteria = {}) {
    // First check if backend is available
    checkBackendConnection()
        .then(isConnected => {
            if (isConnected) {
                fetchSectionsReal(criteria);
            } else {
                console.log('Backend unavailable, using mock data');
                const sections = createMockSectionsBasedOnCriteria(criteria);
                window.sectionsData = sections;
                displaySections(sections);
                showNotification('Using sample data - backend connection unavailable', 'warning');
            }
    });
}

/**
 * Fetches sections from the real API based on search criteria
 * @param {Object} criteria - Search criteria
 */
function fetchSectionsReal(criteria = {}) {
    // Show loading state
    const sectionsList = document.getElementById('sections-list');
    if (sectionsList) {
        sectionsList.innerHTML = '<div class="loading">Loading sections...</div>';
    }
    
    // Construct query string from criteria
    const queryString = constructQueryString(criteria);
    
    // Make API request - using proper endpoint path
    fetch(`http://localhost:5001/sections_bp/search${queryString}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched sections:', data);
            
            if (data && Array.isArray(data.data)) {
                // Store sections data globally for reference by other functions
                window.sectionsData = data.data;
                displaySections(data.data);
            } else {
                console.error('Invalid data format received:', data);
                displaySections([]);
            }
        })
        .catch(error => {
            console.error('Error fetching sections:', error);
            
            // Since we're getting 404 errors, let's use mock data as a fallback
            console.log('Falling back to mock data due to API error');
            const mockSections = createMockSectionsBasedOnCriteria(criteria);
            window.sectionsData = mockSections;
            displaySections(mockSections);
            
            // Show a notification about using mock data
            showNotification('Using sample data - backend connection unavailable', 'warning');
        });
}

/**
 * Creates mock section data based on search criteria for testing
 * @param {Object} criteria - Search criteria
 * @returns {Array} - Array of mock section objects
 */
function createMockSectionsBasedOnCriteria(criteria) {
    console.log('Generating mock sections with criteria:', criteria);
    
    const mockSections = [];
    let subjects = criteria.subject ? [criteria.subject] : ['CPSC', 'MATH', 'CHEM', 'ENGL', 'HIST'];
    let courseCodes = criteria.course_code ? [criteria.course_code] : ['121', '122', '221', '223', '260', '321', '101', '102'];
    
    // Ensure CPSC 121 is always included for demonstration purposes
    if (criteria.subject === 'CPSC' && criteria.course_code === '121') {
        subjects = ['CPSC'];
        courseCodes = ['121'];
    } else if (!criteria.subject && !criteria.course_code) {
        // Add CPSC 121 as a recommended course if no specific criteria
        mockSections.push({
            subject: 'CPSC',
            course_code: '121',
            section_number: '01',
            schedule: 'TR 09:30AM-10:45AM',
            instructor: 'Smith, John',
            location: 'College Hall 401',
            credits: '3',
            seats_available: 15,
            total_seats: 30
        });
    }
    
    // Generate mock sections based on criteria
    for (const subject of subjects) {
        // If filtering by subject and it doesn't match, skip
        if (criteria.subject && criteria.subject !== subject) continue;
        
        for (const courseCode of courseCodes) {
            // If filtering by course code and it doesn't match, skip
            if (criteria.course_code && criteria.course_code !== courseCode) continue;
            
            // Generate between 1-3 sections for each course
            const sectionCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 1; i <= sectionCount; i++) {
                const sectionNumber = i.toString().padStart(2, '0'); // 01, 02, 03, etc.
                
                // Generate random schedule
                const days = ['MWF', 'TR', 'MW', 'TRF'][Math.floor(Math.random() * 4)];
                
                // Generate start time between 8 AM and 4 PM
                const startHour = 8 + Math.floor(Math.random() * 9);
                const startMinute = [0, 30][Math.floor(Math.random() * 2)];
                const startPeriod = startHour >= 12 ? 'PM' : 'AM';
                const displayStartHour = startHour > 12 ? startHour - 12 : startHour;
                
                // End time is 50 or 75 minutes later
                const duration = days.includes('R') ? 75 : 50; // TR classes are typically 75 min
                let endHour = startHour;
                let endMinute = startMinute + duration;
                
                if (endMinute >= 60) {
                    endHour += 1;
                    endMinute -= 60;
                }
                
                const endPeriod = endHour >= 12 ? 'PM' : 'AM';
                const displayEndHour = endHour > 12 ? endHour - 12 : endHour;
                
                // Format times
                const startTime = `${displayStartHour}:${startMinute.toString().padStart(2, '0')} ${startPeriod}`;
                const endTime = `${displayEndHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;
                
                // Some sections should have special format to test parsing
                let schedule;
                if (days === 'TR' && Math.random() < 0.3) {
                    // Try a format with no space between time and AM/PM and hyphen
                    schedule = `${days} ${displayStartHour}:${startMinute.toString().padStart(2, '0')}${startPeriod}-${displayEndHour}:${endMinute.toString().padStart(2, '0')}${endPeriod}`;
                } else {
                    // Standard format
                    schedule = `${days} ${startTime} - ${endTime}`;
                }
                
                // Create mock section
                const mockSection = {
            subject: subject,
            course_code: courseCode,
                    section_number: sectionNumber,
                    schedule: schedule,
                    instructor: ['Smith, John', 'Johnson, Sarah', 'Williams, Michael', 'Brown, Lisa'][Math.floor(Math.random() * 4)],
                    location: ['College Hall 101', 'Herak Center 222', 'Hughes Hall 304', 'Tilford Center 201'][Math.floor(Math.random() * 4)],
                    credits: ['3', '4', '1'][Math.floor(Math.random() * 3)],
                    seats_available: Math.floor(Math.random() * 30),
            total_seats: 30
                };
                
                // If filtering by instructor and it doesn't match, skip
                if (criteria.instructor && !mockSection.instructor.toLowerCase().includes(criteria.instructor.toLowerCase())) {
                    continue;
                }
                
                mockSections.push(mockSection);
            }
        }
    }
    
    console.log('Generated mock sections:', mockSections);
    
    // Ensure we're storing this mock data globally
    window.sectionsData = mockSections;
    
    return mockSections;
}

/**
 * Displays the sections in the UI
 * @param {Array} sections - Array of section objects
 */
function displaySections(sections) {
    // Store sections data globally for later reference
    window.sectionsData = sections;
    
    // Get the container where we'll display sections
    const sectionsContainer = document.getElementById('sections-list');
    if (!sectionsContainer) {
        console.error("Sections container not found!");
        return;
    }

    // Clear existing content
    sectionsContainer.innerHTML = '';
    
    if (!sections || sections.length === 0) {
        sectionsContainer.innerHTML = '<div class="no-results">No sections found matching your criteria.</div>';
        return;
    }

    // Create a Set to track unique section identifiers
    const uniqueSectionIds = new Set();
    
    // Group sections by subject + course_code (e.g., "CPSC 121")
    const courseGroups = {};
    
    sections.forEach(section => {
        // Create a unique identifier for this section
        const sectionId = `${section.subject}-${section.course_code}-${section.section_number}`;
        
        // Skip if we've already processed this section
        if (uniqueSectionIds.has(sectionId)) {
            return;
        }
        
        // Mark this section as processed
        uniqueSectionIds.add(sectionId);
        
        // Create the course key
        const courseKey = `${section.subject} ${section.course_code}`;
        
        // Initialize the course group if it doesn't exist
        if (!courseGroups[courseKey]) {
            courseGroups[courseKey] = [];
        }
        
        // Add the section to its course group
        courseGroups[courseKey].push(section);
    });
    
    // Now process each course group
    Object.entries(courseGroups).forEach(([courseKey, courseSections]) => {
        // Create a course container
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-item';
        
        // Create the course header
        const courseHeader = document.createElement('div');
        courseHeader.className = 'course-header';
        
        // Set the title and section count
        courseHeader.innerHTML = `
            <h3>${courseKey}</h3>
            <span class="section-count">${courseSections.length} section${courseSections.length !== 1 ? 's' : ''}</span>
        `;
        
        courseDiv.appendChild(courseHeader);
        
        // Add each section
        courseSections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section-item';
            
            // Format the availability text and class
            let availabilityText = 'Unknown';
            let availabilityClass = '';
            
            if (section.seats_available !== undefined && section.total_seats !== undefined) {
                if (section.seats_available > 10) {
                    availabilityText = `${section.seats_available} available`;
                    availabilityClass = 'available';
                } else if (section.seats_available > 0) {
                    availabilityText = `${section.seats_available} left`;
                    availabilityClass = 'limited';
                } else {
                    availabilityText = 'Full';
                    availabilityClass = 'full';
                }
            }
            
            // Create the section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            sectionHeader.innerHTML = `
                <h4>Section ${section.section_number}</h4>
                <div class="availability ${availabilityClass}">${availabilityText}</div>
            `;
            
            // Create the section details
            const sectionDetails = document.createElement('div');
            sectionDetails.className = 'section-details';
            sectionDetails.innerHTML = `
                <p><strong>Schedule:</strong> ${section.schedule}</p>
                <p><strong>Instructor:</strong> ${section.instructor}</p>
                <p><strong>Location:</strong> ${section.location}</p>
                <p><strong>Credits:</strong> ${section.credits}</p>
            `;
            
            // Create the section actions
            const sectionActions = document.createElement('div');
            sectionActions.className = 'section-actions';
            
            // Add "Add to Schedule" button
            const addButton = document.createElement('button');
            addButton.className = 'add-section-btn';
            addButton.textContent = 'Add to Schedule';
            addButton.addEventListener('click', () => {
                addSectionToSchedule(section.subject, section.course_code, section.section_number);
            });
            
            // Add "Search Prerequisites" button
            const prereqButton = document.createElement('button');
            prereqButton.className = 'search-prereq-btn';
            prereqButton.textContent = 'Prerequisites';
            prereqButton.addEventListener('click', () => {
                displayPrerequisiteTree(`${section.subject} ${section.course_code}`);
            });
            
            sectionActions.appendChild(addButton);
            sectionActions.appendChild(prereqButton);
            
            // Assemble the section div
            sectionDiv.appendChild(sectionHeader);
            sectionDiv.appendChild(sectionDetails);
            sectionDiv.appendChild(sectionActions);
            
            // Add the section to the course container
            courseDiv.appendChild(sectionDiv);
        });
        
        // Add the course container to the sections container
        sectionsContainer.appendChild(courseDiv);
    });
    
    console.log(`Displayed ${uniqueSectionIds.size} sections in ${Object.keys(courseGroups).length} courses`);
}

/**
 * Gets the index of a day letter (M, T, W, R, F)
 * @param {string} day - The day letter
 * @returns {number} - The index (0-4)
 */
function getDayIndex(day) {
    const dayMap = {
        'M': 0,
        'T': 1,
        'W': 2,
        'R': 3,
        'F': 4
    };
    return dayMap[day] || -1;
}

/**
 * Returns a random course color from a predefined palette.
 * Ensures the same course always gets the same color.
 * @param {string} courseId - A unique identifier for the course (e.g., "CPSC 121")
 * @returns {string} A color code
 */
function getRandomCourseColor(courseId = null) {
    // Define a palette of visually distinct colors
    const colors = [
        '#4285f4', // Google blue
        '#ea4335', // Google red
        '#fbbc05', // Google yellow
        '#34a853', // Google green
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#84cc16', // Lime
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Emerald
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#f97316', // Orange
        '#a855f7'  // Purple
    ];
    
    console.log(`Getting color for course: ${courseId}`);
    
    // Initialize course color map if it doesn't exist
    if (!window.courseColorMap) {
        window.courseColorMap = new Map();
        console.log("Initialized new course color map");
    }
    
    // If no courseId provided, just return a random color
    if (!courseId) {
        console.log("No courseId provided, returning random color");
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Log current color map for debugging
    console.log("Current course color map:", Array.from(window.courseColorMap.entries()));
    
    // If we already have a color for this course, return that color
    if (window.courseColorMap.has(courseId)) {
        const existingColor = window.courseColorMap.get(courseId);
        console.log(`Retrieved existing color for ${courseId}: ${existingColor}`);
        return existingColor;
    }
    
    // Otherwise, assign a new color
    let selectedColor;
    
    // Get all currently used colors
    const usedColors = Array.from(window.courseColorMap.values());
    console.log("Currently used colors:", usedColors);
    
    // Try to find a color that hasn't been used yet
    const availableColors = colors.filter(color => !usedColors.includes(color));
    console.log("Available unused colors:", availableColors);
    
    if (availableColors.length > 0) {
        // If we have unused colors, pick one randomly
        selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        console.log(`Selected unused color: ${selectedColor}`);
    } else {
        // If all colors are used, pick a random one from the full palette
        selectedColor = colors[Math.floor(Math.random() * colors.length)];
        console.log(`All colors used, selected random color: ${selectedColor}`);
    }
    
    // Store the color for the course
    window.courseColorMap.set(courseId, selectedColor);
    console.log(`Assigned new color for ${courseId}: ${selectedColor}`);
    console.log("Updated course color map:", Array.from(window.courseColorMap.entries()));
    
    return selectedColor;
}

/**
 * Adds a section to the schedule grid
 */
function addSectionToSchedule(subject, courseCode, sectionNumber) {
    console.log(`Adding section to schedule: ${subject} ${courseCode} ${sectionNumber}`);
    
    // Find the section data from our sections array
    const sectionData = findSectionByNumber(subject, courseCode, sectionNumber);
    
    if (!sectionData) {
        console.error(`Section ${sectionNumber} of ${subject} ${courseCode} not found.`);
        showNotification(`Section ${sectionNumber} of ${subject} ${courseCode} not found.`, 'error');
        return;
    }
    
    // Parse the schedule information (days, time)
    const scheduleInfo = sectionData.schedule;
    if (!scheduleInfo || scheduleInfo === 'TBA' || scheduleInfo === 'Not specified') {
        showNotification(`Schedule information not available for ${subject} ${courseCode} ${sectionNumber}.`, 'info');
        return;
    }
    
    // Check if the section is already added
    const existingCourses = document.querySelectorAll('.course-block');
    for (const courseEl of existingCourses) {
        if (courseEl.getAttribute('data-section') === sectionNumber && 
            courseEl.getAttribute('data-course') === `${subject} ${courseCode}`) {
            showNotification(`${subject} ${courseCode} ${sectionNumber} is already in your schedule.`, 'info');
            return;
        }
    }
    
    try {
        // Parse days and time information - improved to handle different formats
        // First split by the first space to separate days from times
        const firstSpaceIndex = scheduleInfo.indexOf(' ');
        if (firstSpaceIndex === -1) {
            showNotification(`Invalid schedule format: ${scheduleInfo}`, 'error');
        return;
    }
    
        const days = scheduleInfo.substring(0, firstSpaceIndex).trim();
        let timeRange = scheduleInfo.substring(firstSpaceIndex + 1).trim();
        
        // Extract start and end times - handle format with or without spaces around hyphen
        // This regex handles formats like "10:00 AM - 10:50 AM", "10:00AM - 10:50AM", or "10:00AM-10:50AM"
        const timeMatch = timeRange.match(/(\d+:\d+\s*(?:AM|PM))\s*-\s*(\d+:\d+\s*(?:AM|PM))/i);
        if (!timeMatch) {
            showNotification(`Could not parse time information: ${timeRange}`, 'error');
            return;
        }
        
        const startTime = timeMatch[1].trim();
        const endTime = timeMatch[2].trim();
        
        // Create a unique course identifier
        const courseKey = `${subject} ${courseCode}`;
        console.log(`Course key for color assignment: ${courseKey}`);
        
        // Get a color for this course - ensure we're using a string that uniquely identifies this course
        const courseColor = getRandomCourseColor(courseKey);
        console.log(`Color assigned for ${courseKey}: ${courseColor}`);
        
        // Add course blocks for each day
        for (const day of days) {
            const dayIndex = getDayIndex(day);
            if (dayIndex === -1) continue;
            
            // Find the start and end times in hours for positioning
            const startHour = parseTimeToHour(startTime);
            const endHour = parseTimeToHour(endTime);
            
            if (isNaN(startHour) || isNaN(endHour)) {
                showNotification(`Invalid time format: ${timeRange}`, 'error');
                return;
            }
            
            // Get the base row for the starting time
            const timeRow = findTimeRow(startTime);
            if (!timeRow) {
                showNotification(`Could not find time slot for ${startTime}`, 'info');
                continue;
            }
            
            // Get column index (day + 1 because first column is time labels)
            const colIndex = dayIndex + 1;
            
            // Get the target cell and prepare to add the course block
            const cell = timeRow.cells[colIndex];
            if (!cell) {
                console.error(`Cell not found for day index ${dayIndex} at time ${startTime}`);
                continue;
            }
            
            // Check if there's already a course in this time slot
            const existingBlock = cell.querySelector('.course-block');
            if (existingBlock) {
                const existingCourse = existingBlock.getAttribute('data-course');
                showNotification(`Time conflict with ${existingCourse}`, 'error');
                return;
            }
            
            // Create a course block
            const courseBlock = document.createElement('div');
            courseBlock.className = 'course-block';
            
            // Ensure we're using the assigned course color
            courseBlock.style.backgroundColor = courseColor;
            console.log(`Setting background color for course block to: ${courseColor}`);
            
            // Calculate exact hour difference for height - precisely scale the block
            const durationHours = endHour - startHour;
            
            // Get row height from a time row to calculate precise height
            const rowHeight = timeRow.offsetHeight;
            
            // Set position and size based on start time and duration
            courseBlock.style.position = 'absolute';
            courseBlock.style.left = '0';
            courseBlock.style.top = '0';
            courseBlock.style.width = '100%';
            
            // Calculate height based on duration - each hour is one row height
            const heightInRows = durationHours;
            courseBlock.style.height = `${heightInRows * 100}%`;
            
            // Store course data as attributes
            courseBlock.setAttribute('data-course', courseKey);
            courseBlock.setAttribute('data-section', sectionNumber);
            
            // Make sure we get the actual credit value
            let creditValue = sectionData.credits;
            // If it's a string like "3.0" or just "3", parse it to a number
            if (typeof creditValue === 'string') {
                creditValue = parseInt(creditValue, 10);
            }
            // If it's still not a valid number, default to 3
            if (isNaN(creditValue) || creditValue <= 0) {
                creditValue = 3;
            }
            
            courseBlock.setAttribute('data-credits', creditValue);
            courseBlock.setAttribute('data-start-time', startTime);
            courseBlock.setAttribute('data-end-time', endTime);
            courseBlock.setAttribute('data-day', day);

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'course-delete-btn';
            deleteButton.innerHTML = '×'; // Using the multiplication symbol as an X
            deleteButton.title = `Remove ${courseKey}`;
            
            // Add delete button click handler
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling to parent
                // Remove all instances of this course across all days
                removeCourseFromSchedule(subject, courseCode, sectionNumber);
            });
            
            // Build HTML content
            const courseContent = `
                <div class="event-name">${courseKey}</div>
                <div class="event-time">${startTime} - ${endTime}</div>
                <div class="event-location">${sectionData.location || 'TBA'}</div>
            `;
            
            // Set inner HTML
            courseBlock.innerHTML = courseContent;
            
            // Append the delete button to the course block
            courseBlock.appendChild(deleteButton);
            
            // Add double-click event to remove course (keeping as alternative)
            courseBlock.addEventListener('dblclick', function() {
                removeCourseFromSchedule(subject, courseCode, sectionNumber, day);
            });
            
            // Add the course block to the cell
            cell.style.position = 'relative'; // Make sure the cell can position absolute children
            cell.appendChild(courseBlock);
            
            // Add highlight animation
            courseBlock.classList.add('highlight-animation');
            setTimeout(() => {
                courseBlock.classList.remove('highlight-animation');
            }, 1500);
            
            // Update total credits
            updateCreditCount();
        
            showNotification(`${courseKey} added to schedule.`, 'success');
        }
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        showNotification('Error adding course to schedule. Please try again.', 'error');
    }
}

/**
 * Removes a course section from the schedule grid
 * @param {string} subject - The course subject
 * @param {string} courseCode - The course code
 * @param {string} sectionNumber - The section number
 * @param {string} day - The day of the course to remove (optional - if provided, only removes that day's instance)
 */
function removeCourseFromSchedule(subject, courseCode, sectionNumber, day = null) {
    const courseKey = `${subject} ${courseCode}`;
    
    // Confirmation message
    const confirmMessage = day 
        ? `Remove ${courseKey} on ${getDayName(day)} from your schedule?`
        : `Remove ${courseKey} from your schedule?`;
    
    if (confirm(confirmMessage)) {
        let removed = false;
        
        // Find all instances of this course section
        const courseBlocks = document.querySelectorAll('.course-block');
        courseBlocks.forEach(block => {
            const blockCourse = block.getAttribute('data-course');
            const blockSection = block.getAttribute('data-section');
            const blockDay = block.getAttribute('data-day');
            
            // If day is specified, only remove that specific day's block
            // Otherwise remove all instances of this section
            if (blockCourse === courseKey && 
                blockSection === sectionNumber && 
                (!day || blockDay === day)) {
                block.remove();
                removed = true;
            }
        });
        
        if (removed) {
            // Update the credit count
            updateCreditCount();
            
            // Check if all instances of this course are removed
            const remainingBlocks = document.querySelectorAll(`.course-block[data-course="${courseKey}"]`);
            if (remainingBlocks.length === 0 && window.courseColorMap) {
                // If no more instances of this course exist, remove its color mapping
                window.courseColorMap.delete(courseKey);
            }
            
            // Show notification
            const dayText = day ? ` on ${getDayName(day)}` : '';
            showNotification(`${courseKey} removed from schedule${dayText}.`, 'info');
        }
    }
}

/**
 * Gets the full name of a day from its letter code
 * @param {string} day - The day letter (M, T, W, R, F)
 * @returns {string} - The full day name
 */
function getDayName(day) {
    const dayNames = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday'
    };
    return dayNames[day] || day;
}

// Add style for highlight animation
if (!document.getElementById('highlight-animation-style')) {
    const style = document.createElement('style');
    style.id = 'highlight-animation-style';
    style.textContent = `
        @keyframes highlight-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        .highlight-animation {
            animation: highlight-pulse 1.5s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Updates the credit count displayed in the UI
 */
function updateCreditCount() {
    // Get all course blocks in the grid
    const courseBlocks = document.querySelectorAll('.course-block');
    
    // Track unique courses and their credit values
    const courseCredits = new Map();
    
    // Process each course block
    courseBlocks.forEach(block => {
        const course = block.getAttribute('data-course');
        const section = block.getAttribute('data-section');
        
        // Create a unique key for this course section
        const courseKey = `${course}-${section}`;
        
        // Skip if we've already counted this course section
        if (courseCredits.has(courseKey)) {
            return;
        }
        
        // Get credits from data attribute (defaulting to 3 if not specified)
        let credits = block.getAttribute('data-credits');
        
        // Convert credits to a number
        if (credits) {
            // Handle credits stored as strings (e.g., "3", "4", etc.)
            credits = parseInt(credits, 10);
            
            // If parsing failed, use 3 as default
            if (isNaN(credits)) {
                credits = 3;
            }
        } else {
            // Default to 3 credits if not specified
            credits = 3;
        }
        
        // Store the credits for this course
        courseCredits.set(courseKey, credits);
    });
    
    // Calculate total credits
    let totalCredits = 0;
    courseCredits.forEach(credits => {
        totalCredits += credits;
    });
    
    // Update the credit display
    const creditDisplay = document.querySelector('.credits-display');
    if (creditDisplay) {
        creditDisplay.textContent = `${totalCredits} Credits`;
        
        // Optional: Add custom styling based on credit load
        if (totalCredits > 18) {
            creditDisplay.style.color = '#dc3545'; // Red for overload warning
        } else if (totalCredits >= 15) {
            creditDisplay.style.color = '#28a745'; // Green for full load
        } else {
            creditDisplay.style.removeProperty('color'); // Default color
        }
    }
    
    console.log(`Credit count updated: ${totalCredits} credits (${courseCredits.size} unique courses)`);
}

/**
 * Displays a notification message to the user.
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Prevent recursive calls that could cause stack overflow
    if (window._isShowingNotification) {
        console.log('Prevented recursive notification:', message);
        return;
    }
    
    try {
        window._isShowingNotification = true;
        
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }
        
        // Create the notification element
        const notification = document.createElement('div');
        notification.style.margin = '10px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'space-between';
        notification.style.fontSize = '14px';
        notification.style.transition = 'transform 0.3s, opacity 0.3s';
        notification.style.animation = 'slideIn 0.3s forwards';
        
        // Set type-specific styles
        if (type === 'success') {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderLeft = '5px solid #28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderLeft = '5px solid #dc3545';
        } else {
            notification.style.backgroundColor = '#e7f5ff';
            notification.style.color = '#1864ab';
            notification.style.borderLeft = '5px solid #4dabf7';
        }
        
        // Add the message
        notification.innerHTML = `
            <span>${message}</span>
            <button style="background: none; border: none; margin-left: 15px; cursor: pointer; font-size: 16px; opacity: 0.7;">×</button>
        `;
        
        // Add click handler to close button
        notification.querySelector('button').addEventListener('click', function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode === notificationContainer) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(30px)';
                
                setTimeout(() => {
                    if (notification.parentNode === notificationContainer) {
                        notificationContainer.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        // Add animation styles if not already added
        if (!document.querySelector('style#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.innerHTML = `
                @keyframes slideIn {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to container
        notificationContainer.appendChild(notification);
    } finally {
        // Always reset the flag
        window._isShowingNotification = false;
    }
}

/**
 * Displays mock sections data for testing
 */
function displayMockSections() {
    // Import mock sections data (this should be defined in a separate file)
    const mockSections = [
        {
            subject: "CPSC",
            course_code: "121",
            section_number: "01",
            schedule: "MWF 10:00 AM - 11:00 AM",
            instructor: "John Doe",
            location: "Herak 201",
            credits: 3,
            seats_available: 10,
            total_seats: 30
        },
        {
            subject: "CPSC",
            course_code: "121",
            section_number: "02",
            schedule: "TR 1:00 PM - 2:15 PM",
            instructor: "Jane Smith",
            location: "Herak 202",
            credits: 3,
            seats_available: 0,
            total_seats: 25
        }
    ];
    
    // Display the mock sections
    displaySections(mockSections);
}

/**
 * Adds an event from the event form to the schedule
 */
function addEventFromForm() {
    try {
        console.log("Adding event from form");
        
        // Get values from the form in the RecurringEvents tab
        const eventName = document.querySelector('#RecurringEvents input[placeholder="Event Name"]').value.trim();
        const eventLocation = document.querySelector('#RecurringEvents input[placeholder="Location (optional)"]').value.trim();
        const startTime = document.querySelector('#RecurringEvents input[type="time"][placeholder="Start Time"]').value;
        const endTime = document.querySelector('#RecurringEvents input[type="time"][placeholder="End Time"]').value;
        
        console.log("Form values:", { eventName, eventLocation, startTime, endTime });
        
        // Validate inputs
        if (!eventName) {
            showNotification("Please enter an event name", "error");
            return;
        }
        
        if (!startTime || !endTime) {
            showNotification("Please enter both start and end times", "error");
            return;
        }
        
        // Get selected days
        const selectedDays = [];
        document.querySelectorAll('#RecurringEvents .weekday-btn.selected').forEach(btn => {
            selectedDays.push(btn.textContent.trim());
        });
        
        console.log("Selected days:", selectedDays);
        
        if (selectedDays.length === 0) {
            showNotification("Please select at least one day for your event", "error");
            return;
        }
        
        // Format times for display
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const [hours, minutes] = timeStr.split(':');
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${minutes} ${ampm}`;
        };
        
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);
        
        console.log("Formatted times:", { formattedStartTime, formattedEndTime });
        
        // Convert to grid hours
        const startHour = parseTimeToHour(formattedStartTime);
        const endHour = parseTimeToHour(formattedEndTime);
        
        console.log("Grid hours:", { startHour, endHour });
        
        if (startHour >= endHour) {
            showNotification("End time must be after start time", "error");
            return;
        }
        
        // Get a random color for the event
        const color = getRandomCourseColor();
        
        // Make sure we're viewing the registration view with schedule grid
        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'block';
        }
        
        // Add the event to the schedule grid for each selected day
        selectedDays.forEach(day => {
            const dayIndex = getDayIndex(day);
            if (dayIndex !== -1) {
                addCourseToGrid(
                    dayIndex,
                    startHour,
                    endHour,
                    eventName,
                    eventLocation || "N/A",
                    "Personal Event",
                    color
                );
            }
        });
        
        // Show success message
        showNotification(`Added "${eventName}" to your schedule`, "success");
        
        // Clear the form
        document.querySelector('#RecurringEvents input[placeholder="Event Name"]').value = "";
        document.querySelector('#RecurringEvents input[placeholder="Location (optional)"]').value = "";
        document.querySelector('#RecurringEvents input[type="time"][placeholder="Start Time"]').value = "";
        document.querySelector('#RecurringEvents input[type="time"][placeholder="End Time"]').value = "";
        
        // Clear selected days
        document.querySelectorAll('#RecurringEvents .weekday-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        
    } catch (error) {
        console.error("Error adding event from form:", error);
        showNotification("Error adding event: " + error.message, "error");
    }
}

/**
 * Shows an edit dialog for an existing event on the schedule.
 * @param {HTMLElement} eventBlock - The event block element to edit
 */
function editEventOnSchedule(eventBlock) {
    try {
        console.log('Opening edit dialog for event:', eventBlock);
        
        // Extract current event details
        const eventName = eventBlock.querySelector('.event-name').textContent.trim();
        const eventLocation = eventBlock.querySelector('.course-location') ? 
                             eventBlock.querySelector('.course-location').textContent.trim() : '';
        const instructorOrType = eventBlock.querySelector('.course-instructor') ? 
                               eventBlock.querySelector('.course-instructor').textContent.trim() : '';
        
        // Get the time information from data attributes
        const startTime = eventBlock.dataset.startTime || '10:00 AM';
        const endTime = eventBlock.dataset.endTime || '11:00 AM';
        
        // Find which day this event is on
        let eventDay = '';
        const cell = eventBlock.closest('td');
        if (cell) {
            const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
            // First column is time, so subtract 1 for day index
            const dayIndex = cellIndex - 1;
            const days = ['M', 'T', 'W', 'R', 'F'];
            if (dayIndex >= 0 && dayIndex < days.length) {
                eventDay = days[dayIndex];
            }
        }
        
        // Create modal dialog
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'edit-dialog';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.zIndex = '1000';
        
        // Convert display times (12h format) to input format (24h)
        const convertTo24Hour = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            
            if (period === 'PM' && hour < 12) {
                hour += 12;
            } else if (period === 'AM' && hour === 12) {
                hour = 0;
            }
            
            return `${hour.toString().padStart(2, '0')}:${minutes}`;
        };
        
        // Try to convert times to 24h format for the inputs
        let startTime24 = '';
        let endTime24 = '';
        try {
            startTime24 = convertTo24Hour(startTime);
            endTime24 = convertTo24Hour(endTime);
        } catch (e) {
            console.error('Error converting times:', e);
            // Default values if conversion fails
            startTime24 = '10:00';
            endTime24 = '11:00';
        }
        
        // Create edit form content
        modalOverlay.innerHTML = `
            <div class="edit-form" style="background: white; padding: 20px; border-radius: 8px; width: 350px; max-width: 90%;">
                <h3 style="margin-top: 0; color: #142A50;">Edit Event</h3>
                
                <div style="margin-bottom: 15px;">
                    <label for="edit-event-name" style="display: block; margin-bottom: 5px; font-weight: 500;">Event Name</label>
                    <input id="edit-event-name" type="text" value="${eventName}" style="width: 100%; padding: 8px; border: 1px solid #e0e4e8; border-radius: 4px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label for="edit-event-location" style="display: block; margin-bottom: 5px; font-weight: 500;">Location</label>
                    <input id="edit-event-location" type="text" value="${eventLocation}" style="width: 100%; padding: 8px; border: 1px solid #e0e4e8; border-radius: 4px;">
                </div>
                
                <div style="margin-bottom: 15px; display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label for="edit-start-time" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                        <input id="edit-start-time" type="time" value="${startTime24}" style="width: 100%; padding: 8px; border: 1px solid #e0e4e8; border-radius: 4px;">
                    </div>
                    <div style="flex: 1;">
                        <label for="edit-end-time" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                        <input id="edit-end-time" type="time" value="${endTime24}" style="width: 100%; padding: 8px; border: 1px solid #e0e4e8; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Day</label>
                    <div class="weekday-buttons" style="display: flex; gap: 8px;">
                        <button class="weekday-btn ${eventDay === 'M' ? 'selected' : ''}" data-day="M" style="flex: 1; padding: 8px; border: 1px solid #e0e4e8; background: ${eventDay === 'M' ? '#4A90E2' : 'white'}; color: ${eventDay === 'M' ? 'white' : '#333'}; border-radius: 4px; cursor: pointer;">M</button>
                        <button class="weekday-btn ${eventDay === 'T' ? 'selected' : ''}" data-day="T" style="flex: 1; padding: 8px; border: 1px solid #e0e4e8; background: ${eventDay === 'T' ? '#4A90E2' : 'white'}; color: ${eventDay === 'T' ? 'white' : '#333'}; border-radius: 4px; cursor: pointer;">T</button>
                        <button class="weekday-btn ${eventDay === 'W' ? 'selected' : ''}" data-day="W" style="flex: 1; padding: 8px; border: 1px solid #e0e4e8; background: ${eventDay === 'W' ? '#4A90E2' : 'white'}; color: ${eventDay === 'W' ? 'white' : '#333'}; border-radius: 4px; cursor: pointer;">W</button>
                        <button class="weekday-btn ${eventDay === 'R' ? 'selected' : ''}" data-day="R" style="flex: 1; padding: 8px; border: 1px solid #e0e4e8; background: ${eventDay === 'R' ? '#4A90E2' : 'white'}; color: ${eventDay === 'R' ? 'white' : '#333'}; border-radius: 4px; cursor: pointer;">R</button>
                        <button class="weekday-btn ${eventDay === 'F' ? 'selected' : ''}" data-day="F" style="flex: 1; padding: 8px; border: 1px solid #e0e4e8; background: ${eventDay === 'F' ? '#4A90E2' : 'white'}; color: ${eventDay === 'F' ? 'white' : '#333'}; border-radius: 4px; cursor: pointer;">F</button>
                    </div>
                </div>
                
                <div class="edit-buttons" style="display: flex; gap: 10px;">
                    <button id="cancel-edit" style="flex: 1; padding: 10px; border: none; background: #e0e4e8; color: #495057; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="save-edit" style="flex: 1; padding: 10px; border: none; background: #4A90E2; color: white; border-radius: 4px; cursor: pointer;">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Add event listeners to the day buttons in the edit modal
        modalOverlay.querySelectorAll('.weekday-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove selected class from all buttons
                modalOverlay.querySelectorAll('.weekday-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.backgroundColor = 'white';
                    b.style.color = '#333';
                });
                
                // Add selected class to clicked button
                this.classList.add('selected');
                this.style.backgroundColor = '#4A90E2';
                this.style.color = 'white';
            });
        });
        
        // Handle cancel button
        const cancelButton = modalOverlay.querySelector('#cancel-edit');
        cancelButton.addEventListener('click', function() {
            modalOverlay.remove();
        });
        
        // Handle save button
        const saveButton = modalOverlay.querySelector('#save-edit');
        saveButton.addEventListener('click', function() {
            // Get updated values
            const updatedName = modalOverlay.querySelector('#edit-event-name').value;
            const updatedLocation = modalOverlay.querySelector('#edit-event-location').value;
            const updatedStartTime = modalOverlay.querySelector('#edit-start-time').value;
            const updatedEndTime = modalOverlay.querySelector('#edit-end-time').value;
            
            // Format times for display (24h to 12h)
            const formatTimeFrom24h = (timeStr) => {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
            };
            
            const formattedStartTime = formatTimeFrom24h(updatedStartTime);
            const formattedEndTime = formatTimeFrom24h(updatedEndTime);
            
            // Get selected day
            const selectedDayButton = modalOverlay.querySelector('.weekday-btn.selected');
            const newDay = selectedDayButton ? selectedDayButton.getAttribute('data-day') : eventDay;
            
            // Get the new day index
            const newDayIndex = getDayIndex(newDay);
            
            // Calculate grid hours
            const newStartHour = parseTimeToHour(formattedStartTime);
            const newEndHour = parseTimeToHour(formattedEndTime);
            
            // Validate inputs
            if (!updatedName.trim()) {
                showNotification("Event name cannot be empty", "error");
                return;
            }
            
            if (newStartHour >= newEndHour) {
                showNotification("End time must be after start time", "error");
                return;
            }
            
            // Remove the old event from the grid
            eventBlock.remove();
            
            // Add the new event with updated information
            const color = eventBlock.style.backgroundColor || getRandomCourseColor();
            
            addCourseToGrid(
                newDayIndex,
                newStartHour,
                newEndHour,
                updatedName,
                updatedLocation,
                instructorOrType,
                color
            );
            
            // Close the modal
            modalOverlay.remove();
            
            // Show success notification
            showNotification("Event updated successfully", "success");
            
            // Adjust the grid if the day changed
            if (newDay !== eventDay) {
                resetScheduleGrid();
            }
        });
        
    } catch (error) {
        console.error('Error editing event:', error);
        showNotification("Error editing event: " + error.message, "error");
    }
}

// Make showNotification function globally available
window.showNotification = showNotification;

// Export the fetchData function to make it globally available
window.fetchData = fetchData;

// Initialize when the document loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Course module initialized');

    // Check backend connection
    checkBackendConnection();
    
    // Add event listener to search button
    const searchBtn = document.querySelector('#Courses .search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', fetchData);
        console.log('Search button event listener added');
    } else {
        console.warn('Search button not found in the DOM');
    }
    
    // Add event listener for the "Add Event" button in the Events tab
    const addEventButton = document.querySelector('#RecurringEvents .search-btn');
    console.log('Found add event button:', addEventButton);
    
    if (addEventButton) {
        addEventButton.addEventListener('click', addEventFromForm);
        console.log('Added event listener to "Add Event" button');
    } else {
        console.error('Could not find the "Add Event" button');
    }
    
    // Set up event listeners for day selection buttons
    document.querySelectorAll('#RecurringEvents .weekday-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Add event listeners for enter key on input fields
    const inputFields = document.querySelectorAll('#Courses input[type="text"]');
    inputFields.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                fetchData();
            }
        });
    });
    
    console.log('Course module initialization complete');
});

// Make addEventFromForm globally available
window.addEventFromForm = addEventFromForm;

// Make editEventOnSchedule globally available
window.editEventOnSchedule = editEventOnSchedule;

// Helper function to construct query string from criteria object
function constructQueryString(criteria) {
    if (!criteria || Object.keys(criteria).length === 0) {
        return '';
    }
    
    const params = new URLSearchParams();
    
    Object.entries(criteria).forEach(([key, value]) => {
        if (value) {
            params.append(key, value);
        }
    });
    
    return `?${params.toString()}`;
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error)
 */
function showToast(message, type = 'success') {
    // Check if we have a showNotification function available
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }
    
    console.log(`Toast notification: ${message} (${type})`);
    
    // Create a simple toast element if we don't have a notification system
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// Find any test course button or element and remove it
const testCourseButton = document.querySelector('.add-test-course-btn');
if (testCourseButton) {
    testCourseButton.remove();
}

// Remove any test course functions or references
function addTestCourseToSchedule() {
    // Remove this entire function
}

// Remove any event listeners for test course buttons
document.removeEventListener('click', function(e) {
    if (e.target.matches('.add-test-course-btn')) {
        addTestCourseToSchedule();
    }
});

function findTimeRow(timeText) {
    try {
        // Parse the time text into a standardized format
        const timeParts = timeText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
        if (!timeParts) return null;
        
        let hours = parseInt(timeParts[1], 10);
        const minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
        const period = timeParts[3] ? timeParts[3].toUpperCase() : null;
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // The time in total minutes since midnight
        const totalMinutes = hours * 60 + minutes;
        
        // Get all time cells from the schedule grid
        const timeRows = Array.from(document.querySelectorAll('.schedule-grid tbody tr'));
        if (!timeRows.length) {
            console.error('No time rows found in schedule grid');
            return null;
        }
        
        // First try to find exact hour match
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                // Convert to 24-hour format
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                // Direct match for the hour
                if (cellHours === hours && Math.abs(cellMinutes - minutes) < 15) {
                    console.log(`Found exact time match: ${cellText} for ${timeText}`);
                    return row;
                }
            }
        }
        
        // If no exact match, find the closest row that's before or at our start time
        let closestRow = null;
        let smallestDifference = Infinity;
        
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                // Convert to 24-hour format
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                // Find row that's at or before our target time
                if (cellTotalMinutes <= totalMinutes) {
                    const difference = totalMinutes - cellTotalMinutes;
                    
                    // If this is the closest one so far, update our selection
                    if (difference < smallestDifference) {
                        smallestDifference = difference;
                        closestRow = row;
                    }
                }
            }
        }
        
        // If we found a close match, log it
        if (closestRow) {
            const timeCell = closestRow.querySelector('td:first-child');
            console.log(`Found closest time match: ${timeCell.textContent.trim()} for ${timeText} (difference: ${smallestDifference} minutes)`);
        } else {
            console.warn(`No suitable time row found for ${timeText}`);
        }
        
        return closestRow;
    } catch (error) {
        console.error('Error finding time row:', error);
        return null;
    }
}

/**
 * Finds a section by its subject, course code and section number
 * @param {string} subject - The course subject code (e.g., 'CPSC')
 * @param {string} courseCode - The course number (e.g., '121')
 * @param {string} sectionNumber - The section number (e.g., '01')
 * @returns {Object|null} - The section data or null if not found
 */
function findSectionByNumber(subject, courseCode, sectionNumber) {
    // Check if we have sections data available
    if (!window.sectionsData || !Array.isArray(window.sectionsData)) {
        console.error('No sections data available');
        return null;
    }
    
    // Find the section that matches all three criteria
    const section = window.sectionsData.find(s => 
        s.subject === subject && 
        s.course_code === courseCode && 
        s.section_number === sectionNumber
    );
    
    if (!section) {
        console.log(`Section not found: ${subject} ${courseCode} ${sectionNumber}`);
        console.log('Available sections:', window.sectionsData);
    }
    
    return section;
}

/**
 * Parses a time string into a decimal hour value
 * @param {string} timeString - Time string (e.g., "10:30 AM", "1:45PM")
 * @returns {number} - Time as a decimal hour (e.g., 10.5)
 */
function parseTimeToHour(timeString) {
    try {
        // Normalize the time string by removing extra spaces and ensuring proper format
        let normalizedTime = timeString.trim().replace(/\s+/g, ' ');
        
        // Handle format without space between time and AM/PM (e.g., "10:30AM")
        normalizedTime = normalizedTime.replace(/(\d+:\d+)([AaPp][Mm])/, '$1 $2');
        
        // Parse hours, minutes, and period
        const timeMatch = normalizedTime.match(/(\d+):(\d+)\s*([AaPp][Mm])?/i);
        if (!timeMatch) return NaN;
        
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        // Return hours as decimal (e.g., 10:30 becomes 10.5)
        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing time:', error, timeString);
        return NaN;
    }
}