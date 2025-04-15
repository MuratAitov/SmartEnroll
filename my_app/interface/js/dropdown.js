// dropdown.js
export function createExportDropdown() {
    return `
        <div class="export-dropdown">
            <a href="#" class="export-calendar">Export to Calendar</a>
            <a href="#" class="export-pdf">Export as PDF</a>
        </div>
    `;
}

export function createSemesterDropdown() {
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

/**
 * Helper function to initialize a dropdown.
 * @param {string} buttonSelector - The dropdown button selector.
 * @param {string} dropdownSelector - The dropdown content selector.
 * @param {Array} closeOtherSelectors - Other dropdowns to close (optional).
 */
function setupDropdown(buttonSelector, dropdownSelector, closeOtherSelectors = []) {
    const button = document.querySelector(buttonSelector);
    const dropdown = document.querySelector(dropdownSelector);
    
    if (button && dropdown) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            closeOtherSelectors.forEach(selector => {
                const otherDropdown = document.querySelector(selector);
                if (otherDropdown) otherDropdown.classList.remove('show');
            });

            dropdown.classList.toggle('show');
            toggleDropdownArrow(button, dropdown);
        });

        document.addEventListener('click', function (e) {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                resetDropdownArrow(button);
            }
        });

        dropdown.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', function (e) {
                e.preventDefault();
                button.innerHTML = `${this.textContent} <span class="arrow">▼</span>`;
                dropdown.classList.remove('show');
                resetDropdownArrow(button);
            });
        });
    }
}

/**
 * Toggles the dropdown arrow rotation.
 * @param {HTMLElement} button - The dropdown button element.
 * @param {HTMLElement} dropdown - The dropdown content element.
 */
function toggleDropdownArrow(button, dropdown) {
    const arrow = button.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

/**
 * Resets the dropdown arrow rotation.
 * @param {HTMLElement} button - The dropdown button element.
 */
function resetDropdownArrow(button) {
    const arrow = button.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
    }
}