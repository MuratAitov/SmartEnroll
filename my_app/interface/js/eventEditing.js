import { parseTimeToHour } from './utility.js';

/**
 * Retrieves current event details from the event block.
 * @param {HTMLElement} eventBlock - The event block.
 * @returns {Object} - Object containing event name, start, and end time.
 */
export function getCurrentEventValues(eventBlock) {
    return {
        eventName: eventBlock.querySelector('.event-name').textContent,
        start: eventBlock.querySelector('.event-time').textContent.split(' - ')[0],
        end: eventBlock.querySelector('.event-time').textContent.split(' - ')[1]
    };
}

/**
 * Creates the edit dialog form.
 * @param {{ eventName: string, start: string, end: string }} values 
 * @param {HTMLElement} eventBlock 
 * @returns {HTMLElement}
 */
export function createEditDialog({ eventName, start, end }, eventBlock) {
    const editDialog = document.createElement('div');
    editDialog.className = 'edit-dialog';
    editDialog.innerHTML = getEditFormHTML(eventName, start, end);
    setupEditFormListeners(editDialog, eventBlock);
    return editDialog;
}

/**
 * Shows an edit dialog for an existing event on the schedule.
 * @param {HTMLElement} eventBlock - The event block element to edit
 */
export function editEventOnSchedule(eventBlock) {
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

/**
 * Retrieves the current values of the selected event.
 */
function getCurrentEventValues(eventBlock) {
    const eventName = eventBlock.querySelector('.event-name').textContent;
    const eventTime = eventBlock.querySelector('.event-time').textContent;
    const [start, end] = eventTime.split(' - ');
    return { eventName, start, end };
}

/**
 * Generates the HTML for the edit form.
 */
function getEditFormHTML(eventName, start, end) {
    return `
        <div class="form-group"><input type="text" id="edit-name" value="${eventName}"></div>
        <div class="form-group"><div class="weekday-buttons">${getWeekdayButtonsHTML()}</div></div>
        <div class="form-group"><input type="time" id="edit-start" value="${start}"></div>
        <div class="form-group"><input type="time" id="edit-end" value="${end}"></div>
        <div class="edit-buttons">
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;
}

/**
 * Generates weekday selection buttons.
 */
function getWeekdayButtonsHTML() {
    return ['M', 'T', 'W', 'R', 'F'].map(day => `<button class="weekday-btn" data-day="${day}">${day}</button>`).join('');
}

/**
 * Sets up event listeners for the edit form.
 */
function setupEditFormListeners(editDialog, eventBlock) {
    editDialog.querySelector('.save-btn').addEventListener('click', () => saveChanges(editDialog, eventBlock));
    editDialog.querySelector('.cancel-btn').addEventListener('click', () => editDialog.remove());

    editDialog.querySelectorAll('.weekday-btn').forEach(button => {
        button.addEventListener('click', () => button.classList.toggle('selected'));
    });
}

/**
 * Saves the changes made to the event.
 */
function saveChanges(editDialog, eventBlock) {
    const newName = editDialog.querySelector('#edit-name').value;
    const newStart = editDialog.querySelector('#edit-start').value;
    const newEnd = editDialog.querySelector('#edit-end').value;
    const selectedDays = Array.from(editDialog.querySelectorAll('.weekday-btn.selected')).map(btn => btn.dataset.day);

    validateAndApplyChanges({ newName, newStart, newEnd, selectedDays }, eventBlock);
    editDialog.remove();
}

/**
 * Validates and applies event changes.
 */
function validateAndApplyChanges({ newName, newStart, newEnd, selectedDays }, eventBlock) {
    if (!newName || !newStart || !newEnd) {
        alert('Please fill in all fields');
        return;
    }
    if (selectedDays.length === 0) {
        alert('Please select at least one day');
        return;
    }
    updateEventBlocks(eventBlock, newName, selectedDays, newStart, newEnd);
}

/**
 * Updates event blocks based on modifications.
 */
function updateEventBlocks(eventBlock, newName, selectedDays, newStart, newEnd) {
    const schedule = document.querySelector('.schedule-grid');
    selectedDays.forEach(day => {
        const dayCell = schedule.querySelector(`[data-day="${day}"]`);
        const newEventBlock = eventBlock.cloneNode(true);
        newEventBlock.querySelector('.event-name').textContent = newName;
        newEventBlock.querySelector('.event-time').textContent = `${newStart} - ${newEnd}`;
        dayCell.appendChild(newEventBlock);
    });
}