/**
 * Gets the index of a day letter (M, T, W, R, F)
 * @param {string} day - The day letter
 * @returns {number} - The index (0-4)
 */
function getDayIndex(day) {
    const dayMap = {
        'M': 0,
        'T': 1,
        'W': 2,
        'R': 3,
        'F': 4
    };
    return dayMap[day] || -1;
}

/**
 * Gets the full name of a day from its letter code
 * @param {string} day - The day letter (M, T, W, R, F)
 * @returns {string} - The full day name
 */
function getDayName(day) {
    const dayNames = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday'
    };
    return dayNames[day] || day;
}

/**
 * Returns a color for a course from a predefined palette.
 * This function ensures different courses get different colors.
 * @param {string} courseId - A unique identifier for the course (e.g., "CPSC 121")
 * @returns {string} A color code
 */
function getRandomCourseColor(courseId = null) {
    // Define a palette of visually distinct colors
    const colors = [
        '#4285f4', // Google blue
        '#ea4335', // Google red
        '#fbbc05', // Google yellow
        '#34a853', // Google green
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#84cc16', // Lime
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Emerald
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#f97316', // Orange
        '#a855f7'  // Purple
    ];
    // Initialize courseColorMap as a global object (not a Map) for better stability
    if (!window.courseColorMap) {
        window.courseColorMap = {};
        console.log("Initialized new course color map as object");
    }
    
    // If no courseId provided, return a random color
    if (!courseId) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Debug the incoming courseId
    console.log(`Getting color for course: "${courseId}"`);
    
    // If we already have a color for this course, return it
    if (window.courseColorMap[courseId]) {
        console.log(`Using existing color for ${courseId}: ${window.courseColorMap[courseId]}`);
        return window.courseColorMap[courseId];
    }
    
    // Get all currently used colors
    const usedColors = Object.values(window.courseColorMap);
    console.log("Currently used colors:", usedColors);
    
    // Try to find a color that hasn't been used yet
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    let selectedColor;
    if (availableColors.length > 0) {
        // If we have unused colors, pick one randomly
        selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        console.log(`Selected unused color for ${courseId}: ${selectedColor}`);
    } else {
        // If all colors are used, pick a random one from the full palette
        selectedColor = colors[Math.floor(Math.random() * colors.length)];
        console.log(`All colors used, selected random color for ${courseId}: ${selectedColor}`);
    }
    
    // Store the color for this course
    window.courseColorMap[courseId] = selectedColor;
    console.log(`Assigned color for ${courseId}: ${selectedColor}`);
    console.log("Updated course color map:", window.courseColorMap);
    
    return selectedColor;
}

function findTimeRow(timeText) {
    try {
        // Parse the time text into a standardized format
        const timeParts = timeText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
        if (!timeParts) return null;
        
        let hours = parseInt(timeParts[1], 10);
        const minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
        const period = timeParts[3] ? timeParts[3].toUpperCase() : null;
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // The time in total minutes since midnight
        const totalMinutes = hours * 60 + minutes;
        
        // Get all time cells from the schedule grid
        const timeRows = Array.from(document.querySelectorAll('.schedule-grid tbody tr'));
        if (!timeRows.length) {
            console.error('No time rows found in schedule grid');
            return null;
        }
        
        // First try to find exact hour match
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                // Convert to 24-hour format
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                // Direct match for the hour
                if (cellHours === hours && Math.abs(cellMinutes - minutes) < 15) {
                    console.log(`Found exact time match: ${cellText} for ${timeText}`);
                    return row;
                }
            }
        }
        
        // If no exact match, find the closest row that's before or at our start time
        let closestRow = null;
        let smallestDifference = Infinity;
        
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                // Convert to 24-hour format
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                // Find row that's at or before our target time
                if (cellTotalMinutes <= totalMinutes) {
                    const difference = totalMinutes - cellTotalMinutes;
                    
                    // If this is the closest one so far, update our selection
                    if (difference < smallestDifference) {
                        smallestDifference = difference;
                        closestRow = row;
                    }
                }
            }
        }
        
        // If we found a close match, log it
        if (closestRow) {
            const timeCell = closestRow.querySelector('td:first-child');
            console.log(`Found closest time match: ${timeCell.textContent.trim()} for ${timeText} (difference: ${smallestDifference} minutes)`);
        } else {
            console.warn(`No suitable time row found for ${timeText}`);
        }
        
        return closestRow;
    } catch (error) {
        console.error('Error finding time row:', error);
        return null;
    }
}

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

/**
 * Parses a time string into a decimal hour value
 * @param {string} timeString - Time string (e.g., "10:30 AM", "1:45PM")
 * @returns {number} - Time as a decimal hour (e.g., 10.5)
 */
export function parseTimeToHour(timeString) {
    try {
        let normalizedTime = timeString.trim().replace(/\s+/g, ' ');
        normalizedTime = normalizedTime.replace(/(\d+:\d+)([AaPp][Mm])/, '$1 $2');
        const timeMatch = normalizedTime.match(/(\d+):(\d+)\s*([AaPp][Mm])?/i);
        if (!timeMatch) return NaN;

        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing time:', error, timeString);
        return NaN;
    }
}

/**
 * Converts time string (e.g., "10:30 AM") to decimal hour
 */
function parseTimeToHour(timeString) {
    try {
        let normalized = timeString.trim().replace(/\s+/g, ' ').replace(/(\d+:\d+)([AaPp][Mm])/, '$1 $2');
        const match = normalized.match(/(\d+):(\d+)\s*([AaPp][Mm])?/i);
        if (!match) return NaN;

        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3] ? match[3].toUpperCase() : null;

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours + (minutes / 60);
    } catch {
        return NaN;
    }
}

/**
 * Returns index of day: 'M', 'T', 'W', 'R', 'F' => 0–4
 */
function getDayIndex(day) {
    return ['M', 'T', 'W', 'R', 'F'].indexOf(day);
}

/**
 * Returns a random course color
 */
function getRandomCourseColor() {
    const colors = ['#4A90E2', '#B41231', '#357ABD', '#002467', '#2ECC71', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export { parseTimeToHour, getDayIndex, getRandomCourseColor };

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

export { getNextMonday, formatDateForICS };

// utility.js

export function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function parseSemester(semester) {
    const parts = semester.split(' ');
    return {
        season: parts[0],
        year: parseInt(parts[1])
    };
}

export function getSemesterDates(year, season) {
    let startDate, endDate;
    if (season === 'Spring') {
        startDate = new Date(year, 0, 15);
        endDate = new Date(year, 4, 15);
    } else if (season === 'Fall') {
        startDate = new Date(year, 7, 20);
        endDate = new Date(year, 11, 15);
    } else if (season === 'Summer') {
        startDate = new Date(year, 4, 20);
        endDate = new Date(year, 7, 10);
    } else {
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 4);
    }
    return { startDate, endDate };
}

export function formatDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('');
}

export function formatTimeForICS(timeStr) {
    let hours = 0;
    let minutes = 0;
    const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (ampmMatch) {
        hours = parseInt(ampmMatch[1]);
        minutes = parseInt(ampmMatch[2]);
        if (ampmMatch[3]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampmMatch[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
}

export function getNextWeekday(day) {
    const dayMap = { MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6, SU: 0 };
    const targetDay = dayMap[day];
    const today = new Date();
    const daysUntil = (targetDay - today.getDay() + 7) % 7;
    today.setDate(today.getDate() + daysUntil);
    return today;
}

// utils.js or utility.js
export function formatEndpointName(endpoint) {
    return endpoint
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
