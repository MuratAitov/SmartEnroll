            <a href="#" class="schedule-tab active">Schedule</a>
        <div class="schedule-view" style="display: block;">
    menu.querySelector('.edit').addEventListener('click', () => {
            btn.addEventListener('click', () => {
        editForm.querySelector('.save-btn').addEventListener('click', () => {
                    addEventToSchedule(newName, [day], newStart, newEnd);
        editForm.querySelector('.cancel-btn').addEventListener('click', () => {
    menu.querySelector('.color').addEventListener('click', () => {
            colorOption.addEventListener('click', () => {
        document.addEventListener('click', function closeColorPicker(e) {
    menu.querySelector('.duplicate').addEventListener('click', () => {
        addEventBlockListeners(clone);
    menu.querySelector('.delete').addEventListener('click', () => {
    document.addEventListener('click', function closeMenu(e) {
// Update the addEventBlockListeners function
function addEventBlockListeners(eventBlock) {
    eventBlock.addEventListener('click', (e) => {
// Update the addEventToSchedule function
function addEventToSchedule(eventName, days, startTime, endTime) {
            addEventBlockListeners(eventBlock);
            input.addEventListener('keypress', handleEnterKeyPress);
        recurringEventsForm.addEventListener('keypress', handleEnterKeyPress);
        recurringEventsTab.addEventListener('click', function(e) {
        coursesTab.addEventListener('click', function(e) {
        prereqTreeTab.addEventListener('click', function(e) {
        btn.addEventListener('click', function() {
        dropdownButton.addEventListener('click', function(e) {
            item.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
        btn.addEventListener('click', function() {
        input.addEventListener('input', function(e) {
        input.addEventListener('blur', function(e) {
        subjectInput.addEventListener('input', function() {
        subjectList.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
        attributeInput.addEventListener('input', function() {
        attributeList.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
        campusInput.addEventListener('input', function() {
        campusList.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
        methodsInput.addEventListener('input', function() {
        methodsList.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function() {
            // Add event to schedule
            addEventToSchedule(eventName, null, startTime, endTime);
        exportButton.addEventListener('click', function(e) {
        exportCalendar.addEventListener('click', function(e) {
        exportPDF.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
    // Get schedule data from your grid
    const scheduleGrid = document.querySelector('.schedule-grid');
    // Find all event blocks in the schedule
    const eventBlocks = scheduleGrid.querySelectorAll('.event-block');
    a.download = 'course_schedule.ics';
document.querySelector('.export-ioscalendar').addEventListener('click', function(e) {
document.addEventListener('DOMContentLoaded', function() {
        link.addEventListener('click', function(e) {
        semesterButton.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
            option.addEventListener('click', function(e) {
        tab.addEventListener('click', function(e) {
        toggle.addEventListener('click', (e) => {
        btn.addEventListener('click', function() {
        dropdownButton.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
        // Reset the schedule container
        const scheduleContainer = document.querySelector('.schedule-grid');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = `
            scheduleContainer.style.padding = '';
            scheduleContainer.style.overflow = '';
    mapLink.addEventListener('click', function(e) {
        const scheduleTab = document.querySelector('.schedule-tab');
        const scheduleView = document.querySelector('.schedule-view');
        floorPlanTab.addEventListener('click', function(e) {
            scheduleTab.classList.remove('active');
            scheduleView.style.display = 'none';
        scheduleTab.addEventListener('click', function(e) {
            scheduleView.style.display = 'block';
        exportButton.addEventListener('click', function(e) {
        document.addEventListener('click', function(e) {
            exportCalendar.addEventListener('click', function(e) {
            exportPDF.addEventListener('click', function(e) {
        searchPrereqBtn.addEventListener('click', function() {
        newGoogleCalendarLink.addEventListener('click', function(e) {
        addCourseBtn.addEventListener('click', addCourse);
        tab.addEventListener('click', function() {
        loginForm.addEventListener('submit', function(e) {
        registerForm.addEventListener('submit', function(e) {
        signInLink.addEventListener('click', function(e) {
        signOutLink.addEventListener('click', function(e) {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        scheduleContainer.style.padding = '0';  // Remove padding for full-width PDF
        scheduleContainer.style.overflow = 'hidden';  // Prevent scrollbars
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
document.querySelector('a[href="#signin"]').addEventListener('click', (e) => {
    tab.addEventListener('click', () => {
document.getElementById('authModal').addEventListener('click', (e) => {
    exportButton.addEventListener('click', function(e) {
    document.addEventListener('click', function(e) {
    input.addEventListener('input', function() {
    list.addEventListener('click', function(e) {
    document.addEventListener('click', function(e) {
        searchBtn.addEventListener('click', () => {
        courseInput.addEventListener('keypress', (e) => {
    prereqTreeTab.addEventListener('click', function(e) {
    coursesTab.addEventListener('click', function(e) {
        recurringEventsTab.addEventListener('click', function(e) {
// Function to export schedule to Google Calendar
    // Collect schedule data to send to the server
    const scheduleData = collectScheduleData();
    if (!scheduleData.courses || scheduleData.courses.length === 0) {
        alert('No courses found to export. Please add courses to your schedule first.');
    console.log('Exporting schedule data:', scheduleData);
        body: JSON.stringify(scheduleData)
                if (confirm('Your schedule has been exported. Would you like to view it in Google Calendar?')) {
        clientSideGoogleCalendarExport(scheduleData);
function clientSideGoogleCalendarExport(scheduleData) {
        const icsContent = generateICSContent(scheduleData);
        link.download = 'schedule.ics';
// Generate ICS file content from schedule data
function generateICSContent(scheduleData) {
    const semester = scheduleData.semester || 'Fall 2024';
    scheduleData.courses.forEach(course => {
// Helper function to collect schedule data from the UI
    // Get all course blocks from the schedule
document.addEventListener('DOMContentLoaded', function() {
        newAddCourseBtn.addEventListener('click', function(e) {
        item.addEventListener('click', function() {
                    // Remove from schedule
                            // Remove from schedule
        sortSelect.addEventListener('change', function() {
        resetButton.addEventListener('click', function() {
// Function to add a section to the schedule
    let cell = document.querySelector(`.schedule-grid tr:nth-child(${rowIndex}) td:nth-child(${dayIndex})`);
// Function to clear the schedule
document.addEventListener('DOMContentLoaded', function() {
            .schedule-grid {
document.addEventListener('DOMContentLoaded', function() {
        newAddCourseBtn.addEventListener('click', function(e) {
    document.querySelector('.export-ioscalendar').addEventListener('click', () => {
    document.querySelector('.export-googlecalendar').addEventListener('click', () => {
// Function to preview a section on the schedule
    section.schedule.forEach(timeSlot => {
            document.querySelector('.schedule-grid').appendChild(block);
        const cell = document.querySelector(`.schedule-grid td[data-day="${timeSlot.day}"][data-hour="${Math.floor(startHour)}"]`);
    sectionItem.addEventListener('mouseenter', () => {
    sectionItem.addEventListener('mouseleave', () => {
    // Add to schedule on click
    sectionItem.addEventListener('click', () => {
                <div>${section.schedule.map(slot => `${slot.day} ${slot.startTime}-${slot.endTime}`).join(', ')}</div>
    header.querySelector('.close-btn').addEventListener('click', () => {
