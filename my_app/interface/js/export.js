import { getNextMonday, formatDateForICS } from './utility.js';

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
 * Initializes the iCalendar file content.
 */
function initializeCalendar() {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gonzaga University//Class Schedule//EN'
    ].join('\r\n');
}

/**
 * Finalizes and downloads the iCalendar file.
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

export { exportToCalendar };
