import { parseTimeToHour, getDayIndex, getRandomCourseColor } from './utility.js';

/**
 * Adds an event from the recurring event form to the schedule
 */
function addEventFromForm() {
    console.log("addEventFromForm called");

    try {
        const eventName = document.querySelector('#RecurringEvents input[placeholder="Event Name"]')?.value || "";
        const startTime = document.querySelector('#RecurringEvents input[placeholder="Start Time"]')?.value || "";
        const endTime = document.querySelector('#RecurringEvents input[placeholder="End Time"]')?.value || "";

        const selectedDays = [];
        document.querySelectorAll('#RecurringEvents .day-button.selected').forEach(btn => {
            const day = btn.textContent.trim();
            if (day) selectedDays.push(day);
        });

        if (!eventName || !startTime || !endTime || selectedDays.length === 0) {
            alert("Please complete all fields and select at least one day");
            return;
        }

        const formattedStartTime = startTime.padStart(5, '0');
        const formattedEndTime = endTime.padStart(5, '0');
        const startHour = parseTimeToHour(formattedStartTime);
        const endHour = parseTimeToHour(formattedEndTime);

        if (startHour >= endHour) {
            alert("End time must be after start time");
            return;
        }

        const color = getRandomCourseColor();

        const registrationView = document.getElementById('registration-view');
        if (registrationView && !registrationView.classList.contains('active')) {
            document.querySelector('.nav-links a[data-view="registration"]').click();
        }

        selectedDays.forEach(day => {
            const dayIndex = getDayIndex(day);
            if (dayIndex >= 0) {
                const rowStart = Math.floor(startHour) - 8 + 2;
                const cell = document.querySelector(`table tr:nth-child(${rowStart}) td:nth-child(${dayIndex + 1})`);
                if (!cell) return;

                cell.style.position = 'relative';
                const eventBlock = document.createElement('div');
                eventBlock.className = 'course-block';
                eventBlock.style.cssText = `
                    position: absolute;
                    background-color: ${color};
                    color: white;
                    width: 100%;
                    left: 0;
                    padding: 8px;
                    border-radius: 4px;
                    box-sizing: border-box;
                    overflow: hidden;
                    z-index: 1;
                    top: ${(startHour % 1) * 60}px;
                    height: ${(endHour - startHour) * 60}px;
                `;
                eventBlock.innerHTML = `
                    <div class="event-name">${eventName}</div>
                    <div class="event-location">Personal Event</div>
                    <div class="event-time">${startTime} - ${endTime}</div>
                `;
                cell.appendChild(eventBlock);
            }
        });

        // Clear form
        document.querySelector('#RecurringEvents input[placeholder="Event Name"]').value = "";
        document.querySelector('#RecurringEvents input[placeholder="Start Time"]').value = "";
        document.querySelector('#RecurringEvents input[placeholder="End Time"]').value = "";
        document.querySelectorAll('#RecurringEvents .day-button.selected').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.backgroundColor = 'white';
            btn.style.color = '#333';
            btn.style.borderColor = '#e0e0e0';
        });

        alert(`Added "${eventName}" to your schedule`);
    } catch (error) {
        console.error("Error adding event:", error);
        alert("Failed to add event: " + error.message);
    }
}

export { addEventFromForm };
