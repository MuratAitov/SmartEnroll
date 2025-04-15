// File: mockData.js

/**
 * Creates mock section data based on search criteria for testing
 */
export function generateMockSections(criteria) {
    console.log('Generating mock sections with criteria:', criteria);

    const mockSections = [];
    let subjects = criteria.subject ? [criteria.subject] : ['CPSC', 'MATH', 'CHEM', 'ENGL', 'HIST'];
    let courseCodes = criteria.course_code ? [criteria.course_code] : ['121', '122', '221', '223', '260', '321', '101', '102'];

    if (criteria.subject === 'CPSC' && criteria.course_code === '121') {
        subjects = ['CPSC'];
        courseCodes = ['121'];
    } else if (!criteria.subject && !criteria.course_code) {
        mockSections.push({
            subject: 'CPSC', course_code: '121', section_number: '01',
            schedule: 'TR 09:30AM-10:45AM', instructor: 'Smith, John',
            location: 'College Hall 401', credits: '3',
            seats_available: 15, total_seats: 30
        });
    }

    for (const subject of subjects) {
        if (criteria.subject && criteria.subject !== subject) continue;
        for (const courseCode of courseCodes) {
            if (criteria.course_code && criteria.course_code !== courseCode) continue;

            const sectionCount = Math.floor(Math.random() * 3) + 1;

            for (let i = 1; i <= sectionCount; i++) {
                const sectionNumber = i.toString().padStart(2, '0');
                const days = ['MWF', 'TR', 'MW', 'TRF'][Math.floor(Math.random() * 4)];
                const startHour = 8 + Math.floor(Math.random() * 9);
                const startMinute = [0, 30][Math.floor(Math.random() * 2)];
                const startPeriod = startHour >= 12 ? 'PM' : 'AM';
                const displayStartHour = startHour > 12 ? startHour - 12 : startHour;
                const duration = days.includes('R') ? 75 : 50;

                let endHour = startHour;
                let endMinute = startMinute + duration;
                if (endMinute >= 60) {
                    endHour += 1;
                    endMinute -= 60;
                }

                const endPeriod = endHour >= 12 ? 'PM' : 'AM';
                const displayEndHour = endHour > 12 ? endHour - 12 : endHour;
                const startTime = `${displayStartHour}:${startMinute.toString().padStart(2, '0')} ${startPeriod}`;
                const endTime = `${displayEndHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;
                const schedule = `${days} ${startTime} - ${endTime}`;

                const mockSection = {
                    subject, course_code: courseCode, section_number: sectionNumber,
                    schedule,
                    instructor: ['Smith, John', 'Johnson, Sarah', 'Williams, Michael', 'Brown, Lisa'][Math.floor(Math.random() * 4)],
                    location: ['College Hall 101', 'Herak Center 222', 'Hughes Hall 304', 'Tilford Center 201'][Math.floor(Math.random() * 4)],
                    credits: ['3', '4', '1'][Math.floor(Math.random() * 3)],
                    seats_available: Math.floor(Math.random() * 30),
                    total_seats: 30
                };

                if (criteria.instructor && !mockSection.instructor.toLowerCase().includes(criteria.instructor.toLowerCase())) {
                    continue;
                }

                mockSections.push(mockSection);
            }
        }
    }

    console.log('Generated mock sections:', mockSections);
    window.sectionsData = mockSections;
    return mockSections;
}

export function displayConnectionError() {
    const sectionsList = document.getElementById('sections-list');
    if (sectionsList) {
        sectionsList.innerHTML = `
            <div class="connection-error">
                <h3>Backend Connection Error</h3>
                <p>Could not connect to the course database. Using sample data for demonstration.</p>
                <button id="use-mock-data-btn" class="btn btn-primary">Load Sample Courses</button>
            </div>
        `;

        const mockDataBtn = document.getElementById('use-mock-data-btn');
        if (mockDataBtn) {
            mockDataBtn.addEventListener('click', function () {
                const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
                const courseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]');
                const criteria = {};
                if (subjectInput && subjectInput.value.trim()) criteria.subject = subjectInput.value.trim().toUpperCase();
                if (courseCodeInput && courseCodeInput.value.trim()) criteria.course_code = courseCodeInput.value.trim();

                const mockSections = generateMockSections(criteria);
                displaySections(mockSections);
                showNotification('Loaded sample courses for testing', 'info');
            });
        }
    }
}