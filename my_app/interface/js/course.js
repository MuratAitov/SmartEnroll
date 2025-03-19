/**
 * Initiates fetching of all necessary data.
 */
function fetchData() {
    fetchCourses();
    fetchProfessors();
    fetchSections('123');  // Example course ID, replace with a valid ID dynamically
}

/**
 * Fetches a list of courses from the backend.
 */
function fetchCourses() {
    fetchAPI('http://localhost:5000/course/')
        .then(data => updateCoursesList(data))
        .catch(error => console.error('Error fetching courses:', error));
}

/**
 * Updates the course list in the UI.
 * @param {Object} data - API response data containing course list.
 */
function updateCoursesList(data) {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;

    coursesList.innerHTML = '';  // Clear previous entries
    data.data.forEach(course => {
        const li = document.createElement('li');
        li.textContent = course.name;  // Assuming course objects have a 'name' property
        coursesList.appendChild(li);
    });
}

/**
 * Fetches sections for a specific course.
 * @param {string} courseId - The ID of the course to fetch sections for.
 */
function fetchSections(courseId) {
    fetchAPI(`http://localhost:5000/course/sections/${courseId}`)
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
    data.data.forEach(section => {
        const li = document.createElement('li');
        li.textContent = section.title;  // Assuming section objects have a 'title' property
        sectionsList.appendChild(li);
    });
}

/**
 * Fetches a list of professors from the backend.
 */
function fetchProfessors() {
    fetchAPI('http://localhost:5000/course/professors')
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
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
}
