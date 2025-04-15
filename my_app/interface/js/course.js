import { generateMockSections } from './mockdata.js';
import { fetchSections, checkBackendConnection } from './exportService.js';
import { updateCoursesListWithMockData } from './uiControls.js';
import { addEventFromForm, editEventOnSchedule } from './eventManagement.js';
import { parseTimeToHour } from './utility.js';
import { addEventFromForm } from './events.js';
window.addEventFromForm = addEventFromForm;

/**
 * This file handles course search and registration functionality
 */

// Initialize global state
window.sectionsData = [];
// Export the fetchData function to make it globally available
window.fetchData = fetchData;

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
 * Fetches a list of courses from the backend.
 */
function fetchCourses() {
    // Display mock course data instead of trying to fetch
        updateCoursesListWithMockData();
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
        // Parse days and time information
        const firstSpaceIndex = scheduleInfo.indexOf(' ');
        if (firstSpaceIndex === -1) {
            showNotification(`Invalid schedule format: ${scheduleInfo}`, 'error');
            return;
        }
        
        const days = scheduleInfo.substring(0, firstSpaceIndex).trim();
        let timeRange = scheduleInfo.substring(firstSpaceIndex + 1).trim();
        
        // Extract start and end times
        const timeMatch = timeRange.match(/(\d+:\d+\s*(?:AM|PM))\s*-\s*(\d+:\d+\s*(?:AM|PM))/i);
        if (!timeMatch) {
            showNotification(`Could not parse time information: ${timeRange}`, 'error');
            return;
        }
        
        const startTime = timeMatch[1].trim();
        const endTime = timeMatch[2].trim();
        
        // Create a unique course identifier
        const courseKey = `${subject} ${courseCode}`;
        
        // Force clear the courseKey from color map to ensure a new color is assigned
        if (window.courseColorMap && window.courseColorMap[courseKey]) {
            console.log(`Clearing existing color for ${courseKey} to ensure unique color assignment`);
            delete window.courseColorMap[courseKey];
        }
        
        // Get a color for this course
        const courseColor = getRandomCourseColor(courseKey);
        console.log(`Color selected for ${courseKey}: ${courseColor}`);
        
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
            
            // Set the background color directly
            courseBlock.style.backgroundColor = courseColor;
            console.log(`Applied color ${courseColor} to course block for ${courseKey}`);
            
            // Calculate duration for height
            const durationHours = endHour - startHour;
            
            // Set position and size
            courseBlock.style.position = 'absolute';
            courseBlock.style.left = '0';
            courseBlock.style.top = '0';
            courseBlock.style.width = '100%';
            courseBlock.style.height = `${durationHours * 100}%`;
            
            // Store course data as attributes
            courseBlock.setAttribute('data-course', courseKey);
            courseBlock.setAttribute('data-section', sectionNumber);
            
            // Handle credits
            let creditValue = sectionData.credits;
            if (typeof creditValue === 'string') {
                creditValue = parseInt(creditValue, 10);
            }
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
            deleteButton.innerHTML = '×'; 
            deleteButton.title = `Remove ${courseKey}`;
            
            // Add delete button click handler
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation();
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
            
            // Add double-click event
            courseBlock.addEventListener('dblclick', function() {
                removeCourseFromSchedule(subject, courseCode, sectionNumber, day);
            });
            
            // Add the course block to the cell
            cell.style.position = 'relative';
            cell.appendChild(courseBlock);
            
            // Add highlight animation
            courseBlock.classList.add('highlight-animation');
            setTimeout(() => {
                courseBlock.classList.remove('highlight-animation');
            }, 1500);
        }
        
        // Update total credits
        updateCreditCount();
        
        showNotification(`${courseKey} added to schedule.`, 'success');
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        showNotification('Error adding course to schedule. Please try again.', 'error');
    }
}

/**
 * Removes a course section from the schedule grid
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
                console.log(`Clearing color mapping for ${courseKey} since all instances are removed`);
                delete window.courseColorMap[courseKey];
            }
            
            // Show notification
            const dayText = day ? ` on ${getDayName(day)}` : '';
            showNotification(`${courseKey} removed from schedule${dayText}.`, 'info');
        }
    }
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