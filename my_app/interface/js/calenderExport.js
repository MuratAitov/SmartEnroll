// calendarExport.js
import {
    getCurrentTimestamp,
    parseSemester,
    getSemesterDates,
    formatDateString,
    formatTimeForICS,
    getNextWeekday
} from './utility.js';
import { showNotification, showSuccessMessage, showErrorMessage } from './notifications.js';

export function generateAndDownloadICS(events, semester) {
    console.log('Generating iCalendar file client-side...');
    showNotification('Generating Apple Calendar file...', 'info');

    try {
        const now = getCurrentTimestamp();
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Gonzaga University//Course Schedule//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ].join('\r\n');

        events.forEach(event => {
            const icalEvent = {
                name: event.title,
                day: event.day,
                start_time: event.startTime,
                end_time: event.endTime,
                location: event.location,
                instructor: event.instructor
            };
            icsContent += generateEventICS(icalEvent, now, semester);
        });

        icsContent += '\r\nEND:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `GU_Schedule_${semester.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccessMessage('Schedule exported to Apple Calendar file');
    } catch (error) {
        console.error('Error generating iCalendar file:', error);
        showErrorMessage('Failed to generate Apple Calendar file: ' + error.message);
    }
}

export function generateEventICS(event, timestamp, semester) {
    const { year, season } = parseSemester(semester);
    const { endDate } = getSemesterDates(year, season);

    const nextDate = getNextWeekday(event.day);
    const eventDate = formatDateString(nextDate);
    const dtStart = `${eventDate}T${formatTimeForICS(event.start_time)}`;
    const dtEnd = `${eventDate}T${formatTimeForICS(event.end_time)}`;
    const untilDate = formatDateString(endDate) + 'T235959Z';

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
 * Retrieves the current timestamp in the correct format.
 */
function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an iCalendar event entry from an event block.
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

// Utility function (this one could also go to utility.js if shared)
function parseTime(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return { startHour, startMinute, endHour, endMinute };
}