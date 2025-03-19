function fetchData() {
    fetchCourses();
    fetchProfessors();
    // Example course ID to fetch sections
    fetchSections('123');  // Replace '123' with a valid course ID
}

function fetchCourses() {
    fetch('http://localhost:5000/course/')
        .then(response => response.json())
        .then(data => {
            const coursesList = document.getElementById('courses-list');
            coursesList.innerHTML = '';  // Clear previous entries
            data.data.forEach(course => {
                const li = document.createElement('li');
                li.textContent = course.name;  // Assuming course objects have a 'name' property
                coursesList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching courses:', error));
}

function fetchSections(courseId) {
    fetch(`http://localhost:5000/course/sections/${courseId}`)
        .then(response => response.json())
        .then(data => {
            const sectionsList = document.getElementById('sections-list');
            sectionsList.innerHTML = '';  // Clear previous entries
            data.data.forEach(section => {
                const li = document.createElement('li');
                li.textContent = section.title;  // Assuming section objects have a 'title' property
                sectionsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching sections:', error));
}

function fetchProfessors() {
    fetch('http://localhost:5000/course/professors')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('professors-dropdown');
            data.data.forEach(professor => {
                const option = document.createElement('option');
                option.textContent = professor.name;  // Assuming professor objects have a 'name' property
                option.value = professor.id;  // Assuming professor objects have an 'id' property
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching professors:', error));
}
