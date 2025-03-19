/**
 * Gets the date of the next Monday from the current date.
 * @returns {Date} - The Date object representing next Monday.
 */
function getNextMonday() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay; // Move forward to next Monday
    today.setDate(today.getDate() + daysUntilMonday);
    return today;
}

/**
 * Formats a Date object into the iCalendar (ICS) date-time format.
 * @param {Date} date - The date object to format.
 * @param {number} hours - The hour (0-23) for the event.
 * @param {number} minutes - The minutes (0-59) for the event.
 * @returns {string} - The formatted date string in YYYYMMDDTHHMMSS format.
 */
function formatDateForICS(date, hours, minutes) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'), // Month is 0-based
        String(date.getDate()).padStart(2, '0'),
        'T',
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        '00'
    ].join('');
}
