function setupContextMenu(eventBlock) {
    const menu = createContextMenu(eventBlock);
    addEventActionsToMenu(menu, eventBlock);
    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}

function addEventActionsToMenu(menu, eventBlock) {
    setupEditEventAction(menu, eventBlock);
    setupColorChangeAction(menu, eventBlock);
    setupDuplicateEventAction(menu, eventBlock);
    setupDeleteEventAction(menu, eventBlock);
    setupExportActions(menu, eventBlock);
}

function setupEditEventAction(menu, eventBlock) {
    const editItem = menu.querySelector('.edit');
    editItem.addEventListener('click', () => editEvent(eventBlock));
}

function editEvent(eventBlock) {
    const currentValues = getCurrentEventValues(eventBlock);
    const editDialog = createEditDialog(currentValues, eventBlock);
    document.body.appendChild(editDialog);
}

function getCurrentEventValues(eventBlock) {
    const eventName = eventBlock.querySelector('.event-name').textContent;
    const eventTime = eventBlock.querySelector('.event-time').textContent;
    const [start, end] = eventTime.split(' - ');
    return { eventName, start, end };
}

function createEditDialog({ eventName, start, end }, eventBlock) {
    const editDialog = document.createElement('div');
    editDialog.className = 'edit-dialog';
    editDialog.innerHTML = getEditFormHTML(eventName, start, end);
    setupEditFormListeners(editDialog, eventBlock);
    return editDialog;
}

function getEditFormHTML(eventName, start, end) {
    return `
        <div class="form-group"><input type="text" id="edit-name" placeholder="Event Name" value="${eventName}"></div>
        <div class="form-group">
            <div class="weekday-buttons">${getWeekdayButtonsHTML()}</div>
        </div>
        <div class="form-group"><input type="time" id="edit-start" value="${start}"></div>
        <div class="form-group"><input type="time" id="edit-end" value="${end}"></div>
        <div class="edit-buttons">
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;
}

function getWeekdayButtonsHTML() {
    const days = ['M', 'T', 'W', 'R', 'F'];
    return days.map(day => `<button class="weekday-btn" data-day="${day}">${day}</button>`).join('');
}

function setupEditFormListeners(editDialog, eventBlock) {
    const saveButton = editDialog.querySelector('.save-btn');
    const cancelButton = editDialog.querySelector('.cancel-btn');
    const weekdayButtons = editDialog.querySelectorAll('.weekday-btn');

    saveButton.addEventListener('click', () => saveChanges(editDialog, eventBlock));
    cancelButton.addEventListener('click', () => editDialog.remove());
    weekdayButtons.forEach(button => button.addEventListener('click', () => button.classList.toggle('selected')));
}

function saveChanges(editDialog, eventBlock) {
    const newName = editDialog.querySelector('#edit-name').value;
    const newStart = editDialog.querySelector('#edit-start').value;
    const newEnd = editDialog.querySelector('#edit-end').value;
    const selectedDays = Array.from(editDialog.querySelectorAll('.weekday-btn.selected')).map(btn => btn.dataset.day);

    validateAndApplyChanges({ newName, newStart, newEnd, selectedDays }, eventBlock);
    editDialog.remove();
}

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

function updateEventBlocks(eventBlock, newName, selectedDays, newStart, newEnd) {
    const schedule = document.querySelector('.schedule-grid'); // Assuming .schedule-grid holds your calendar
    selectedDays.forEach(day => {
        const dayCell = schedule.querySelector(`[data-day="${day}"]`); // Assuming day cells are marked with data attributes
        const newEventBlock = eventBlock.cloneNode(true);
        newEventBlock.querySelector('.event-name').textContent = newName;
        newEventBlock.querySelector('.event-time').textContent = `${newStart} - ${newEnd}`;
        dayCell.appendChild(newEventBlock);
    });
}

function setupColorChangeAction(menu, eventBlock) {
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';
    const colors = ['#808080', '#4A90E2', '#B41231', '#357ABD', '#002467'];
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

function setupDuplicateEventAction(menu, eventBlock) {
    const duplicate = eventBlock.cloneNode(true);
    duplicate.querySelector('.event-name').textContent += ' (copy)'; // Modify as needed
    eventBlock.parentNode.insertBefore(duplicate, eventBlock.nextSibling);
}

function setupDeleteEventAction(menu, eventBlock) {
    menu.querySelector('.delete').addEventListener('click', () => {
        eventBlock.remove(); // Simply remove the event block from the DOM
    });
}

function setupExportActions(menu, eventBlock) {
    // Apple Calendar Export
    const exportApple = document.createElement('button');
    exportApple.textContent = 'Export to Apple Calendar';
    exportApple.addEventListener('click', () => exportEvent(eventBlock, 'apple-calendar'));
    menu.appendChild(exportApple);

    // Google Calendar Export
    const exportGoogle = document.createElement('button');
    exportGoogle.textContent = 'Export to Google Calendar';
    exportGoogle.addEventListener('click', () => exportEvent(eventBlock, 'google-calendar'));
    menu.appendChild(exportGoogle);
}

// Function to export event details to backend API
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Event exported successfully to ${calendarType.replace('-', ' ')}`);
        } else {
            alert(`Failed to export event: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Export error:', error);
        alert('An error occurred while exporting the event.');
    });
}

function closeMenuOnClickOutside(menu) {
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}
