/**
 * Generates the HTML content for the export dropdown menu.
 * @returns {string} - The export dropdown HTML string.
 */
function createExportDropdown() {
    return `
        <div class="export-dropdown">
            <a href="#" class="export-calendar">Export to Calendar</a>
            <a href="#" class="export-pdf">Export as PDF</a>
        </div>
    `;
}

/**
 * Generates the HTML content for the semester dropdown menu.
 * @returns {string} - The semester dropdown HTML string.
 */
function createSemesterDropdown() {
    const semesters = [
        'Summer 2025', 'Spring 2025', 'Fall 2024', 
        'Summer 2024', 'Spring 2024', 'Fall 2023', 
        'Summer 2023', 'Spring 2023'
    ];

    return `
        <div class="semester-content">
            ${semesters.map(semester => `<a href="#">${semester}</a>`).join('')}
        </div>
    `;
}
