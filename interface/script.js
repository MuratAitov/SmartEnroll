// First, move the handleDivisionClick function to the top
function handleDivisionClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get all division buttons
    const allBtns = document.querySelectorAll('.division-btn');
    
    // Remove selected class from all buttons
    allBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    this.classList.add('selected');
}

// Then have only one DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const semesterButton = document.querySelector('.semester-button');
    const semesterContent = document.querySelector('.semester-content');
    
    if (semesterButton && semesterContent) {
        semesterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            semesterContent.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = semesterContent.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });
    }

    const sidebarTabs = document.querySelectorAll('.sidebar-tabs a');
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active class from all tabs
            sidebarTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
        });
    });

    const profileButton = document.querySelector('.profile-button');
    const profileContent = document.querySelector('.profile-content');
    
    if (profileButton && profileContent) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileContent.classList.toggle('show');
            const arrow = this.querySelector('span');
            if (arrow) {
                arrow.style.transform = profileContent.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });
    }

    // Get all theme toggle buttons
    const themeToggles = document.querySelectorAll('.theme-toggle');
    console.log('Theme toggles found:', themeToggles.length); // Debug log

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            console.log('Theme toggle clicked'); // Debug log
            document.body.classList.toggle('dark-mode');
            console.log('Dark mode class:', document.body.classList.contains('dark-mode')); // Debug log
            
            // Update all theme toggle buttons' text
            themeToggles.forEach(btn => {
                btn.textContent = document.body.classList.contains('dark-mode') 
                    ? 'Light Mode' 
                    : 'Dark Mode';
            });
        });
    });

    // Prevent default button behavior
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Example of how to toggle auth state (you'll need to modify this based on your auth system)
    function updateAuthState(isAuthenticated) {
        if (isAuthenticated) {
            document.body.classList.add('is-authenticated');
        } else {
            document.body.classList.remove('is-authenticated');
        }
    }

    // Set initial auth state (example)
    updateAuthState(true); // or false depending on user's auth state

    // Division button selection
    const divisionBtns = document.querySelectorAll('.division-btn');
    console.log('Found division buttons:', divisionBtns.length);
    
    divisionBtns.forEach(btn => {
        console.log('Setting up click handler for:', btn.textContent);
        
        btn.addEventListener('click', function() {
            // Reset all buttons to default style
            divisionBtns.forEach(otherBtn => {
                otherBtn.style.cssText = `
                    border: 1px solid #C4C8CE;
                    color: #6c757d;
                    background-color: transparent;
                `;
            });
            
            // Style the clicked button with blue background and white text
            this.style.cssText = `
                border: 1px solid #002467;
                color: #ffffff;
                background-color: #002467;
            `;
        });
    });

    // Other event listeners - add null checks
    if (semesterButton && semesterContent) {
        semesterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            semesterContent.classList.toggle('show');
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = semesterContent.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });
    }

    if (profileButton && profileContent) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileContent.classList.toggle('show');
            const arrow = this.querySelector('span');
            if (arrow) {
                arrow.style.transform = profileContent.classList.contains('show') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
            }
        });
    }
});

function changeSemester(semester, element) {
    const button = document.querySelector('.semester-button');
    const content = document.querySelector('.semester-content');
    
    // Update button text
    button.innerHTML = semester + ' <span class="arrow">▼</span>';
    
    // Close the dropdown
    content.classList.remove('show');
    button.querySelector('.arrow').style.transform = 'rotate(0deg)';
}

function toggleTheme() {
    console.log('Toggle theme called'); // Debug log
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Update button text
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const isDarkMode = body.classList.contains('dark-mode');
    
    themeButtons.forEach(button => {
        button.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
    
    console.log('Dark mode:', isDarkMode); // Debug log
}

// Update selected semester with checkmark
document.querySelectorAll('.semester-content a').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove selected class from all items
        document.querySelectorAll('.semester-content a').forEach(a => {
            a.classList.remove('selected');
        });
        
        // Add selected class to clicked item
        this.classList.add('selected');
        
        // Update button text
        const selectedSemester = this.textContent;
        document.querySelector('.semester-button').textContent = selectedSemester + ' ▼';
        document.getElementById('semesterDropdown').classList.remove('show');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const userDropdown = document.getElementById('userDropdown');
    const dropdownItems = userDropdown.querySelectorAll('a, button.theme-toggle');
    
    // Function to close dropdown
    function closeDropdown() {
        userDropdown.classList.remove('show');
    }

    // Handle dropdown item clicks
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Handle theme toggle separately
            if (this.classList.contains('theme-toggle')) {
                toggleTheme();
            } else {
                // Update the user button text to show selection
                const selectedText = this.textContent;
                const userButton = document.querySelector('.user-dropdown .nav-button span');
                
                // Store the selection
                localStorage.setItem('lastSelection', selectedText);
                
                // Update UI to show selection
                if (userButton) {
                    userButton.textContent = selectedText;
                }
            }
            
            // Close the dropdown
            closeDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target) && 
            !e.target.matches('.user-dropdown .nav-button')) {
            closeDropdown();
        }
    });

    // Toggle dropdown on button click
    const dropdownButton = document.querySelector('.user-dropdown .nav-button');
    dropdownButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Restore last selection on page load
    const lastSelection = localStorage.getItem('lastSelection');
    if (lastSelection) {
        const userButton = document.querySelector('.user-dropdown .nav-button span');
        if (userButton) {
            userButton.textContent = lastSelection;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const mapLink = document.querySelector('.nav-links a[href="#map"]');
    const scheduleLink = document.querySelector('.nav-links a[href="#schedule"]');
    const sidebar = document.querySelector('.sidebar');
    
    // Store the schedule sidebar content
    const scheduleSidebar = sidebar.innerHTML;
    
    // Create the map sidebar content with simplified dropdowns
    const mapSidebar = `
        <div class="sidebar-tabs">
            <a href="#" class="active">Floor Plan</a>
            <a href="#">Schedule</a>
        </div>
        
        <div class="floor-tree">
            <div class="tree-item">
                <div class="tree-header" onclick="toggleTreeItem(this)">
                    <span class="building-name">Jepson</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="tree-content">
                    <div class="tree-subitem">Lower-level</div>
                    <div class="tree-subitem">First floor</div>
                    <div class="tree-subitem">Second floor</div>
                </div>
            </div>
            <div class="tree-item">
                <div class="tree-header" onclick="toggleTreeItem(this)">
                    <span class="building-name">Herak</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="tree-content">
                    <!-- Add Herak floors here if needed -->
                </div>
            </div>
        </div>
    `;

    // Add styles for the tree structure
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .floor-tree {
            padding: 20px;
        }

        .tree-item {
            margin-bottom: 15px;
        }

        .tree-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            padding: 8px 16px;
            transition: background-color 0.2s ease;
        }

        .building-name {
            font-size: 16px;
            color: #142A50;
        }

        .arrow {
            font-size: 12px;
            transition: transform 0.2s ease;
        }

        .tree-content {
            display: none;
            margin-top: 4px;
        }

        .tree-content.show {
            display: block;
        }

        .tree-subitem {
            padding: 8px 32px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .tree-subitem:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        /* Dark mode styles */
        body.dark-mode .building-name {
            color: #ffffff;
        }

        body.dark-mode .tree-subitem {
            color: #ffffff;
        }

        body.dark-mode .tree-subitem:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .sidebar-tabs {
            display: flex;
            gap: 20px;
            padding: 0 20px;
            border-bottom: 1px solid #e0e4e8;
        }

        .sidebar-tabs a {
            padding: 15px 0;
            color: #666;
            text-decoration: none;
            position: relative;
        }

        .sidebar-tabs a.active {
            color: #142A50;
        }

        .sidebar-tabs a.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #B41231;
        }

        body.dark-mode .sidebar-tabs {
            border-bottom-color: #2a4573;
        }
    `;
    document.head.appendChild(styleSheet);

    // Add the toggle function to window scope
    window.toggleTreeItem = function(header) {
        const content = header.nextElementSibling;
        const arrow = header.querySelector('.arrow');
        content.classList.toggle('show');
        arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
    };

    // Handle navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (this.getAttribute('href') === '#map') {
                sidebar.innerHTML = mapSidebar;
            } else if (this.getAttribute('href') === '#schedule') {
                sidebar.innerHTML = scheduleSidebar;
            }
        });
    });

    // Handle initial state
    if (window.location.hash === '#map') {
        mapLink.classList.add('active');
        sidebar.innerHTML = mapSidebar;
    } else if (window.location.hash === '#schedule' || !window.location.hash) {
        scheduleLink.classList.add('active');
        sidebar.innerHTML = scheduleSidebar;
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const divisionBtns = document.querySelectorAll('.division-btn');

    divisionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // If the clicked button is already selected, deselect it
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                this.style.cssText = `
                    border: 1px solid #C4C8CE;
                    color: #6c757d;
                    background-color: transparent;
                `;
            } else {
                // Deselect all buttons first
                divisionBtns.forEach(otherBtn => {
                    otherBtn.classList.remove('selected');
                    otherBtn.style.cssText = `
                        border: 1px solid #C4C8CE;
                        color: #6c757d;
                        background-color: transparent;
                    `;
                });

                // Apply selected styles to the clicked button
                this.classList.add('selected');
                this.style.cssText = `
                    border: 1px solid #002467;
                    color: #ffffff;
                    background-color: #002467;
                `;
            }
        });
    });
});
