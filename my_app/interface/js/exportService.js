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
 * Collects all scheduled events from the schedule grid.
 * @returns {Array} Array of event objects with course details
 */
function collectScheduleData() {
    const events = [];
    const courseBlocks = document.querySelectorAll('#schedule-container .event-block');
    
    if (courseBlocks.length === 0) {
        alert('No courses added to schedule yet. Add courses before exporting.');
        return [];
    }
    
    courseBlocks.forEach(block => {
        // Extract the course data from the event block
        const courseName = block.querySelector('.event-name')?.textContent || 'Unnamed Course';
        const timeText = block.querySelector('.event-time')?.textContent || '';
        const [startTime, endTime] = timeText.split(' - ');
        
        const dayEl = block.closest('td');
        const dayIndex = Array.from(dayEl.parentNode.children).indexOf(dayEl);
        const day = getDayFromIndex(dayIndex);
        
        events.push({
            name: courseName,
            day: day,
            start_time: startTime,
            end_time: endTime,
            location: 'Gonzaga University'
        });
    });
    
    return events;
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
        alert('No courses to export.');
        return;
    }
    
    // Get the current semester from the UI
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    // Prepare the request data
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
            
            // If there's a download URL, open it
            if (data.download_url) {
                window.open(data.download_url, '_blank');
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
 * Shows a loading indicator while the export is in progress.
 * @returns {HTMLElement} The loading indicator element
 */
function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay"></div>
        <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-text">Exporting...</div>
        </div>
    `;
    
    // Add styles for the loading indicator
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }
        .loading-content {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #142A50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        .loading-text {
            font-size: 16px;
            color: #333;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
}

/**
 * Hides the loading indicator when export is complete.
 * @param {HTMLElement} loadingIndicator - The loading indicator to hide
 */
function hideLoadingIndicator(loadingIndicator) {
    if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}

/**
 * Shows a success message after successful export.
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

/**
 * Shows an error message if export fails.
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    showNotification(message, 'error');
}

/**
 * Shows a notification message.
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', or 'info')
 */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${getIconForType(type)}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-close">×</div>
    `;
    
    // Add styles for the notification if not already added
    if (!document.querySelector('style[data-for="notifications"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-for', 'notifications');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                z-index: 9999;
                animation: slide-in 0.3s ease-out;
            }
            .notification.success {
                background-color: #d4edda;
                color: #155724;
            }
            .notification.error {
                background-color: #f8d7da;
                color: #721c24;
            }
            .notification.info {
                background-color: #d1ecf1;
                color: #0c5460;
            }
            .notification-icon {
                font-size: 20px;
                margin-right: 10px;
            }
            .notification-message {
                flex-grow: 1;
            }
            .notification-close {
                cursor: pointer;
                font-size: 20px;
                margin-left: 10px;
            }
            @keyframes slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Add click event to close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Gets the appropriate icon for a notification type.
 * @param {string} type - The notification type
 * @returns {string} The icon character
 */
function getIconForType(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'info': return 'ℹ';
        default: return '';
    }
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
 * Gets the current timestamp in iCalendar format (YYYYMMDDTHHMMSSZ).
 * @returns {string} Formatted timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an iCalendar event entry.
 * @param {Object} event - The event data
 * @param {string} timestamp - The current timestamp
 * @param {string} semester - The current semester
 * @returns {string} Formatted iCalendar event
 */
function generateEventICS(event, timestamp, semester) {
    // Parse semester to determine start and end dates
    const { year, season } = parseSemester(semester);
    const { startDate, endDate } = getSemesterDates(year, season);
    
    // Get next occurrence of this weekday
    const nextDate = getNextWeekday(event.day);
    
    // Format start and end times
    const eventDate = formatDateString(nextDate);
    const dtStart = `${eventDate}T${formatTimeForICS(event.start_time)}`;
    const dtEnd = `${eventDate}T${formatTimeForICS(event.end_time)}`;
    
    // Calculate until date (end of semester)
    const untilDate = formatDateString(endDate) + 'T235959Z';
    
    // Create the rrule (weekly recurrence on this day until end of semester)
    const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${event.day};UNTIL=${untilDate}`;
    
    return '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${Date.now()}-${Math.random().toString(36).substring(2, 15)}@gonzaga.edu`,
        `DTSTAMP:${timestamp}`,
        `SUMMARY:${event.name}`,
        `LOCATION:${event.location || 'Gonzaga University'}`,
        `DESCRIPTION:${event.name} - ${semester}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        rrule,
        'END:VEVENT'
    ].join('\r\n');
}

/**
 * Parses the semester string into year and season.
 * @param {string} semester - Semester string (e.g., "Spring 2025")
 * @returns {Object} Object with year and season
 */
function parseSemester(semester) {
    const parts = semester.split(' ');
    return {
        season: parts[0],
        year: parseInt(parts[1])
    };
}

/**
 * Gets the start and end dates for a semester.
 * @param {number} year - The year
 * @param {string} season - The season (Spring, Fall, Summer)
 * @returns {Object} Object with startDate and endDate
 */
function getSemesterDates(year, season) {
    let startDate, endDate;
    
    if (season === 'Spring') {
        startDate = new Date(year, 0, 15); // Jan 15
        endDate = new Date(year, 4, 15);   // May 15
    } else if (season === 'Fall') {
        startDate = new Date(year, 7, 20); // Aug 20
        endDate = new Date(year, 11, 15);  // Dec 15
    } else if (season === 'Summer') {
        startDate = new Date(year, 4, 20); // May 20
        endDate = new Date(year, 7, 10);   // Aug 10
    } else {
        // Default to current date + 4 months
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 4);
    }
    
    return { startDate, endDate };
}

/**
 * Gets the next occurrence of a specific weekday.
 * @param {string} day - The weekday code (MO, TU, etc.)
 * @returns {Date} The next occurrence of that weekday
 */
function getNextWeekday(day) {
    const today = new Date();
    const dayMap = { 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 0 };
    const targetDay = dayMap[day];
    
    if (targetDay === undefined) {
        return today; // If invalid day, return today
    }
    
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    return nextDate;
}

/**
 * Formats a date as YYYYMMDD for iCalendar.
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('');
}

/**
 * Formats a time string to HHMMSS for iCalendar.
 * @param {string} timeStr - Time string in format "HH:MM AM/PM"
 * @returns {string} Formatted time
 */
function formatTimeForICS(timeStr) {
    let hours = 0;
    let minutes = 0;
    
    // Try to parse time in various formats
    if (timeStr) {
        // Try "HH:MM AM/PM" format
        const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (ampmMatch) {
            hours = parseInt(ampmMatch[1]);
            minutes = parseInt(ampmMatch[2]);
            
            if (ampmMatch[3] && ampmMatch[3].toUpperCase() === 'PM' && hours < 12) {
                hours += 12;
            } else if (ampmMatch[3] && ampmMatch[3].toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }
        } else {
            // Try 24-hour format "HH:MM"
            const match = timeStr.match(/(\d+):(\d+)/);
            if (match) {
                hours = parseInt(match[1]);
                minutes = parseInt(match[2]);
            }
        }
    }
    
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
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
 * Exports the current schedule to PDF format.
 * Uses html2canvas and jsPDF to generate a PDF of the current schedule.
 */
function exportToPDF() {
    const scheduleContainer = document.getElementById('schedule-container');
    
    if (!scheduleContainer) {
        showErrorMessage('Schedule container not found');
        return;
    }
    
    // Check if html2canvas and jsPDF are available
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        // Load the required libraries if not already loaded
        loadPDFLibraries()
            .then(() => generatePDF(scheduleContainer))
            .catch(error => {
                console.error('Error loading PDF libraries:', error);
                showErrorMessage('Failed to load PDF export libraries');
            });
    } else {
        // Libraries already loaded, generate PDF directly
        generatePDF(scheduleContainer);
    }
}

/**
 * Loads the required libraries for PDF generation.
 * @returns {Promise} A promise that resolves when libraries are loaded
 */
function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        // Load html2canvas
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.onload = () => {
            // After html2canvas loads, load jsPDF
            const jsPDFScript = document.createElement('script');
            jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPDFScript.onload = resolve;
            jsPDFScript.onerror = reject;
            document.head.appendChild(jsPDFScript);
        };
        html2canvasScript.onerror = reject;
        document.head.appendChild(html2canvasScript);
    });
}

/**
 * Generates a PDF from the schedule container.
 * @param {HTMLElement} container - The schedule container element
 */
function generatePDF(container) {
    showLoadingIndicator();
    
    // Get the current semester for the filename
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    // Create a notification that we're generating the PDF
    showNotification('Generating PDF...', 'info');
    
    // Use html2canvas to capture the container as an image
    html2canvas(container, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Initialize PDF document
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });
        
        // Calculate dimensions to maintain aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Add title and metadata
        pdf.setFontSize(10);
        const today = new Date().toLocaleDateString();
        pdf.text(`Gonzaga University Schedule - ${currentSemester} (Generated on ${today})`, 10, pdfHeight + 10);
        
        // Save the PDF
        pdf.save(`GU_Schedule_${currentSemester.replace(/\s+/g, '_')}.pdf`);
        
        // Hide loading indicator and show success message
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showSuccessMessage('Schedule exported to PDF successfully');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showErrorMessage('Failed to generate PDF: ' + error.message);
    });
} 