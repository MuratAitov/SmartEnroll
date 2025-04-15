/**
 * Handles exporting schedule data to various calendar formats using the backend API.
 */

/**
 * Exports the current schedule to Apple Calendar.
 * @param {Object} eventData - The event data to export (optional, if not provided will use current schedule)
 */
function exportToAppleCalendar(eventData = null) {
    if (!eventData) {
        eventData = collectScheduleData();
    }
    
    exportToCalendar(eventData, 'apple-calendar');
}

/**
 * Exports the current schedule to Google Calendar.
 * @param {Object} eventData - The event data to export (optional, if not provided will use current schedule)
 */
function exportToGoogleCalendar(eventData = null) {
    if (!eventData) {
        eventData = collectScheduleData();
    }
    
    exportToCalendar(eventData, 'google-calendar');
}

/**
 * Collects and formats schedule data for export.
 * @returns {Array} Array of event objects with course data
 */
function collectScheduleData() {
    // DEBUG: Log that we're collecting schedule data
    console.log('Collecting schedule data for export...');
    
    // Find all course blocks in the schedule grid
    const courseBlocks = document.querySelectorAll('.course-block');
    console.log('Found course blocks:', courseBlocks.length);
    
    // If no courses are found, check if we need to look in a different way
    if (courseBlocks.length === 0) {
        // Try alternative selectors that might be used for course blocks
        const altCourseBlocks = document.querySelectorAll('.schedule-grid td div[style*="background-color"]');
        console.log('Alternative course blocks found:', altCourseBlocks.length);
        
        if (altCourseBlocks.length > 0) {
            // Return data from alternative blocks
            return Array.from(altCourseBlocks).map(block => {
                // Extract course info from the block
                const courseInfo = block.textContent.trim();
                const titleMatch = courseInfo.match(/^([A-Z]+ \d+)/);
                const title = titleMatch ? titleMatch[1] : 'Course';
                
                // Get day from parent cell
                const cell = block.closest('td');
                const row = cell.parentElement;
                const dayIndex = Array.from(row.cells).indexOf(cell) - 1; // Subtract 1 for time column
                
                // Get time from row
                const timeCell = row.cells[0];
                const timeText = timeCell.textContent.trim();
                
                return {
                    title: title,
                    location: 'Gonzaga University',
                    description: courseInfo,
                    day: getDayFromIndex(dayIndex),
                    startTime: timeText,
                    endTime: incrementHour(timeText),
                    instructor: 'Instructor'
                };
            });
        }
    }
    
    // If we found course blocks with the expected selector, process them
    if (courseBlocks.length > 0) {
        return Array.from(courseBlocks).map(block => {
            const title = block.querySelector('.course-title')?.textContent || 'Course';
            const location = block.querySelector('.course-location')?.textContent || 'Gonzaga University';
            const description = block.textContent.trim();
            
            // Get day from the column position
            const cell = block.closest('td');
            const row = cell.parentElement;
            const dayIndex = Array.from(row.cells).indexOf(cell) - 1; // Subtract 1 for time column
            
            // Get start time from row
            const timeCell = row.cells[0];
            const startTime = timeCell.textContent.trim();
            
            // Calculate end time based on block height or rowspan
            let endTime;
            if (block.dataset.endTime) {
                endTime = block.dataset.endTime;
            } else {
                // Estimate based on height/rowspan
                const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
                endTime = incrementHoursByCount(startTime, rowspan);
            }
            
            return {
                title: title,
                location: location,
                description: description,
                day: getDayFromIndex(dayIndex),
                startTime: startTime,
                endTime: endTime,
                instructor: block.querySelector('.course-instructor')?.textContent || 'Instructor'
            };
        });
    }
    
    return [];
}

/**
 * Helper function to increment time by 1 hour
 * @param {string} timeStr - Time string like "10:00 AM"
 * @returns {string} - Time string incremented by 1 hour
 */
function incrementHour(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hour] = time.split(':');
    hour = parseInt(hour);
    
    if (hour === 12) {
        return `1:00 ${period}`;
    }
    
    hour += 1;
    
    if (hour === 12) {
        const newPeriod = period === 'AM' ? 'PM' : 'AM';
        return `${hour}:00 ${newPeriod}`;
    }
    
    return `${hour}:00 ${period}`;
}

/**
 * Helper function to increment time by a specified number of hours
 * @param {string} timeStr - Time string like "10:00 AM"
 * @param {number} count - Number of hours to add
 * @returns {string} - Time string incremented by count hours
 */
function incrementHoursByCount(timeStr, count) {
    let result = timeStr;
    for (let i = 0; i < count; i++) {
        result = incrementHour(result);
    }
    return result;
}

/**
 * Gets the day name from the index in the schedule table.
 * @param {number} index - The column index
 * @returns {string} The day abbreviation (MO, TU, etc.)
 */
function getDayFromIndex(index) {
    const days = ['', 'MO', 'TU', 'WE', 'TH', 'FR']; // Index 0 is time column
    return days[index] || '';
}

/**
 * Sends export request to the backend API.
 * @param {Array} eventData - The event data to export
 * @param {string} endpoint - The backend endpoint to use ('apple-calendar' or 'google-calendar')
 */
function exportToCalendar(eventData, endpoint) {
    console.log(`Exporting to ${endpoint}...`);
    console.log('Export data:', eventData);
    
    // Check if we have events to export
    if (!eventData || eventData.length === 0) {
        showErrorMessage('No courses added to schedule yet. Add courses before exporting.');
        return;
    }
    
    // Get the current semester from the UI
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    // For Apple Calendar, we'll handle it directly in the browser
    if (endpoint === 'apple-calendar') {
        // Generate iCalendar file directly in the browser
        generateAndDownloadICS(eventData, currentSemester);
        return;
    }
    
    // For Google Calendar, we'll continue to use the backend API
    const exportData = {
        events: eventData,
        semester: currentSemester,
        user: {
            name: 'John Doe', // This would be the actual user name in a real app
            id: '123456789'   // This would be the actual user ID in a real app
        }
    };
    
    // Show loading indicator
    const loadingIndicator = showLoadingIndicator();
    
    // Make the API request
    fetch(`http://localhost:5001/export_bp/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Export response:', data);
        
        if (data.success) {
            showSuccessMessage(`Successfully exported to ${formatEndpointName(endpoint)}`);
            
            // For Google Calendar, open a new tab with the Google Calendar interface
            if (endpoint === 'google-calendar') {
                // Open Google Calendar in a new tab with a new event form
                const url = 'https://calendar.google.com/calendar/r/eventedit';
                window.open(url, '_blank');
            }
        } else {
            showErrorMessage(`Failed to export: ${data.error || 'Unknown error'}`);
        }
    })
    .catch(error => {
        console.error('Export error:', error);
        showErrorMessage(`Error: ${error.message}`);
    })
    .finally(() => {
        // Remove loading indicator
        hideLoadingIndicator(loadingIndicator);
    });
}

/**
 * Exports the current schedule directly to an iCalendar file without using the backend.
 * This creates and downloads the .ics file directly in the browser.
 */
function exportToICalendar() {
    const events = collectScheduleData();
    
    if (events.length === 0) {
        alert('No courses to export.');
        return;
    }
    
    // Get the current semester from the UI
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    // Generate the iCalendar content
    const now = getCurrentTimestamp();
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gonzaga University//Course Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n');
    
    // Add each event to the calendar
    events.forEach(event => {
        icsContent += generateEventICS(event, now, currentSemester);
    });
    
    // Finalize and download the file
    icsContent += '\r\nEND:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `GU_Schedule_${currentSemester.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Schedule exported to iCalendar file');
}

/**
 * Formats the endpoint name for display.
 * @param {string} endpoint - The endpoint name
 * @returns {string} Formatted name
 */
function formatEndpointName(endpoint) {
    return endpoint.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Tests the connection to the export controller.
 * This function can be called from the browser console to verify the connection.
 */
function testExportConnection() {
    console.log('Testing export connection...');
    
    // Create a sample event
    const sampleEvent = {
        name: 'Test Course',
        day: 'MO',
        start_time: '10:00 AM',
        end_time: '11:00 AM',
        location: 'Test Location'
    };
    
    // Test Apple Calendar export
    fetch('http://localhost:5001/export_bp/apple-calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            events: [sampleEvent],
            semester: 'Spring 2025',
            user: {
                name: 'Test User',
                id: '999999999'
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Apple Calendar Export Test Response:', data);
        if (data.success) {
            console.log('✅ Apple Calendar export connection successful!');
        } else {
            console.error('❌ Apple Calendar export connection failed:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ Apple Calendar export connection error:', error);
    });
    
    // Test Google Calendar export
    fetch('http://localhost:5001/export_bp/google-calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            events: [sampleEvent],
            semester: 'Spring 2025',
            user: {
                name: 'Test User',
                id: '999999999'
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Google Calendar Export Test Response:', data);
        if (data.success) {
            console.log('✅ Google Calendar export connection successful!');
        } else {
            console.error('❌ Google Calendar export connection failed:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ Google Calendar export connection error:', error);
    });
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
