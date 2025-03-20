/**
 * Initiates fetching of all necessary data.
 */
function fetchData() {
    fetchCourses();
    fetchProfessors();
    fetchSections('123');  // Example course ID, replace with a valid ID dynamically
}

/**
 * Checks if the backend is connected and updates the connection indicator.
 * Call this function when the page loads.
 */
function checkBackendConnection() {
    const connectionIndicator = document.getElementById('connection-indicator');
    if (!connectionIndicator) return;
    
    connectionIndicator.textContent = 'Checking...';
    connectionIndicator.style.backgroundColor = '#f0f0f0';
    connectionIndicator.style.color = '#666';
    
    fetch('http://localhost:5001/courses_bp/', { method: 'GET' })
        .then(response => {
            if (response.ok) {
                connectionIndicator.textContent = 'Connected';
                connectionIndicator.style.backgroundColor = '#d4edda';
                connectionIndicator.style.color = '#155724';
                console.log('Successfully connected to backend');
                return true;
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .catch(error => {
            connectionIndicator.textContent = 'Disconnected';
            connectionIndicator.style.backgroundColor = '#f8d7da';
            connectionIndicator.style.color = '#721c24';
            console.error('Failed to connect to backend:', error);
            displayConnectionError();
            return false;
        });
}

/**
 * Displays a connection error message in the courses list.
 */
function displayConnectionError() {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;
    
    coursesList.innerHTML = '';
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #721c24; background-color: #f8d7da; border-radius: 4px;">
            <h3>Connection Error</h3>
            <p>Could not connect to the backend server. Please check that:</p>
            <ul style="text-align: left; padding-left: 20px;">
                <li>The Flask server is running on port 5001</li>
                <li>The courses_bp endpoint is correctly defined</li>
                <li>There are no CORS issues blocking the connection</li>
            </ul>
            <button onclick="checkBackendConnection()" style="margin-top: 10px; padding: 8px 16px; background-color: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry Connection
            </button>
        </div>
    `;
    coursesList.appendChild(errorMessage);
}

/**
 * Fetches a list of courses from the backend.
 */
function fetchCourses() {
    fetchAPI('http://localhost:5001/courses_bp/')  // Updated port and path to match backend
        .then(data => updateCoursesList(data))
        .catch(error => console.error('Error fetching courses:', error));
}

/**
 * Updates the course list in the UI.
 * @param {Object} data - API response data containing course list.
 */
function updateCoursesList(data) {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) {
        console.error('Could not find courses-list element in the DOM');
        return;
    }

    console.log('Updating courses list with data:', data);
    coursesList.innerHTML = '';  // Clear previous entries
    
    if (!data || !data.data || data.data.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No courses found';
        li.style.padding = '10px';
        li.style.color = '#666';
        coursesList.appendChild(li);
        console.log('No courses data found');
        return;
    }
    
    // Add a success message
    const successMessage = document.createElement('div');
    successMessage.style.padding = '10px';
    successMessage.style.marginBottom = '10px';
    successMessage.style.backgroundColor = '#d4edda';
    successMessage.style.borderRadius = '4px';
    successMessage.style.color = '#155724';
    successMessage.style.fontSize = '14px';
    successMessage.textContent = `Successfully loaded ${data.data.length} courses from the database`;
    coursesList.appendChild(successMessage);
    
    // Create a styled list container
    const listContainer = document.createElement('div');
    listContainer.style.border = '1px solid #e0e0e0';
    listContainer.style.borderRadius = '4px';
    listContainer.style.overflow = 'hidden';
    
    data.data.forEach((course, index) => {
        const li = document.createElement('div');
        li.style.padding = '12px 15px';
        li.style.borderBottom = index < data.data.length - 1 ? '1px solid #eee' : 'none';
        li.style.cursor = 'pointer';
        li.style.backgroundColor = 'white';
        li.style.transition = 'background-color 0.2s';
        
        // Create a more detailed course display
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 500; color: #142A50;">${course.name || 'Unnamed Course'}</div>
                    <div style="font-size: 13px; color: #666;">ID: ${course.id || 'N/A'}</div>
                </div>
                <div style="color: #666; font-size: 13px;">${course.credits || '0'} Credits</div>
            </div>
        `;
        
        // Add hover effect
        li.onmouseover = function() { 
            this.style.backgroundColor = '#f8f9fa'; 
        };
        li.onmouseout = function() { 
            this.style.backgroundColor = 'white'; 
        };
        
        // Add click handler to fetch sections
        li.onclick = function() { 
            fetchSections(course.id);
            
            // Highlight the selected course
            const allItems = listContainer.querySelectorAll('div');
            allItems.forEach(item => item.style.borderLeft = 'none');
            this.style.borderLeft = '4px solid #142A50';
            this.style.paddingLeft = '11px'; // Adjust padding to account for border
        };
        
        listContainer.appendChild(li);
    });
    
    coursesList.appendChild(listContainer);
}

/**
 * Fetches sections for a specific course.
 * @param {string} courseId - The ID of the course to fetch sections for.
 */
function fetchSections(courseId) {
    fetchAPI(`http://localhost:5001/courses_bp/sections/${courseId}`)  // Updated port and path
        .then(data => updateSectionsList(data))
        .catch(error => console.error(`Error fetching sections for course ${courseId}:`, error));
}

/**
 * Updates the sections list in the UI.
 * @param {Object} data - API response data containing section details.
 */
function updateSectionsList(data) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) return;

    sectionsList.innerHTML = '';  // Clear previous entries
    
    if (!data || !data.data || data.data.length === 0) {
        const li = document.createElement('div');
        li.textContent = 'No sections available for this course';
        li.style.padding = '10px';
        li.style.color = '#666';
        sectionsList.appendChild(li);
        return;
    }
    
    // Create a table for sections
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #e0e0e0';
    table.style.borderRadius = '4px';
    table.style.overflow = 'hidden';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f8f9fa';
    
    ['Section', 'Instructor', 'Time', 'Location', 'Status'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px';
        th.style.textAlign = 'left';
        th.style.fontWeight = '500';
        th.style.fontSize = '14px';
        th.style.color = '#495057';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    data.data.forEach((section, index) => {
        const row = document.createElement('tr');
        row.style.borderBottom = index < data.data.length - 1 ? '1px solid #eee' : 'none';
        row.style.backgroundColor = 'white';
        row.style.transition = 'background-color 0.2s';
        
        // Add hover effect
        row.onmouseover = function() { 
            this.style.backgroundColor = '#f8f9fa'; 
        };
        row.onmouseout = function() { 
            this.style.backgroundColor = 'white'; 
        };
        
        // Section number
        const sectionCell = document.createElement('td');
        sectionCell.textContent = section.number || 'N/A';
        sectionCell.style.padding = '10px';
        row.appendChild(sectionCell);
        
        // Instructor
        const instructorCell = document.createElement('td');
        instructorCell.textContent = section.instructor || 'TBA';
        instructorCell.style.padding = '10px';
        row.appendChild(instructorCell);
        
        // Time
        const timeCell = document.createElement('td');
        timeCell.textContent = section.time || 'TBA';
        timeCell.style.padding = '10px';
        row.appendChild(timeCell);
        
        // Location
        const locationCell = document.createElement('td');
        locationCell.textContent = section.location || 'TBA';
        locationCell.style.padding = '10px';
        row.appendChild(locationCell);
        
        // Status
        const statusCell = document.createElement('td');
        const status = section.status || 'Unknown';
        statusCell.textContent = status;
        statusCell.style.padding = '10px';
        
        // Color code the status
        if (status.toLowerCase() === 'open') {
            statusCell.style.color = '#28a745';
        } else if (status.toLowerCase() === 'closed') {
            statusCell.style.color = '#dc3545';
        } else if (status.toLowerCase() === 'waitlist') {
            statusCell.style.color = '#fd7e14';
        }
        
        row.appendChild(statusCell);
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    sectionsList.appendChild(table);
}

/**
 * Fetches a list of professors from the backend.
 */
function fetchProfessors() {
    fetchAPI('http://localhost:5001/courses_bp/professors')  // Updated port and path
        .then(data => updateProfessorsDropdown(data))
        .catch(error => console.error('Error fetching professors:', error));
}

/**
 * Updates the professor dropdown list in the UI.
 * @param {Object} data - API response data containing professor details.
 */
function updateProfessorsDropdown(data) {
    const dropdown = document.getElementById('professors-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';  // Clear existing options
    data.data.forEach(professor => {
        const option = document.createElement('option');
        option.textContent = professor.name;  // Assuming professor objects have a 'name' property
        option.value = professor.id;  // Assuming professor objects have an 'id' property
        dropdown.appendChild(option);
    });
}

/**
 * Generic function to fetch API data.
 * @param {string} url - The API endpoint to fetch from.
 * @returns {Promise<Object>} - The parsed JSON response.
 */
function fetchAPI(url) {
    console.log(`Fetching data from: ${url}`);
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log(`Successful response from: ${url}`);
            return response.json();
        })
        .then(data => {
            console.log('API Response Data:', data);
            return data;
        });
}
