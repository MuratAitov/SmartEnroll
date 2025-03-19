/**
 * Creates the Map Sidebar structure.
 * @returns {string} - HTML structure for the map sidebar.
 */
function createMapSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="schedule-tab active">Schedule</a>
            <a href="#" class="floor-plan-tab">Floor Plan</a>
        </div>

        <div class="floor-tree" style="display: none;">
            ${createBuildingTree()}
        </div>

        <div class="schedule-view" style="display: block;">
            ${createWeekdayPanels()}
        </div>
    `;
}

/**
 * Generates the building tree structure for floor plans.
 * @returns {string} - HTML structure of building tree.
 */
function createBuildingTree() {
    return `
        <div class="tree-item">
            <div class="tree-header" onclick="toggleTreeItem(this)">
                <span class="building-name">Jepson</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content">
                <div class="tree-subitem" onclick="openJepsonBasementPDF()">Lower-level</div>
                <div class="tree-subitem" onclick="openJepsonFirstFloorPDF()">First floor</div>
                <div class="tree-subitem">Second floor</div>
            </div>
        </div>
        <div class="tree-item">
            <div class="tree-header" onclick="openHerakPDF()">
                <span class="building-name">Herak</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content"></div>
        </div>
    `;
}

/**
 * Creates the weekday panels for the schedule view.
 * @returns {string} - HTML structure for weekday panels.
 */
function createWeekdayPanels() {
    const days = {
        Monday: "No classes this day!",
        Tuesday: "MATH 231 - Calculus (2)",
        Wednesday: "No classes this day!",
        Thursday: "MATH 231 - Calculus (2)",
        Friday: "No classes this day!"
    };

    return `
        <div class="weekday-panels">
            ${Object.entries(days).map(([day, content]) => `
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>${day}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">${content}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Updates the selected semester and closes the dropdown.
 * @param {string} semester - Selected semester name.
 */
function changeSemester(semester) {
    const button = document.querySelector('.semester-button');
    const content = document.querySelector('.semester-content');

    button.innerHTML = `${semester} <span class="arrow">▼</span>`;
    content.classList.remove('show');
    button.querySelector('.arrow').style.transform = 'rotate(0deg)';
}

/**
 * Toggles visibility of tree content and rotates the arrow.
 * @param {HTMLElement} header - The header element clicked.
 */
function toggleTreeItem(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');

    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

/**
 * Creates the Recurring Events content for the sidebar.
 * @returns {string} - HTML structure for recurring events.
 */
function createRecurringEventsContent() {
    return `
        <div class="recurring-events-view">
            <div class="form-group"><input type="text" placeholder="Event Name" id="eventNameInput"></div>
            <div class="form-group">${createWeekdayButtons()}</div>
            <div class="form-group"><input type="text" placeholder="Start Time --:--" class="time-input" id="start-time" maxlength="5"></div>
            <div class="form-group"><input type="text" placeholder="End Time --:--" class="time-input" id="end-time" maxlength="5"></div>
            <button class="add-event-btn">Add</button>
        </div>
    `;
}

/**
 * Generates weekday selection buttons.
 * @returns {string} - HTML string for weekday buttons.
 */
function createWeekdayButtons() {
    const days = ['M', 'T', 'W', 'R', 'F'];
    return `
        <div class="weekday-buttons">
            ${days.map(day => `<button class="weekday-btn">${day}</button>`).join('')}
        </div>
    `;
}

/**
 * Creates the Registration Sidebar structure.
 * @returns {string} - HTML structure for the registration sidebar.
 */
function createRegistrationSidebar() {
    return `
        <div class="sidebar-tabs">
            <a href="#" class="courses-tab active">Courses</a>
            <a href="#" class="recurring-events-tab">Recurring Events</a>
            <a href="#" class="prereq-tree-tab">Pre-Req Tree</a>
        </div>

        <div class="courses-view">${createCourseFilters()}</div>
        <div class="recurring-events-view" style="display: none;">${createRecurringEventsContent()}</div>
        <div class="prereq-tree-view" style="display: none;">${createPreReqTreeContent()}</div>
    `;
}

/**
 * Generates the filters and inputs for course selection.
 * @returns {string} - HTML string for course filters.
 */
function createCourseFilters() {
    return `
        <div class="form-group"><input type="text" placeholder="Subject" id="subjectInput" autocomplete="off"></div>
        <div class="form-group"><input type="text" placeholder="Course code"></div>
        <div class="form-group">${createDivisionButtons()}</div>
        <div class="form-group"><input type="text" placeholder="Attributes" id="attributeInput" autocomplete="off"></div>
        <div class="form-group"><input type="text" placeholder="Instructor"></div>
        <div class="form-group"><input type="text" placeholder="Campus" id="campusInput" autocomplete="off"></div>
        <div class="form-group"><input type="text" placeholder="Instructional Methods" id="methodsInput" autocomplete="off"></div>
    `;
}

/**
 * Generates the division selection buttons.
 * @returns {string} - HTML string for division buttons.
 */
function createDivisionButtons() {
    return `
        <div class="level-buttons">
            <button class="division-btn" id="lower-division">Lower Division</button>
            <button class="division-btn" id="upper-division">Upper Division</button>
        </div>
    `;
}

/**
 * Creates the placeholder content for the Pre-Req Tree.
 * @returns {string} - HTML structure for pre-req tree view.
 */
function createPreReqTreeContent() {
    return `
        <div class="prereq-tree-container">
            <div class="coming-soon">Pre-Requisite Tree View Coming Soon</div>
        </div>
    `;
}
