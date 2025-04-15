import { addEventBlockListeners } from './eventListeners.js';
import { parseTimeToHour } from './utility.js';

/**
 * Adds an event to the schedule grid.
 * @param {string} eventName - The name of the event.
 * @param {Array} days - The days the event occurs on (e.g., ['M', 'W', 'F']).
 * @param {string} startTime - The start time of the event (HH:MM format).
 * @param {string} endTime - The end time of the event (HH:MM format).
 */
function addEventToSchedule(eventName, days, startTime, endTime) {
    const { startHour, startMinute, endHour, endMinute } = parseTime(startTime, endTime);
    const selectedDays = getSelectedDays();

    selectedDays.forEach(dayIndex => {
        const startCell = getStartCell(startHour, dayIndex);
        if (startCell) {
            const eventBlock = createEventBlock(eventName, startTime, endTime, startMinute, endMinute, startHour);
            addEventBlockListeners(eventBlock);
            startCell.style.position = 'relative';
            startCell.appendChild(eventBlock);
        }
    });
}

/**
 * Parses start and end times into hours and minutes.
 * @param {string} startTime - The start time (HH:MM).
 * @param {string} endTime - The end time (HH:MM).
 * @returns {Object} - Parsed start and end hours/minutes.
 */
function parseTime(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return { startHour, startMinute, endHour, endMinute };
}

/**
 * Retrieves the selected days from the UI.
 * @returns {Array} - An array of selected day indexes.
 */
function getSelectedDays() {
    return Array.from(document.querySelectorAll('.weekday-btn.selected')).map(btn => {
        return ['M', 'T', 'W', 'R', 'F'].indexOf(btn.textContent) + 1;
    });
}

/**
 * Finds the starting cell in the schedule table based on the time and day.
 * @param {number} startHour - The event start hour.
 * @param {number} dayIndex - The index of the day (Monday = 1, Friday = 5).
 * @returns {HTMLElement} - The table cell where the event should be placed.
 */
function getStartCell(startHour, dayIndex) {
    const startRowIndex = startHour - 8 + 2; // Adjust for header rows
    return document.querySelector(`table tr:nth-child(${startRowIndex}) td:nth-child(${dayIndex + 1})`);
}

/**
 * Creates an event block element.
 * @param {string} eventName - The name of the event.
 * @param {string} startTime - The start time of the event.
 * @param {string} endTime - The end time of the event.
 * @param {number} startMinute - The start minute of the event.
 * @param {number} endMinute - The end minute of the event.
 * @param {number} startHour - The start hour of the event.
 * @returns {HTMLElement} - The created event block element.
 */
function createEventBlock(eventName, startTime, endTime, startMinute, endMinute, startHour) {
    const eventBlock = document.createElement('div');
    eventBlock.className = 'event-block';

    // Set block positioning
    const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
    eventBlock.style.top = `${(startMinute / 60) * 60}px`;
    eventBlock.style.height = `${duration}px`;
    eventBlock.style.zIndex = '1';

    // Set content
    eventBlock.innerHTML = `
        <div class="event-name">${eventName}</div>
        <div class="event-time">${startTime} - ${endTime}</div>
    `;

    return eventBlock;
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