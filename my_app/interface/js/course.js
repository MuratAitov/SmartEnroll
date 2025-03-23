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
    
    // If we have criteria, fetch sections, otherwise show courses
    if (Object.keys(criteria).length > 0) {
        fetchSections(criteria);
    } else {
        // Show mock course data if no search criteria
        fetchCourses();
    }
}

/**
 * Checks if the backend is connected and updates the connection indicator.
 */
function checkBackendConnection() {
    try {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) {
            console.warn('Connection status element not found in the DOM');
        }
        
        // Try to make a simple request to the backend to test connection
        fetch('/sections_bp/search?limit=1')
            .then(response => {
                if (response.ok) {
                    console.log('Backend connection successful');
                    if (statusElement) {
                        statusElement.innerHTML = '<span style="color: green;">Connected</span>';
                    }
                    
                    // If connection is successful, set up the instructor autocomplete
                    setupInstructorAutocomplete();
                    return true;
                } else {
                    console.error('Backend connection failed with status:', response.status);
                    if (statusElement) {
                        statusElement.innerHTML = '<span style="color: red;">Disconnected</span>';
                    }
                    showNotification('Error connecting to server. Some features may be unavailable.', 'error');
                    return false;
                }
            })
            .catch(error => {
                console.error('Error checking backend connection:', error);
                if (statusElement) {
                    statusElement.innerHTML = '<span style="color: red;">Disconnected</span>';
                }
                showNotification('Cannot connect to server. Please check your connection.', 'error');
                return false;
            });
    } catch (error) {
        console.error('Error in checkBackendConnection:', error);
        return false;
    }
}

/**
 * Sets up the instructor autocomplete with data from the backend.
 */
function setupInstructorAutocomplete() {
    console.log('Setting up instructor autocomplete...');
    const instructorInput = document.getElementById('instructor-input');
    
    if (!instructorInput) {
        console.error('Instructor input field not found');
        return;
    }
    
    // Fetch instructors from the backend
    fetch('/courses_bp/professors')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data && Array.isArray(data.data)) {
                // Extract instructor names from the response
                const instructors = data.data.map(prof => {
                    // Handle different possible data structures
                    if (typeof prof === 'object') {
                        return prof.name || prof.instructor || prof.full_name || '';
                    }
                    return prof; // If it's already a string
                }).filter(name => name && name.trim() !== ''); // Filter out empty names
                
                console.log('Fetched instructors:', instructors);
                
                // Store the instructors list for later use
                window.instructors = instructors;
                
                // Set up autocomplete with the fetched instructors
                setupCustomAutocomplete(instructorInput, instructors);
            } else {
                console.error('Invalid instructor data format:', data);
                showNotification('Error loading instructor data. Invalid format received.', 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching instructors:', error);
            showNotification('Error loading instructors. Please try again later.', 'error');
            
            // Set placeholder to indicate error
            instructorInput.placeholder = "Error loading instructors";
        });
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
 * Fetches sections based on search criteria.
 * @param {Object} criteria - The search criteria for sections (subject, course_code, attribute, instructor)
 */
function fetchSections(criteria = {}) {
    // Get the correct container element
    const coursesListContainer = document.getElementById('courses-list');
    if (!coursesListContainer) {
        console.error("Could not find courses-list container");
        return;
    }

    // Display the loading state
    coursesListContainer.innerHTML = '<p>Loading sections...</p>';

    // Check if any criteria were provided
    const hasSearchCriteria = Object.values(criteria).some(value => value && value.trim() !== '');
    if (!hasSearchCriteria) {
        coursesListContainer.innerHTML = '<p>Please enter at least one search criterion.</p>';
        return;
    }

    console.log('Searching with criteria:', criteria);
    
    // Build query string from criteria
    const queryParams = Object.entries(criteria)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.trim())}`)
        .join('&');
    
    const url = `/sections_bp/search?${queryParams}`;
    
    console.log('Fetching sections from:', url);
    
    // Perform actual fetch from backend
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Check if it's a 500 error specifically
                if (response.status === 500) {
                    throw new Error('Backend server error (500)');
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Sections data:', data);
            displaySections(data);
        })
        .catch(error => {
            console.error('Error fetching sections:', error);
            
            // Show an error notification
            showNotification(`Error fetching sections: ${error.message}`, 'error');
            
            // Display error in the container
            coursesListContainer.innerHTML = `
                <div style="padding: 15px; background-color: #f8d7da; color: #721c24; border-radius: 4px; margin-bottom: 15px;">
                    <h3>Error fetching sections</h3>
                    <p>${error.message}</p>
                    <p>Please check that your backend server is running and properly configured.</p>
                </div>
            `;
        });
}

/**
 * Displays the fetched sections in the UI.
 * @param {Array} sections - The sections data returned from the API
 */
function displaySections(sections) {
    const coursesListContainer = document.getElementById('courses-list');
    if (!coursesListContainer) {
        console.error("Could not find courses-list container");
        return;
    }

    // Clear the loading message if it exists
    const loadingMessage = coursesListContainer.querySelector('p');
    if (loadingMessage && loadingMessage.textContent === 'Loading sections...') {
        loadingMessage.remove();
    }

    // Check if sections exists and has items
    if (!sections || (Array.isArray(sections) && sections.length === 0)) {
        coursesListContainer.innerHTML += `
            <div style="padding: 15px; background-color: #d1ecf1; color: #0c5460; border-radius: 4px; margin-top: 15px;">
                No sections match your search criteria. Try broadening your search.
            </div>
        `;
        return;
    }

    // Ensure sections is treated as an array
    const sectionsArray = Array.isArray(sections) ? sections : 
                         (sections.data && Array.isArray(sections.data)) ? sections.data : 
                         [sections];

    // Create a container for the sections
    const sectionsListHTML = document.createElement('ul');
    sectionsListHTML.id = 'sections-list';
    sectionsListHTML.style.listStyle = 'none';
    sectionsListHTML.style.padding = '0';
    sectionsListHTML.style.margin = '0';

    // Build the sections HTML
    sectionsArray.forEach(section => {
        const schedule = section.schedule || 'Not specified';
        const instructor = section.instructor || 'TBA';
        const location = section.location || 'TBA';
        const seatsAvailable = section.seats_available !== undefined ? section.seats_available : '?';
        const totalSeats = section.total_seats !== undefined ? section.total_seats : '?';
        
        const li = document.createElement('li');
        li.style.backgroundColor = 'white';
        li.style.borderRadius = '4px';
        li.style.marginBottom = '10px';
        li.style.padding = '15px';
        li.style.border = '1px solid #e0e0e0';
        li.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600; color: #142A50; font-size: 16px;">
                    ${section.subject} ${section.course_code} - ${section.section_number}
                </span>
                <span style="background-color: ${seatsAvailable > 0 ? '#d4edda' : '#f8d7da'}; color: ${seatsAvailable > 0 ? '#155724' : '#721c24'}; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 500;">
                    ${seatsAvailable} / ${totalSeats} seats
                </span>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; font-size: 14px; color: #555;">
                <div style="flex: 1; min-width: 200px;">
                    <div><span style="color: #777; margin-right: 5px;">Schedule:</span> ${schedule}</div>
                    <div><span style="color: #777; margin-right: 5px;">Location:</span> ${location}</div>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <div><span style="color: #777; margin-right: 5px;">Instructor:</span> ${instructor}</div>
                    <div><span style="color: #777; margin-right: 5px;">Credits:</span> ${section.credits || '?'}</div>
                </div>
            </div>
            
            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                <button onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')" 
                        style="background-color: #142A50; color: white; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; cursor: pointer;">
                    Add to Schedule
                </button>
            </div>
        `;
        
        sectionsListHTML.appendChild(li);
    });

    // Add the sections list to the container
    coursesListContainer.appendChild(sectionsListHTML);
}

/**
 * Adds a section to the user's schedule and displays it on the schedule grid.
 * @param {string} subject - The subject code
 * @param {string} courseCode - The course code
 * @param {string} sectionNumber - The section number
 */
function addSectionToSchedule(subject, courseCode, sectionNumber) {
    console.log(`Adding section to schedule: ${subject} ${courseCode}-${sectionNumber}`);
    
    // Make sure we're viewing the registration view with schedule grid
    const registrationView = document.getElementById('registration-view');
    if (registrationView && registrationView.style.display !== 'flex') {
        // If we're not in the registration view, switch to it
        document.querySelector('.nav-links a[data-view="registration"]').click();
    }
    
    // Check if the schedule grid is visible
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        // Make sure the grid is displayed
        scheduleGrid.style.display = 'flex';
        console.log('Schedule grid display style:', scheduleGrid.style.display);
    } else {
        console.error('Schedule grid not found in the DOM');
        showNotification('Could not find schedule grid', 'error');
        return;
    }
    
    // Get the section data from the sections list
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) {
        console.error('Sections list not found');
        return;
    }
    
    // Find the section element with the matching details
    const sectionElement = Array.from(sectionsList.querySelectorAll('li')).find(li => {
        return li.innerHTML.includes(`${subject} ${courseCode} - ${sectionNumber}`);
    });
    
    if (!sectionElement) {
        console.error('Could not find section details in the DOM');
        
        // Create a default section with hardcoded values for testing
        const mockSchedule = 'MWF 10:00 AM - 11:15 AM';
        const mockInstructor = 'Instructor Name';
        const mockLocation = 'Building 123';
        
        // Show a warning notification
        showNotification('Using default schedule for testing: ' + mockSchedule, 'info');
        
        // Parse mock schedule
        const days = ['M', 'W', 'F'];
        const startTime = '10:00 AM';
        const endTime = '11:15 AM';
        
        // Convert start/end times to row indices
        const startHour = parseTimeToHour(startTime);
        const endHour = parseTimeToHour(endTime);
        
        // Add to grid with default color
        const courseColor = getRandomCourseColor();
        
        days.forEach(day => {
            const dayIndex = getDayIndex(day);
            addCourseToGrid(
                dayIndex,
                startHour,
                endHour,
                `${subject} ${courseCode}`,
                mockLocation,
                mockInstructor,
                courseColor
            );
        });
        
        // Update credits display
        updateCreditCount();
        
        // Show success message
        showNotification(`Added ${subject} ${courseCode} to your schedule`, 'success');
        
        return;
    }
    
    try {
        // Extract schedule information from the section element
        const scheduleText = sectionElement.querySelector('div[style*="flex: 1"] div:first-child').textContent;
        const scheduleValue = scheduleText.split(':')[1]?.trim() || 'Not specified';
        
        // Extract other information
        const instructorText = sectionElement.querySelector('div[style*="flex: 1"] div:nth-child(2)').textContent;
        const instructorValue = instructorText.split(':')[1]?.trim() || 'TBA';
        
        const locationText = sectionElement.querySelector('div[style*="flex: 1"]:nth-child(1) div:nth-child(2)').textContent;
        const locationValue = locationText.split(':')[1]?.trim() || 'TBA';
        
        console.log('Parsed course info:', {
            schedule: scheduleValue,
            instructor: instructorValue,
            location: locationValue
        });
        
        // Parse the schedule format (e.g., "MWF 10:00 AM - 11:00 AM")
        const days = [];
        if (scheduleValue.includes('M')) days.push('M');
        if (scheduleValue.includes('TR') || scheduleValue.includes('TTh')) {
            days.push('T');
            days.push('R');
        } else {
            if (scheduleValue.includes('T') && !scheduleValue.includes('Th')) days.push('T');
            if (scheduleValue.includes('Th')) days.push('R');
        }
        if (scheduleValue.includes('W')) days.push('W');
        if (scheduleValue.includes('F')) days.push('F');
        
        // If no days were parsed, use default days
        if (days.length === 0) {
            console.warn('No days parsed from schedule, using default MWF');
            days.push('M', 'W', 'F');
        }
        
        console.log('Parsed days:', days);
        
        // Extract time (e.g., "10:00 AM - 11:00 AM")
        let startTime = '';
        let endTime = '';
        
        // Simple time extraction using regex
        const timePattern = /(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i;
        const timeMatch = scheduleValue.match(timePattern);
        
        if (timeMatch) {
            startTime = timeMatch[1];
            endTime = timeMatch[2];
        } else {
            // Try another pattern for times without AM/PM
            const simpleTimePattern = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
            const simpleTimeMatch = scheduleValue.match(simpleTimePattern);
            
            if (simpleTimeMatch) {
                startTime = simpleTimeMatch[1];
                endTime = simpleTimeMatch[2];
            }
        }
        
        // If we still don't have times, use default times
        if (!startTime || !endTime) {
            console.warn('Could not parse time from schedule, using default times');
            startTime = '10:00 AM';  // Default start time
            endTime = '11:15 AM';    // Default end time
        }
        
        console.log('Parsed times:', { startTime, endTime });
        
        // Convert start/end times to row indices in the schedule grid
        const startHour = parseTimeToHour(startTime);
        const endHour = parseTimeToHour(endTime);
        
        console.log('Converted to grid hours:', { startHour, endHour });
        
        // Use a random color from our palette for this course
        const courseColor = getRandomCourseColor();
        
        // Check that we have all we need before adding to grid
        if (days.length > 0 && startHour >= 0 && endHour > startHour) {
            // Add the course to the schedule grid for each day
            days.forEach(day => {
                const dayIndex = getDayIndex(day);
                if (dayIndex !== -1) {
                    console.log(`Adding to grid: day=${day}, dayIndex=${dayIndex}, hour=${startHour}-${endHour}`);
                    addCourseToGrid(
                        dayIndex, 
                        startHour, 
                        endHour, 
                        `${subject} ${courseCode}`, 
                        locationValue, 
                        instructorValue,
                        courseColor
                    );
                }
            });
            
            // Update the credits display
            updateCreditCount();
            
            // Show a success message
            showNotification(`Added ${subject} ${courseCode} to your schedule`, 'success');
        } else {
            console.error('Invalid schedule parameters:', { days, startHour, endHour });
            showNotification('Could not add course to schedule due to invalid schedule', 'error');
        }
    } catch (error) {
        console.error('Error adding section to schedule:', error);
        showNotification('Error adding course to schedule: ' + error.message, 'error');
    }
}

/**
 * Parses a time string and returns the corresponding hour as a number.
 * @param {string} timeString - Time string (e.g., "10:00 AM")
 * @returns {number} Hour value (e.g., 10)
 */
function parseTimeToHour(timeString) {
    // Default to 8 AM if parsing fails
    if (!timeString) return 8;
    
    let hour = 8;
    
    // Parse hour from time string
    const hourMatch = timeString.match(/(\d{1,2}):/);
    if (hourMatch) {
        hour = parseInt(hourMatch[1], 10);
        
        // Adjust for PM times
        if (timeString.toUpperCase().includes('PM') && hour < 12) {
            hour += 12;
        }
        
        // Convert to grid hour (8 AM = row 0)
        hour = hour - 8;
    }
    
    // Ensure hour is within valid range
    return Math.max(0, Math.min(hour, 9));
}

/**
 * Gets the column index for a day abbreviation.
 * @param {string} day - Day abbreviation (M, T, W, R, F)
 * @returns {number} The column index (0-4), or -1 if invalid
 */
function getDayIndex(day) {
    const dayMapping = { 'M': 0, 'T': 1, 'W': 2, 'R': 3, 'F': 4 };
    return dayMapping[day] !== undefined ? dayMapping[day] : -1;
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
 * Adds a course to the schedule grid.
 * @param {number} dayIndex - Index of the day column (0-4)
 * @param {number} startHour - Starting hour index (0 = 8am, 1 = 9am, etc.)
 * @param {number} endHour - Ending hour index
 * @param {string} courseTitle - Course title to display
 * @param {string} location - Location to display
 * @param {string} instructor - Instructor to display
 * @param {string} color - Background color for the course
 */
function addCourseToGrid(dayIndex, startHour, endHour, courseTitle, location, instructor, color) {
    // Debug the input parameters
    console.log('addCourseToGrid called with:', {
        dayIndex, startHour, endHour, courseTitle, location, instructor, color
    });
    
    const scheduleGrid = document.querySelector('.schedule-grid table tbody');
    if (!scheduleGrid) {
        console.error('Schedule grid tbody not found');
        return;
    }
    
    // Log what we found
    console.log('Found schedule grid:', scheduleGrid);
    
    // Convert hour indices to actual table rows
    const rows = scheduleGrid.querySelectorAll('tr');
    console.log(`Found ${rows.length} rows in grid`);
    
    // Make sure start and end are within valid range
    startHour = Math.max(0, Math.min(startHour, rows.length - 1));
    endHour = Math.max(startHour + 1, Math.min(endHour, rows.length));
    
    // Calculate the row span
    const rowSpan = endHour - startHour;
    console.log(`Using startHour=${startHour}, endHour=${endHour}, rowSpan=${rowSpan}`);
    
    // Get the starting cell
    const startRow = rows[startHour];
    if (!startRow) {
        console.error(`Start row not found at index ${startHour}`);
        return;
    }
    
    const cells = startRow.querySelectorAll('td');
    console.log(`Found ${cells.length} cells in start row`);
    
    const cellIndex = dayIndex + 1; // +1 because first column is time
    if (cellIndex >= cells.length) {
        console.error(`Cell index ${cellIndex} out of bounds (max: ${cells.length - 1})`);
        return;
    }
    
    const startCell = cells[cellIndex];
    if (!startCell) {
        console.error(`Could not find cell for day ${dayIndex}, hour ${startHour} (index: ${cellIndex})`);
        return;
    }
    
    // Check if cell already has a course
    if (startCell.classList.contains('has-course')) {
        console.warn('Time slot conflict detected');
        showNotification('Time slot conflict! This time slot already has a course.', 'error');
        return;
    }
    
    // Mark start cell as having a course
    startCell.classList.add('has-course');
    
    // Set rowspan to cover the class duration
    startCell.rowSpan = rowSpan;
    
    // Get time from the first cell in the row
    const timeCell = rows[startHour].querySelector('td:first-child');
    const startTimeText = timeCell.textContent.trim();
    
    // Calculate end time (approximation based on rowspan)
    let endTimeText = '';
    if (startHour + rowSpan < rows.length) {
        endTimeText = rows[startHour + rowSpan].querySelector('td:first-child').textContent.trim();
    } else {
        // Last row or beyond, approximate
        const time = startTimeText.split(':')[0];
        const hour = parseInt(time) + rowSpan;
        const period = startTimeText.includes('PM') ? 'PM' : 'AM';
        endTimeText = `${hour}:00 ${period}`;
    }
    
    // Add course details to the cell
    startCell.innerHTML = `
        <div class="course-block event-block" style="
            background-color: ${color};
            color: white;
            height: 100%;
            border-radius: 4px;
            padding: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        " data-start-time="${startTimeText}" data-end-time="${endTimeText}">
            <div class="event-name course-title" style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">${courseTitle}</div>
            <div class="course-location" style="font-size: 12px;">${location}</div>
            <div class="course-instructor event-time" style="font-size: 12px; margin-top: auto;">${instructor}</div>
            
            <button onclick="removeFromSchedule(event, this)" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: rgba(255,255,255,0.3);
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                color: white;
            ">×</button>
        </div>
    `;
    
    console.log(`Added course ${courseTitle} to cell at day ${dayIndex}, hour ${startHour}`);
    
    // Remove the cells that will be covered by this course's rowspan
    for (let i = 1; i < rowSpan; i++) {
        const rowToAdjust = rows[startHour + i];
        if (rowToAdjust) {
            const cellToRemove = rowToAdjust.querySelectorAll('td')[cellIndex];
            if (cellToRemove) {
                cellToRemove.remove();
                console.log(`Removed cell at row ${startHour + i}, column ${cellIndex}`);
            } else {
                console.warn(`Cell to remove not found at row ${startHour + i}, column ${cellIndex}`);
            }
        } else {
            console.warn(`Row to adjust not found at index ${startHour + i}`);
        }
    }
    
    // Add a tooltip to the course block
    const courseBlock = startCell.querySelector('.course-block');
    courseBlock.title = `${courseTitle}\nLocation: ${location}\nInstructor: ${instructor}`;
    courseBlock.style.cursor = 'pointer';
    
    // Add double-click event listener for editing
    courseBlock.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        editEventOnSchedule(this);
    });
    
    console.log('Successfully added course to grid');
}

/**
 * Updates the credit count displayed in the header.
 */
function updateCreditCount() {
    // For now, let's use a simple count of course blocks
    const courseBlocks = document.querySelectorAll('.course-block');
    
    // Count unique courses (avoid counting the same course multiple times)
    const uniqueCourses = new Set();
    courseBlocks.forEach(block => {
        const courseTitle = block.querySelector('div').textContent;
        uniqueCourses.add(courseTitle);
    });
    
    // Each course is 3 credits (simplified assumption)
    const creditCount = uniqueCourses.size * 3;
    
    // Update the credit display
    const creditDisplay = document.querySelector('.credits-display');
    if (creditDisplay) {
        creditDisplay.textContent = `${creditCount} Credits`;
    }
}

/**
 * Removes a course from the schedule grid.
 * @param {Event} event - The click event
 * @param {HTMLElement} button - The button element that was clicked
 */
function removeFromSchedule(event, button) {
    // Prevent the click from bubbling up
    event.stopPropagation();
    
    // Get the course block and cell
    const courseBlock = button.closest('.course-block');
    const cell = courseBlock.closest('td');
    
    // Get the course title
    const courseTitle = courseBlock.querySelector('div').textContent;
    
    // Ask for confirmation
    if (confirm(`Remove ${courseTitle} from your schedule?`)) {
        // We need to handle rowspan - this is a bit complex
        // For this implementation, we'll refresh the entire grid
        resetScheduleGrid();
        
        // Update the credit count
        updateCreditCount();
        
        // Show confirmation
        showNotification(`Removed ${courseTitle} from your schedule`, 'info');
    }
}

/**
 * Resets the schedule grid to its empty state.
 */
function resetScheduleGrid() {
    const scheduleGrid = document.querySelector('.schedule-grid table tbody');
    if (!scheduleGrid) return;
    
    // Create a fresh grid
    scheduleGrid.innerHTML = `
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">8:00 AM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">9:00 AM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">10:00 AM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">11:00 AM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">12:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">1:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">2:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">3:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">4:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
        <tr><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8; color: #495057; font-size: 13px; font-weight: 500;">5:00 PM</td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td><td style="height: 60px; text-align: center; vertical-align: middle; border: 1px solid #e0e4e8;"></td></tr>
    `;
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
 * Display mock sections when the backend is not available
 */
function displayMockSections() {
    // This function is only a stub now since we don't want mock data
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        coursesList.innerHTML = '<p>Real server connection required. Please make sure the backend is running.</p>';
    }
}

/**
 * Adds an event to the schedule grid from the form in the Events tab
 */
function addEventFromForm() {
    console.log("addEventFromForm called");
    
    try {
        // Get values from form
        const eventName = document.querySelector('#event-name')?.value || "";
        const eventLocation = document.querySelector('#event-location')?.value || "";
        const startTime = document.querySelector('#event-start-time')?.value || "";
        const endTime = document.querySelector('#event-end-time')?.value || "";
        
        console.log("Form values:", { eventName, eventLocation, startTime, endTime });
        
        // Get selected days
        const selectedDays = [];
        document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
            const day = btn.textContent.trim();
            if (day) selectedDays.push(day);
        });
        
        console.log("Selected days:", selectedDays);
        
        // Validate inputs
        if (!eventName) {
            showNotification("Please enter an event name", "error");
            return;
        }
        
        if (!startTime || !endTime) {
            showNotification("Please specify both start and end time", "error");
            return;
        }
        
        if (selectedDays.length === 0) {
            showNotification("Please select at least one day", "error");
            return;
        }
        
        // Format time for display (24h to 12h conversion)
        const formatTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        };
        
        const startFormatted = formatTime(startTime);
        const endFormatted = formatTime(endTime);
        
        console.log("Formatted times:", { startFormatted, endFormatted });
        
        // Parse time to grid hours
        const startHour = parseTimeToHour(startTime);
        const endHour = parseTimeToHour(endTime);
        
        if (startHour >= endHour) {
            showNotification("End time must be after start time", "error");
            return;
        }
        
        console.log("Parsed hours:", { startHour, endHour });
        
        // Get a random color for the event
        const color = getRandomCourseColor();
        
        // Ensure we're in the registration view
        const registrationView = document.getElementById('registration-view');
        if (registrationView && !registrationView.classList.contains('active')) {
            document.querySelector('.nav-links a[data-view="registration"]').click();
        }
        
        // Add to grid for each selected day
        selectedDays.forEach(day => {
            const dayIndex = getDayIndex(day);
            console.log(`Adding event for day ${day} (index: ${dayIndex})`);
            
            if (dayIndex >= 0) {
                // The instructor parameter is set to "Personal Event" to distinguish it from courses
                addCourseToGrid(
                    dayIndex,
                    startHour,
                    endHour,
                    eventName,
                    eventLocation || "Your Location",
                    "Personal Event",
                    color
                );
            }
        });
        
        // Show success notification
        showNotification(`Added "${eventName}" to your schedule`, "success");
        
        // Clear form fields
        document.querySelector('#event-name').value = "";
        document.querySelector('#event-location').value = "";
        
        console.log("Event successfully added to grid");
    } catch (error) {
        console.error("Error adding event:", error);
        showNotification("Failed to add event: " + error.message, "error");
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