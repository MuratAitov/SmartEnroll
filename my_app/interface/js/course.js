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
 * Checks if the backend is connected and updates the connection indicator.
 */
function checkBackendConnection() {
    try {
        const statusElement = document.getElementById('connection-status');

        // Use relative URL to avoid CORS issues
        fetch('/courses_bp')
            .then(response => {
                if (response.ok) {
                    console.log('Backend connection successful');
                    statusElement.innerHTML = '<span style="color: green;">Connected</span>';

                    // Fetch instructors (no mock data fallback)
                    setupInstructorAutocomplete();
                } else {
                    console.error('Backend connection failed with status:', response.status);
                    statusElement.innerHTML = '<span style="color: red;">Disconnected</span>';
                    showNotification('Error connecting to server. Some features may be unavailable.', 'error');
                }
            })
            .catch(error => {
                console.error('Error checking backend connection:', error);
                statusElement.innerHTML = '<span style="color: red;">Disconnected</span>';
                showNotification('Cannot connect to server. Please check your connection.', 'error');
            });
    } catch (error) {
        console.error('Error in checkBackendConnection:', error);
    }
}

/**
 * Sets up the instructor autocomplete with either real or mock data.
 * @param {boolean} useMockData - Whether to use mock data
 */
function setupInstructorAutocomplete() {
    console.log('Setting up instructor autocomplete...');
    const instructorInput = document.getElementById('instructor-input');

    if (!instructorInput) {
        console.error('Instructor input field not found');
        return;
    }

    // Use relative URL to avoid CORS issues
    fetch('/courses_bp/professors')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data && Array.isArray(data.data)) {
                const instructors = data.data.map(prof => {
                    // Handle different data structures
                    if (prof.name) return prof.name;
                    if (prof.instructor) return prof.instructor;
                    return prof; // If it's already a string
                });

                console.log('Fetched instructors:', instructors);

                // Store the instructors list for later use
                window.instructors = instructors;

                // Create custom autocomplete
                setupCustomAutocomplete(instructorInput, instructors);
            }
        })
        .catch(error => {
            console.error('Error fetching instructors:', error);
            showNotification('Error loading instructors. Please try again later.', 'error');
            // No fallback to mock data
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
 * Fetch sections from our real Flask endpoint.
 * @param {Object} criteria
 * @returns {Promise} Resolves with {data: [...]}
 */
function fetchSectionsReal(criteria = {}) {
    const params = new URLSearchParams();
    if (criteria.subject) {
        params.append('subject', criteria.subject);
    }
    if (criteria.course_code) {
        params.append('course_code', criteria.course_code);
    }
    if (criteria.attribute) {
        params.append('attribute', criteria.attribute);
    }
    if (criteria.instructor) {
        params.append('instructor', criteria.instructor);
    }

    // Наш endpoint: /sections_bp/search
    const url = '/sections_bp/search?' + params.toString();
    console.log('Requesting sections from:', url);

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.error) {
                throw new Error(result.error);
            }
            // Возвращаем массив секций
            return result.data || [];
        });
}
function fetchSections(criteria = {}) {
    const coursesListContainer = document.getElementById('courses-list');
    if (coursesListContainer) {
        coursesListContainer.innerHTML = '<p>Loading sections from real backend...</p>';
    }

    console.log('Searching with criteria:', criteria);

    fetchSectionsReal(criteria)
        .then(sections => {
            displaySections(sections);
        })
        .catch(error => {
            console.error('Error fetching sections from real server:', error);
            if (coursesListContainer) {
                coursesListContainer.innerHTML = `
                    <div style="padding: 15px; background-color: #f8d7da; color: #721c24; border-radius: 4px; margin-bottom: 15px;">
                        <h3>Error searching for sections</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        });
}

/**
 * Acts as a proxy for section search that returns mock data matching the criteria.
 * This function simulates what the backend /sections_bp/search endpoint should do,
 * but since that endpoint returns 500 errors, we use this client-side solution.
 *
 * @param {Object} criteria - Search criteria
 * @returns {Promise} - Promise that resolves with section data
 */
function mockProxySectionsSearch(criteria) {
    return new Promise((resolve) => {
        // Simulate a network delay
        setTimeout(() => {
            // Create a comprehensive mock data set
            const allMockSections = [
                {
                    subject: "CPSC",
                    course_code: "325",
                    section_number: "01",
                    schedule: "MWF 10:00 AM - 11:15 AM",
                    instructor: "Ryan Herzog",
                    location: "Herak 308",
                    seats_available: 15,
                    total_seats: 30,
                    credits: 3
                },
                {
                    subject: "CPSC",
                    course_code: "321",
                    section_number: "01",
                    schedule: "TR 9:30 AM - 10:45 AM",
                    instructor: "Shawn Bowers",
                    location: "Herak 311",
                    seats_available: 8,
                    total_seats: 25,
                    credits: 3
                },
                {
                    subject: "CPSC",
                    course_code: "212",
                    section_number: "02",
                    schedule: "TR 2:00 PM - 3:15 PM",
                    instructor: "Paul De Palma",
                    location: "Herak 315",
                    seats_available: 0,
                    total_seats: 30,
                    credits: 3
                },
                {
                    subject: "MATH",
                    course_code: "231",
                    section_number: "01",
                    schedule: "MWF 11:00 AM - 11:50 AM",
                    instructor: "Vesta Coufal",
                    location: "Herak 231",
                    seats_available: 12,
                    total_seats: 25,
                    credits: 3
                },
                {
                    subject: "MATH",
                    course_code: "157",
                    section_number: "03",
                    schedule: "MWF 2:00 PM - 2:50 PM",
                    instructor: "Thomas McKenzie",
                    location: "Herak 233",
                    seats_available: 5,
                    total_seats: 30,
                    credits: 4
                },
                {
                    subject: "STAT",
                    course_code: "301",
                    section_number: "01",
                    schedule: "MWF 1:00 PM - 1:50 PM",
                    instructor: "Maria Tackett",
                    location: "Herak 241",
                    seats_available: 10,
                    total_seats: 24,
                    credits: 3
                },
                {
                    subject: "STAT",
                    course_code: "201",
                    section_number: "02",
                    schedule: "TR 3:30 PM - 4:45 PM",
                    instructor: "Maria Tackett",
                    location: "Herak 242",
                    seats_available: 7,
                    total_seats: 25,
                    credits: 3
                },
                {
                    subject: "CPSC",
                    course_code: "353",
                    section_number: "01",
                    schedule: "MWF 9:00 AM - 9:50 AM",
                    instructor: "Ryan Herzog",
                    location: "Herak 309",
                    seats_available: 3,
                    total_seats: 20,
                    credits: 3
                }
            ];

            // Filter sections based on search criteria
            const filteredSections = allMockSections.filter(section => {
                // Match subject
                if (criteria.subject && section.subject !== criteria.subject.toUpperCase()) {
                    return false;
                }

                // Match course code (partial match)
                if (criteria.course_code && !section.course_code.includes(criteria.course_code)) {
                    return false;
                }

                // Match instructor (case-insensitive partial match)
                if (criteria.instructor && !section.instructor.toLowerCase().includes(criteria.instructor.toLowerCase())) {
                    return false;
                }

                // Match attribute if needed (not implemented in mock data)
                if (criteria.attribute) {
                    // In a real implementation, this would check attributes
                    console.log('Attribute filtering not implemented in mock data');
                }

                return true;
            });

            // Return the filtered sections in the same format as the API would
            resolve({
                data: filteredSections
            });
        }, 500); // Simulate 500ms network delay
    });
}

/**
 * Displays the fetched sections in the UI.
 * @param {Array} sections - The sections data returned from the API
 */
/**
 * Displays the fetched sections in the UI.
 * @param {Array} sections - The sections data returned from the server
 */
function displaySections(sections) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) return;

    // Если нет данных — показываем сообщение
    if (!sections || sections.length === 0) {
        sectionsList.innerHTML = `
            <div style="color: #0c5460; background-color: #d1ecf1; padding: 10px; border-radius: 4px;">
                <p style="margin: 0;">No sections found matching your criteria.</p>
            </div>
        `;
        return;
    }

    // 1) Создаём массив уникальных секций
    const uniqueSections = [];
    const seen = new Set();

    for (const s of sections) {
        // Составляем «ключ» для определения дубликатов
        // Например, сравниваем subject, course_code, section_number, schedule, instructor, location
        // (добавьте/уберите поля, которые для вас важны)
        const dedupKey = [
            s.subject,
            s.course_code,
            s.section_number,
            s.schedule,
            s.instructor,
            s.location
        ].join('|');

        if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            uniqueSections.push(s);
        }
    }

    // 2) Генерируем HTML уже только для uniqueSections
    let html = '';
    uniqueSections.forEach(section => {
        const schedule = section.schedule || 'Not specified';
        const instructor = section.instructor || 'TBA';
        const location = section.location || 'TBA';
        const credits = section.credits || '?';

        // seatsAvailable / totalSeats убираем полностью
        html += `
            <li style="background-color: white; border-radius: 4px; margin-bottom: 10px; padding: 15px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #142A50; font-size: 16px;">
                        ${section.subject} ${section.course_code} - ${section.section_number}
                    </span>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; font-size: 14px; color: #555;">
                    <div style="flex: 1; min-width: 200px;">
                        <div><span style="color: #777; margin-right: 5px;">Schedule:</span> ${schedule}</div>
                        <div><span style="color: #777; margin-right: 5px;">Location:</span> ${location}</div>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <div><span style="color: #777; margin-right: 5px;">Instructor:</span> ${instructor}</div>
                        <div><span style="color: #777; margin-right: 5px;">Credits:</span> ${credits}</div>
                    </div>
                </div>

                <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                    <button onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')"
                            style="background-color: #142A50; color: white; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; cursor: pointer;">
                        Add to Schedule
                    </button>
                </div>
            </li>
        `;
    });

    sectionsList.innerHTML = html;
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
    }

    // Add event listeners for enter key on input fields
    const inputFields = document.querySelectorAll('#Courses input[type="text"]');
    inputFields.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                fetchData();
            }
        });
    });
});