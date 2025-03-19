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
 * Exports the schedule to an iCalendar (.ics) file.
 */
function exportToCalendar() {
    const now = getCurrentTimestamp();
    let icsContent = initializeCalendar();

    document.querySelectorAll('.event-block').forEach(eventBlock => {
        icsContent += generateEventICS(eventBlock, now);
    });

    finalizeAndDownloadICS(icsContent);
}

/**
 * Retrieves the current timestamp in the correct format.
 * @returns {string} - Formatted timestamp for DTSTAMP.
 */
function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Initializes the iCalendar file content.
 * @returns {string} - The initial calendar headers.
 */
function initializeCalendar() {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gonzaga University//Class Schedule//EN'
    ].join('\r\n');
}

/**
 * Generates an iCalendar event entry from an event block.
 * @param {HTMLElement} eventBlock - The event block element.
 * @param {string} now - The current timestamp.
 * @returns {string} - The formatted iCalendar event entry.
 */
function generateEventICS(eventBlock, now) {
    const eventName = eventBlock.querySelector('.event-name').textContent;
    const [startTime, endTime] = eventBlock.querySelector('.event-time').textContent.split(' - ');
    const { startHour, startMinute, endHour, endMinute } = parseTime(startTime, endTime);
    const nextMonday = getNextMonday();
    const dtStart = formatDateForICS(nextMonday, startHour, startMinute);
    const dtEnd = formatDateForICS(nextMonday, endHour, endMinute);
    const selectedDays = ['MO', 'TU', 'WE', 'TH', 'FR'];
    const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${selectedDays.join(',')};UNTIL=20251231T235959Z`;

    return '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${Date.now()}@gonzaga.edu`,
        `DTSTAMP:${now}`,
        `SUMMARY:${eventName}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        rrule,
        'END:VEVENT'
    ].join('\r\n');
}

/**
 * Finalizes and downloads the iCalendar file.
 * @param {string} icsContent - The full iCalendar file content.
 */
function finalizeAndDownloadICS(icsContent) {
    icsContent += '\r\nEND:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class_schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Finds the next Monday from the current date.
 * @returns {Date} - The next Monday's date.
 */
function getNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
    today.setDate(today.getDate() + daysUntilMonday);
    return today;
}

/**
 * Formats a date into the correct iCalendar format (YYYYMMDDTHHMMSSZ).
 * @param {Date} date - The date object.
 * @param {number} hour - The hour of the event.
 * @param {number} minute - The minute of the event.
 * @returns {string} - The formatted date string.
 */
function formatDateForICS(date, hour, minute) {
    date.setHours(hour, minute, 0);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
