function createRegistrationSidebar() {
    console.log('Creating Registration sidebar and view...');
    
    // Completely remove the Finals tab from the DOM when in Registration view
    const finalsTab = document.getElementById('Finals');
    if (finalsTab) {
        // Hide it first (for graceful transition)
        finalsTab.style.display = 'none';
        finalsTab.classList.remove('active');
        
        // Store it in a variable for later restoration if needed
        if (!window._storedFinalsTab) {
            window._storedFinalsTab = finalsTab;
            // Remove from DOM to prevent it from being displayed
            if (finalsTab.parentNode) {
                finalsTab.parentNode.removeChild(finalsTab);
            }
        }
    }
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    // Create the course search interface based on the image
    sidebar.innerHTML = `
        <div class="tab-content active" id="Courses">
            <div class="backend-status">
                <div class="status-label">Backend Connection:</div>
                <div class="status-value" id="backend-status">Checking...</div>
            </div>
            
            <div class="search-form">
                <div class="form-group">
                    <input type="text" placeholder="Subject" id="subject-input">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Course code" id="course-code-input">
                </div>
                
                <div class="level-buttons">
                    <button class="division-btn" id="lower-division-btn">Lower Division</button>
                    <button class="division-btn" id="upper-division-btn">Upper Division</button>
                </div>
                
                <div class="form-group">
                    <input type="text" placeholder="Attributes" id="attributes-input">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Instructor" id="instructor-input">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Campus" id="campus-input">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Instructional Methods" id="methods-input">
                </div>
                
                <button id="search-courses-btn" class="search-btn">Search Courses</button>
            </div>
            
            <div id="available-courses">
                <h3>Available Courses</h3>
                <div id="sections-list"></div>
            </div>
            
            <div id="course-sections">
                <h3>Course Sections</h3>
                <div id="sections-details"></div>
            </div>
        </div>
    `;
    
    // Ensure the Registration tab is active in the navigation
    const registrationLink = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationLink) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            link.style.color = '';
        });
        registrationLink.classList.add('active');
        registrationLink.style.color = '#142A50';
    }
    
    // Set up event listeners for the search button
    const searchButton = sidebar.querySelector('#search-courses-btn');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (typeof fetchData === 'function') {
                fetchData();
            } else {
                console.log('fetchData function not available');
                // If fetchData isn't available, use mock data instead
                if (typeof generateMockSections === 'function') {
                    const subject = document.querySelector('#subject-input')?.value || '';
                    const courseCode = document.querySelector('#course-code-input')?.value || '';
                    const mockData = generateMockSections({
                        subject: subject.toUpperCase(),
                        course_code: courseCode
                    });
                    displaySections(mockData);
                }
            }
        });
    }
    
    // Set up division button toggling
    const divisionButtons = sidebar.querySelectorAll('.division-btn');
    divisionButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            if (button.classList.contains('selected')) {
                button.style.backgroundColor = '#142A50';
                button.style.color = 'white';
            } else {
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        });
    });
    
    // Create or find the Registration view container
    let registrationView = document.getElementById('registration-view');
    
    // If it doesn't exist, create it
    if (!registrationView) {
        console.log('Creating new registration-view element');
        registrationView = document.createElement('div');
        registrationView.id = 'registration-view';
        registrationView.className = 'main-content-view';
        
        // Find the appropriate parent to append it to
        const mainContent = document.querySelector('.main-content, main');
        if (mainContent) {
            mainContent.appendChild(registrationView);
        } else {
            // Fallback to body if main content not found
            console.warn('Main content container not found, appending to body');
            document.body.appendChild(registrationView);
        }
    }
    
    // Make the registration view active and hide all others
    document.querySelectorAll('.main-content-view, .tab-content').forEach(view => {
        if (view.id !== 'registration-view' && view.id !== 'Courses') {
            view.classList.remove('active');
            view.style.display = 'none';
        }
    });
    
    registrationView.classList.add('active');
    registrationView.style.display = 'block';
    
    // Make sure the schedule grid is visible
    if (!registrationView.querySelector('.schedule-grid')) {
        console.log('Creating schedule grid');
        registrationView.innerHTML = `
            <div class="schedule-container">
                <div class="schedule-grid">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>M</th>
                                <th>T</th>
                                <th>W</th>
                                <th>R</th>
                                <th>F</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTimeRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Check backend connection status if the function exists
    if (typeof checkBackendConnection === 'function') {
        checkBackendConnection();
    }
    
    // If we have a mock data function, pre-populate with some default data
    if (typeof generateMockSections === 'function' && typeof displaySections === 'function') {
        setTimeout(() => {
            console.log('Pre-populating with sample courses');
            const mockData = generateMockSections({ subject: 'CPSC' });
            displaySections(mockData);
        }, 500);
    }
    
    // Make double sure no Finals content is showing
    removeAllFinalsContent();
    
    console.log('Registration view initialization complete');
    return true; // Return success
}

// Helper function to completely remove Finals content from the page
function removeAllFinalsContent() {
    // Remove any Finals elements still in the DOM
    const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
    finalsElements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    // Clear any Finals-related content from the main area
    const mainContent = document.querySelector('.main-content, main');
    if (mainContent) {
        const finalsInMain = mainContent.querySelector('#Finals');
        if (finalsInMain) {
            mainContent.removeChild(finalsInMain);
        }
    }
}

// Helper function to generate time rows for the schedule grid
function generateTimeRows() {
    let rows = '';
    for (let hour = 8; hour <= 21; hour++) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'pm' : 'am';
        rows += `
            <tr>
                <td class="time-column">${displayHour} ${ampm}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }
    return rows;
}

// Function to display sections (if using mock data)
function displaySections(sections) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) {
        console.error('sections-list element not found');
        return;
    }
    
    if (!sections || sections.length === 0) {
        sectionsList.innerHTML = '<div class="no-results">No courses found matching your criteria.</div>';
        return;
    }
    
    console.log(`Displaying ${sections.length} sections`);
    
    // Group sections by subject and course code
    const courseGroups = {};
    sections.forEach(section => {
        const courseKey = `${section.subject} ${section.course_code}`;
        if (!courseGroups[courseKey]) {
            courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(section);
    });
    
    // Generate HTML for each course group
    let html = '';
    Object.keys(courseGroups).forEach(courseKey => {
        const sections = courseGroups[courseKey];
        html += `
            <div class="course-item">
                <div class="course-header">
                    <h3>${courseKey}</h3>
                    <span class="section-count">${sections.length} section${sections.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="section-list">
                    ${sections.map(section => `
                        <div class="section-item">
                            <div class="section-header">
                                <h4>Section ${section.section_number}</h4>
                                <div class="availability ${getAvailabilityClass(section)}">
                                    ${section.seats_available} / ${section.total_seats}
                                </div>
                            </div>
                            <div class="section-details">
                                <p><strong>Schedule:</strong> ${section.schedule}</p>
                                <p><strong>Instructor:</strong> ${section.instructor}</p>
                                <p><strong>Location:</strong> ${section.location}</p>
                                <p><strong>Credits:</strong> ${section.credits}</p>
                            </div>
                            <div class="section-actions">
                                <button class="add-section-btn" onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')">Add to Schedule</button>
                                <button class="search-prereq-btn" onclick="displayPrerequisiteTree('${section.subject}${section.course_code}')">Prerequisites</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    sectionsList.innerHTML = html;
    
    // Make the add-section-btn buttons work if the addSectionToSchedule function exists
    if (typeof window.addSectionToSchedule !== 'function') {
        console.log('Defining global addSectionToSchedule function');
        window.addSectionToSchedule = function(subject, courseCode, sectionNumber) {
            console.log(`Adding section to schedule: ${subject} ${courseCode}-${sectionNumber}`);
            alert(`Added ${subject} ${courseCode}-${sectionNumber} to your schedule`);
            // Here you would call the real implementation if it exists
        };
    }
    
    // Make the prerequisite buttons work if the function doesn't exist
    if (typeof window.displayPrerequisiteTree !== 'function') {
        console.log('Defining global displayPrerequisiteTree function');
        window.displayPrerequisiteTree = function(courseCode) {
            console.log(`Showing prerequisites for: ${courseCode}`);
            alert(`Prerequisites for ${courseCode} would be shown here`);
            // Here you would call the real implementation if it exists
        };
    }
    
    // Make sure no Finals content gets displayed
    removeAllFinalsContent();
}

// Helper function to determine availability class
function getAvailabilityClass(section) {
    const ratio = section.seats_available / section.total_seats;
    if (section.seats_available === 0) return 'full';
    if (ratio < 0.2) return 'limited';
    return 'available';
}

// Function to explicitly initialize registration view - call this on page load
function initializeRegistrationView() {
    console.log('Initializing Registration view directly');
    
    // Remove Finals tab completely from the DOM
    removeAllFinalsContent();
    
    // Create registration sidebar
    const result = createRegistrationSidebar();
    
    // If successful, ensure registration is visible
    if (result) {
        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'block';
            registrationView.classList.add('active');
        }
    }
    
    return result;
}

// Export functions that might be used elsewhere
window.createRegistrationSidebar = createRegistrationSidebar;
window.displaySections = displaySections;
window.initializeRegistrationView = initializeRegistrationView;
window.removeAllFinalsContent = removeAllFinalsContent;

// Auto-initialize on script load with highest priority
document.addEventListener('DOMContentLoaded', function() {
    // Remove Finals content immediately
    setTimeout(removeAllFinalsContent, 0);
    
    // Initialize registration view next
    setTimeout(initializeRegistrationView, 10);
    
    // Do another check after a short delay
    setTimeout(removeAllFinalsContent, 100);
});