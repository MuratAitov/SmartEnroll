function addEventToSchedule(eventName, days, startTime, endTime) {
    // Convert times to hour and minute numbers
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Get all selected days
    const selectedDays = [];
    document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
        const day = btn.textContent;
        const dayIndex = ['M', 'T', 'W', 'R', 'F'].indexOf(day) + 1;
        selectedDays.push(dayIndex);
    });

    // Create event blocks for each selected day
    selectedDays.forEach(dayIndex => {
        // Find the start cell
        const startRowIndex = startHour - 8 + 2; // +2 to account for header row and 8AM start
        const startCell = document.querySelector(`table tr:nth-child(${startRowIndex}) td:nth-child(${dayIndex + 1})`);
        
        if (startCell) {
            const eventBlock = document.createElement('div');
            eventBlock.className = 'event-block';
            
            // Calculate position and height based on exact times
            const startMinuteOffset = (startMinute / 60) * 60; // Convert minutes to pixels
            const endMinuteOffset = (endMinute / 60) * 60;
            const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
            
            // Set the block's style with precise positioning
            eventBlock.style.top = `${startMinuteOffset}px`;
            eventBlock.style.height = `${duration}px`;
            eventBlock.style.zIndex = '1';
            
            // Create the event content with name and time
            eventBlock.innerHTML = `
                <div class="event-name">${eventName}</div>
                <div class="event-time">${startTime} - ${endTime}</div>
            `;
            
            // Add event listeners to the new block
            addEventBlockListeners(eventBlock);

            startCell.style.position = 'relative';
            startCell.appendChild(eventBlock);
        }
    });
}

function exportToCalendar() {
    // Current timestamp for DTSTAMP
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Start the calendar content
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gonzaga University//Class Schedule//EN'
    ].join('\r\n');

    // Add each event
    document.querySelectorAll('.event-block').forEach(eventBlock => {
        const eventName = eventBlock.querySelector('.event-name').textContent;
        const [startTime, endTime] = eventBlock.querySelector('.event-time').textContent.split(' - ');
        
        // Convert times to UTC format
        const [startHour, startMinute] = startTime.split(':');
        const [endHour, endMinute] = endTime.split(':');
        
        // Use next Monday as the start date
        const nextMonday = getNextMonday();
        const dtStart = formatDateForICS(nextMonday, startHour, startMinute);
        const dtEnd = formatDateForICS(nextMonday, endHour, endMinute);

        // Create RRULE based on selected days
        const selectedDays = ['MO', 'TU', 'WE', 'TH', 'FR'];
        const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${selectedDays.join(',')};UNTIL=20251231T235959Z`;

        // Add event to calendar
        icsContent += '\r\n' + [
            'BEGIN:VEVENT',
            'UID:' + Date.now() + '@gonzaga.edu',
            'DTSTAMP:' + now,
            'SUMMARY:' + eventName,
            'DTSTART:' + dtStart,
            'DTEND:' + dtEnd,
            rrule,
            'END:VEVENT'
        ].join('\r\n');
    });

    // Close the calendar
    icsContent += '\r\nEND:VCALENDAR';

    // Create and trigger download
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