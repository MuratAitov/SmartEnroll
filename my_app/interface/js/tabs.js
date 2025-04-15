function openTab(tabName, event) {
    console.log('Opening tab:', tabName);
    
    try {
        // First, hide all tab contents and views
        document.querySelectorAll(".tab-content, .main-content-view").forEach(content => {
            content.style.display = "none";
            content.classList.remove("active");
        });

        // Special handling for Registration tab
        if (tabName === "Registration") {
            console.log("Opening Registration tab");
            
            // Remove Finals content completely when switching to Registration
            if (typeof removeAllFinalsContent === 'function') {
                removeAllFinalsContent();
            } else {
                // Fallback if the function isn't available
                const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
                finalsElements.forEach(element => {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            }
            
            // Show Registration tab
            const registrationTab = document.getElementById("registration-view");
            if (registrationTab) {
                registrationTab.style.display = "block";
                registrationTab.classList.add("active");
                console.log("Registration view activated");
            } else {
                console.warn("Registration view element not found!");
            }
            
            // Create/update the registration sidebar
            if (typeof createRegistrationSidebar === 'function') {
                createRegistrationSidebar();
                console.log("Registration sidebar created");
            } else {
                console.warn("createRegistrationSidebar function not found!");
            }
            
            // Add active class to the navigation button
            if (event && event.currentTarget) {
                // Remove active class from all tab buttons
                document.querySelectorAll(".tab-button, .nav-links a").forEach(button => {
                    button.classList.remove("active");
                    button.style.color = "#333";
                });
                
                // Add active class to the clicked button
                event.currentTarget.classList.add("active");
                event.currentTarget.style.color = "#142A50";
                console.log("Navigation tab activated");
            }
            
            return; // Exit early for Registration tab
        }
        
        // Handle Finals tab specially - use the handler function if available
        if (tabName === "Finals") {
            console.log("Opening Finals tab");
            
            if (typeof handleFinalsTabClick === 'function') {
                // Use the dedicated handler that creates/restores Finals content
                handleFinalsTabClick(event ? event.currentTarget : null);
                return; // Exit early
            }
            
            // Fallback if handler not available
            const finalsTab = document.getElementById("Finals");
            if (finalsTab) {
                finalsTab.style.display = "block";
                finalsTab.classList.add("active");
                
                // Get the active semester button and show its content
                const activeBtn = finalsTab.querySelector('.semester-switch.active');
                if (activeBtn) {
                    const semester = activeBtn.getAttribute('data-semester');
                    const semesterContent = document.getElementById(semester + '-finals');
                    
                    // Hide all semester contents first
                    document.querySelectorAll('.finals-container').forEach(container => {
                        container.style.display = 'none';
                    });
                    
                    // Show the active semester content
                    if (semesterContent) {
                        semesterContent.style.display = 'block';
                    }
                } else {
                    // Default to fall if no semester is active
                    const fallContent = document.getElementById('fall-finals');
                    if (fallContent) {
                        fallContent.style.display = 'block';
                    }
                    
                    const fallBtn = document.getElementById('fall-btn');
                    if (fallBtn) {
                        fallBtn.classList.add('active');
                    }
                }
            }
            
            // Add active class to the navigation button
            if (event && event.currentTarget) {
                // Remove active class from all tab buttons
                document.querySelectorAll(".tab-button, .nav-links a").forEach(button => {
                    button.classList.remove("active");
                    button.style.color = "#333";
                });
                
                // Add active class to the clicked button
                event.currentTarget.classList.add("active");
                event.currentTarget.style.color = "#142A50";
            }
            
            return; // Exit early for Finals tab
        }
        
        // For other tabs, continue with normal flow
        
        // Show the selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = "block";
            selectedTab.classList.add("active");
        }
        
        // Add active class to the clicked button
        if (event && event.currentTarget) {
            document.querySelectorAll(".tab-button, .nav-links a").forEach(button => {
                button.classList.remove("active");
                button.style.color = "#333";
            });
            
            event.currentTarget.classList.add("active");
            event.currentTarget.style.color = "#142A50";
        }
    } catch (error) {
        console.error("Error in openTab function:", error);
    }
}

// Function to initialize tabs system and set Registration as the default tab
function initializeTabs() {
    console.log("Initializing tabs system...");
    
    // First, completely remove the Finals tab
    if (typeof removeAllFinalsContent === 'function') {
        removeAllFinalsContent();
    } else {
        // Fallback if the function isn't available
        const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
        finalsElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    // Find the Registration tab button
    const registrationTab = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    
    if (registrationTab) {
        console.log("Setting Registration as default tab");
        
        // Simulate a click on the Registration tab
        openTab('Registration', { currentTarget: registrationTab });
        
        // Also set the active class on the button
        registrationTab.classList.add('active');
        registrationTab.style.color = '#142A50';
    } else {
        console.warn("Registration tab button not found!");
    }
}

// Make openTab function available globally
window.openTab = openTab;
window.initializeTabs = initializeTabs;

// Initialize tabs on page load - use a higher priority
document.addEventListener('DOMContentLoaded', function() {
    // Force clear any potentially active tabs first
    document.querySelectorAll(".tab-content, .main-content-view, #Finals").forEach(content => {
        content.style.display = "none";
        content.classList.remove("active");
    });
    
    // Remove Finals content completely
    if (typeof removeAllFinalsContent === 'function') {
        removeAllFinalsContent();
    } else {
        // Fallback if the function isn't available
        const finalsElements = document.querySelectorAll('#Finals, .finals-container, [id$="-finals"]');
        finalsElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    // Run initialization with a slight delay to ensure DOM is ready
    setTimeout(initializeTabs, 50);
});

