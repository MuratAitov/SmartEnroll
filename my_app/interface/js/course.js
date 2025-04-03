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
    console.log('Checking backend connection...');
    
    // Reset connection indicator to "Checking..."
    const connectionIndicator = document.getElementById('connection-indicator');
    if (connectionIndicator) {
        connectionIndicator.textContent = 'Checking...';
        connectionIndicator.style.backgroundColor = '#f0f0f0';
        connectionIndicator.style.color = '#666';
    }
    
    // Try to connect to the backend API - use correct endpoint
    fetch('/sections_bp')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`Server responded with status: ${response.status}`);
        })
        .then(data => {
            console.log('Backend connection successful:', data);
            
            // Update the connection status indicator
            if (connectionIndicator) {
                connectionIndicator.textContent = 'Connected';
                connectionIndicator.style.backgroundColor = '#d4edda';
                connectionIndicator.style.color = '#155724';
            }
            
            // Setup autocomplete for instructors
            setupInstructorAutocomplete();
        })
        .catch(error => {
            console.error('Backend connection failed:', error);
            
            // Log detailed error for debugging
            console.warn('Will retry connecting to the real backend...');
            
            // Make another attempt with a different endpoint
            fetch('/')
    .then(response => {
        if (response.ok) {
                        if (connectionIndicator) {
                            connectionIndicator.textContent = 'Connected';
                            connectionIndicator.style.backgroundColor = '#d4edda';
                            connectionIndicator.style.color = '#155724';
                        }
                        console.log('Connected to backend root endpoint successfully');
                        setupInstructorAutocomplete();
        } else {
                        throw new Error('Failed to connect to backend root endpoint');
                    }
                })
                .catch(finalError => {
                    console.error('Final backend connection attempt failed:', finalError);
                    
                    // Update the connection status indicator
                    if (connectionIndicator) {
                        connectionIndicator.textContent = 'Disconnected';
                        connectionIndicator.style.backgroundColor = '#f8d7da';
                        connectionIndicator.style.color = '#721c24';
                    }
                    
                    // Display error message
                    displayConnectionError();
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
 * Displays a connection error message in the courses list.
 */
function displayConnectionError() {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;
    
    coursesList.innerHTML = '';
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #721c24; background-color: #f8d7da; border-radius: 4px;">
            <h3>Connection Error</h3>
            <p>Could not connect to the backend server. Please check that:</p>
            <ul style="text-align: left; padding-left: 20px;">
                <li>The Flask server is running on port 5001</li>
                <li>The courses_bp endpoint is correctly defined</li>
                <li>There are no CORS issues blocking the connection</li>
            </ul>
            <button onclick="checkBackendConnection()" style="margin-top: 10px; padding: 8px 16px; background-color: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry Connection
            </button>
        </div>
    `;
    coursesList.appendChild(errorMessage);
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
    // For development, we might choose to use mock data or real data
    const useMockData = false; // Set to false to use real API
    
    if (useMockData) {
        const sections = createMockSectionsBasedOnCriteria(criteria);
        // Store sections data globally for reference by other functions
        window.sectionsData = sections;
        displaySections(sections);
    } else {
        fetchSectionsReal(criteria);
    }
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
    
    // Make API request
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
            
            // Check backend connection and show appropriate error
            checkBackendConnection()
                .then(isConnected => {
                    if (!isConnected) {
                        displayConnectionError();
                    } else {
                        // If connected but still error, show generic error
                        const sectionsList = document.getElementById('sections-list');
                        if (sectionsList) {
                            sectionsList.innerHTML = '<div class="error">An error occurred while fetching sections. Please try again.</div>';
                        }
                    }
                });
        });
}

/**
 * Creates mock section data based on search criteria for testing
 * @param {Object} criteria - Search criteria
 * @returns {Array} - Array of mock section objects
 */
function createMockSectionsBasedOnCriteria(criteria) {
    const mockSections = [];
    const subjects = criteria.subject ? [criteria.subject] : ['CPSC', 'MATH', 'CHEM', 'ENGL', 'HIST'];
    const courseCodes = criteria.course_code ? [criteria.course_code] : ['121', '122', '221', '223', '260', '321', '101', '102'];
    
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
                
                // Create mock section
                const mockSection = {
                    subject: subject,
                    course_code: courseCode,
                    section_number: sectionNumber,
                    schedule: `${days} ${startTime} - ${endTime}`,
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
    
    // Ensure we're storing this mock data globally
    window.sectionsData = mockSections;
    
    return mockSections;
}

/**
 * Displays the fetched sections in the UI
 * @param {Array} sections - Array of section objects
 */
function displaySections(sections) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) {
        console.error('Sections list container not found');
        return;
    }
    
    // Clear previous sections
    sectionsList.innerHTML = '';
    
    if (!sections || sections.length === 0) {
        sectionsList.innerHTML = '<p class="no-results">No sections found. Try different search criteria.</p>';
        return;
    }
    
    // Group sections by course
    const courseGroups = {};
    sections.forEach(section => {
        const courseKey = `${section.subject} ${section.course_code}`;
        if (!courseGroups[courseKey]) {
            courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(section);
    });
    
    // Create section items for each course
    Object.keys(courseGroups).forEach(courseKey => {
        const courseSections = courseGroups[courseKey];
        
        // Create course group header
        const courseHeader = document.createElement('div');
        courseHeader.className = 'course-header';
        courseHeader.innerHTML = `
            <h3>${courseKey}</h3>
            <p class="section-count">${courseSections.length} section${courseSections.length !== 1 ? 's' : ''}</p>
        `;
        sectionsList.appendChild(courseHeader);
        
        // Create section items
        courseSections.forEach(section => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';
            
            // Determine seat availability status
            let availabilityClass = 'available';
            let availabilityText = 'Available';
            
            if (section.seats_available === 0) {
                availabilityClass = 'full';
                availabilityText = 'Full';
            } else if (section.seats_available < 5) {
                availabilityClass = 'limited';
                availabilityText = 'Limited';
            }
            
            // Format location
            const location = section.location || 'TBA';
            
            // Create the HTML for the section item
            sectionItem.innerHTML = `
                <div class="section-header">
                    <h4>Section ${section.section_number}</h4>
                    <span class="availability ${availabilityClass}">${availabilityText}</span>
                </div>
                <div class="section-details">
                    <p><strong>Schedule:</strong> ${section.schedule || 'TBA'}</p>
                    <p><strong>Instructor:</strong> ${section.instructor || 'TBA'}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Credits:</strong> ${section.credits || '3'}</p>
                    <p><strong>Seats:</strong> ${section.seats_available}/${section.total_seats}</p>
                </div>
                <div class="section-actions">
                    <button class="add-section-btn" data-subject="${section.subject}" data-course-code="${section.course_code}" data-section="${section.section_number}">
                        Add to Schedule
                    </button>
                    <button class="search-prereq-btn" data-course="${section.subject} ${section.course_code}">
                        View Prerequisites
                    </button>
                </div>
            `;
            
            sectionsList.appendChild(sectionItem);
        });
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-section-btn').forEach(button => {
        button.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            const courseCode = this.getAttribute('data-course-code');
            const sectionNumber = this.getAttribute('data-section');
            
            // Call the function to add this section to schedule
            addSectionToSchedule(subject, courseCode, sectionNumber);
        });
    });
    
    document.querySelectorAll('.search-prereq-btn').forEach(button => {
        button.addEventListener('click', function() {
            const courseCode = this.getAttribute('data-course');
            displayPrerequisiteTree(courseCode);
        });
    });
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
        
        // Get a random color for this course
        const courseColor = getRandomCourseColor();
        
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
            courseBlock.style.backgroundColor = courseColor;
            
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
            courseBlock.setAttribute('data-course', `${subject} ${courseCode}`);
            courseBlock.setAttribute('data-section', sectionNumber);
            courseBlock.setAttribute('data-credits', sectionData.credits || '3');
            courseBlock.setAttribute('data-start-time', startTime);
            courseBlock.setAttribute('data-end-time', endTime);
            courseBlock.setAttribute('data-day', day);

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'course-delete-btn';
            deleteButton.innerHTML = '×'; // Using the multiplication symbol as an X
            deleteButton.title = `Remove ${subject} ${courseCode}`;
            
            // Add delete button click handler
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling to parent
                // Remove all instances of this course across all days
                removeCourseFromSchedule(subject, courseCode, sectionNumber);
            });
            
            // Add course information
            courseBlock.innerHTML = `
                <div class="event-name">${subject} ${courseCode}</div>
                <div class="event-time">${startTime} - ${endTime}</div>
                <div class="event-location">${sectionData.location || 'TBA'}</div>
            `;
            
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
            
            showNotification(`${subject} ${courseCode} added to schedule.`, 'success');
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
    // Confirmation message
    const confirmMessage = day 
        ? `Remove ${subject} ${courseCode} on ${getDayName(day)} from your schedule?`
        : `Remove ${subject} ${courseCode} from your schedule?`;
    
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
            if (blockCourse === `${subject} ${courseCode}` && 
                blockSection === sectionNumber && 
                (!day || blockDay === day)) {
                block.remove();
                removed = true;
            }
        });
        
        if (removed) {
            // Update the credit count
            updateCreditCount();
            
            // Show notification
            const dayText = day ? ` on ${getDayName(day)}` : '';
            showNotification(`${subject} ${courseCode} removed from schedule${dayText}.`, 'info');
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
 * Returns a random course color from a predefined palette.
 * @returns {string} A color code
 */
function getRandomCourseColor() {
    const colors = [
        '#4285f4', '#ea4335', '#fbbc05', '#34a853',  // Google colors
        '#3b82f6', '#ef4444', '#f59e0b', '#10b981',  // Tailwind colors
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',  // More Tailwind colors
    ];
    
    // Track used colors to avoid repeats when possible
    if (!window.usedColors) {
        window.usedColors = [];
    }
    
    // If all colors have been used, reset the used colors array
    if (window.usedColors.length >= colors.length) {
        window.usedColors = [];
    }
    
    // Find an unused color
    const availableColors = colors.filter(color => !window.usedColors.includes(color));
    const selectedColor = availableColors.length > 0 
        ? availableColors[Math.floor(Math.random() * availableColors.length)]
        : colors[Math.floor(Math.random() * colors.length)];
    
    // Add to used colors
    window.usedColors.push(selectedColor);
    
    return selectedColor;
}

/**
 * Updates the credit count displayed in the UI
 */
function updateCreditCount() {
    // Count the course blocks in the grid that aren't duplicates of the same course
    const courseBlocks = document.querySelectorAll('.course-block');
    const courseSet = new Set();
    
    // Track courses by their title to avoid double-counting
    courseBlocks.forEach(block => {
        const courseTitle = block.querySelector('.course-title')?.textContent;
        if (courseTitle) {
            courseSet.add(courseTitle);
        }
    });
    
    // Simple estimate: 3 credits per course (you might want to fetch actual credit values)
    const creditCount = courseSet.size * 3;
    
    // Update the credit display
    const creditDisplay = document.querySelector('.credits-display');
    if (creditDisplay) {
        creditDisplay.textContent = `${creditCount} Credits`;
    }
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
    
    if (criteria.subject) {
        params.append('subject', criteria.subject);
    }
    
    if (criteria.course_code) {
        params.append('course_code', criteria.course_code);
    }
    
    if (criteria.instructor) {
        params.append('instructor', criteria.instructor);
    }
    
    if (criteria.attribute) {
        params.append('attribute', criteria.attribute);
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
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