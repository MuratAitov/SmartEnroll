    // Campus dropdown functionality
    const campusDropdown = document.querySelector('.campus-dropdown');
        const dropdownButton = campusDropdown.querySelector('.dropdown-button');
        const dropdownList = campusDropdown.querySelector('.dropdown-list');
        const dropdownItems = campusDropdown.querySelectorAll('.dropdown-item');
            dropdownList.classList.toggle('show');
                arrow.style.transform = dropdownList.classList.contains('show') 
        dropdownItems.forEach(item => {
                dropdownButton.innerHTML = selectedText + ' <span class="arrow">▼</span>';
                dropdownList.classList.remove('show');
                dropdownButton.querySelector('.arrow').style.transform = 'rotate(0deg)';
        // Close dropdown when clicking outside
                dropdownList.classList.remove('show');
                const arrow = dropdownButton.querySelector('.arrow');
        // Add the dropdown content after the button
        const exportDropdown = exportContainer.querySelector('.export-dropdown');
        // Toggle dropdown on button click
            // Close user dropdown if open
            const userDropdown = document.querySelector('.user-dropdown .dropdown-content');
        // Close dropdown when clicking outside
        <div class="export-dropdown">
// Update the semester dropdown content
    document.querySelector('.export-dropdown').classList.remove('show');
        // Toggle dropdown on button click
            // Close other dropdowns if open
            const exportDropdown = document.querySelector('.export-dropdown');
            const userDropdown = document.querySelector('.user-dropdown .dropdown-content');
        // Close dropdown when clicking outside
        // Update semester text and close dropdown when option is selected
        const dropdownButton = document.querySelector('.user-dropdown .nav-button');
        // Toggle dropdown on button click
            // Close export dropdown if open
            const exportDropdown = document.querySelector('.export-dropdown');
        // Close dropdown when clicking outside
                !e.target.matches('.user-dropdown .nav-button')) {
                const arrow = dropdownButton.querySelector('.arrow');
    // Export dropdown functionality
    const exportDropdown = document.querySelector('.export-dropdown');
        // Toggle dropdown on button click
            // Close other dropdowns
            // Toggle export dropdown
        // Close dropdown when clicking outside
            // Close the dropdown after clicking
            const exportDropdown = document.querySelector('.export-dropdown');
// Add this function to initialize the export dropdown
    // Create and append the dropdown if it doesn't exist
    if (!exportContainer.querySelector('.export-dropdown')) {
        exportDropdown.className = 'export-dropdown';
    const exportDropdown = exportContainer.querySelector('.export-dropdown');
    // Toggle dropdown on button click
        // Close user dropdown if open
    // Close dropdown when clicking outside
