/** 
 * Initializes the context menu for event blocks.
 */
function setupContextMenu(eventBlock) {
    const menu = createContextMenu(eventBlock);
    addEventActionsToMenu(menu, eventBlock);
    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}

/** 
 * Adds different actions to the event context menu.
 */
function addEventActionsToMenu(menu, eventBlock) {
    setupEditEventAction(menu, eventBlock);
    setupColorChangeAction(menu, eventBlock);
    setupDuplicateEventAction(menu, eventBlock);
    setupDeleteEventAction(menu, eventBlock);
    setupExportActions(menu, eventBlock);
}

/* ==================== Edit Event Actions ==================== */

/**
 * Enables editing of an event.
 */
function setupEditEventAction(menu, eventBlock) {
    const editItem = menu.querySelector('.edit');
    editItem.addEventListener('click', () => editEvent(eventBlock));
}

/**
 * Opens the edit form dialog for modifying event details.
 */
function editEvent(eventBlock) {
    const currentValues = getCurrentEventValues(eventBlock);
    const editDialog = createEditDialog(currentValues, eventBlock);
    document.body.appendChild(editDialog);
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
 * Creates the edit dialog form.
 */
function createEditDialog({ eventName, start, end }, eventBlock) {
    const editDialog = document.createElement('div');
    editDialog.className = 'edit-dialog';
    editDialog.innerHTML = getEditFormHTML(eventName, start, end);
    setupEditFormListeners(editDialog, eventBlock);
    return editDialog;
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

/* ==================== Color Change Action ==================== */

/**
 * Enables event color changing.
 */
function setupColorChangeAction(menu, eventBlock) {
    const colors = ['#808080', '#4A90E2', '#B41231', '#357ABD', '#002467'];
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.addEventListener('click', () => {
            eventBlock.style.backgroundColor = color;
            document.body.removeChild(colorPicker);
        });
        colorPicker.appendChild(colorOption);
    });

    document.body.appendChild(colorPicker);
}

/* ==================== Duplicate & Delete Actions ==================== */

/**
 * Duplicates an event block.
 */
function setupDuplicateEventAction(menu, eventBlock) {
    const duplicate = eventBlock.cloneNode(true);
    duplicate.querySelector('.event-name').textContent += ' (copy)';
    eventBlock.parentNode.insertBefore(duplicate, eventBlock.nextSibling);
}

/**
 * Deletes an event block.
 */
function setupDeleteEventAction(menu, eventBlock) {
    menu.querySelector('.delete').addEventListener('click', () => eventBlock.remove());
}

/* ==================== Export Actions ==================== */

/**
 * Adds export functionality to the menu.
 */
function setupExportActions(menu, eventBlock) {
    const exportApple = document.createElement('button');
    exportApple.textContent = 'Export to Apple Calendar';
    exportApple.addEventListener('click', () => exportEvent(eventBlock, 'apple-calendar'));
    menu.appendChild(exportApple);

    const exportGoogle = document.createElement('button');
    exportGoogle.textContent = 'Export to Google Calendar';
    exportGoogle.addEventListener('click', () => exportEvent(eventBlock, 'google-calendar'));
    menu.appendChild(exportGoogle);
}

/**
 * Exports event details to the backend API.
 */
function exportEvent(eventBlock, calendarType) {
    const eventName = eventBlock.querySelector('.event-name').textContent;
    const eventTime = eventBlock.querySelector('.event-time').textContent;
    const [startTime, endTime] = eventTime.split(' - ');

    const eventData = {
        name: eventName,
        start_time: startTime,
        end_time: endTime
    };

    fetch(`http://localhost:5000/export/${calendarType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success ? `Event exported to ${calendarType.replace('-', ' ')}` : `Failed to export: ${data.error}`);
    })
    .catch(error => {
        console.error('Export error:', error);
        alert('An error occurred while exporting.');
    });
}

/* ==================== Utility Functions ==================== */

/**
 * Closes menu when clicking outside.
 */
function closeMenuOnClickOutside(menu) {
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}
