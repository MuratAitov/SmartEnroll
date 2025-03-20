/**
 * This file handles interaction with the prerequisite API and rendering of prerequisite trees
 */

/**
 * Fetches prerequisite data for a specific course.
 * @param {string} courseCode - The course code (e.g., "CPSC 325")
 * @param {boolean} includeAllLevels - Whether to include all prerequisite levels (true) or just direct prerequisites (false)
 * @returns {Promise} A promise that resolves to the prerequisite data
 */
function fetchPrerequisites(courseCode, includeAllLevels = true) {
    // Show loading state in the UI
    const prereqInfo = document.querySelector('.prereq-info');
    if (prereqInfo) {
        prereqInfo.innerHTML = '<p style="text-align: center; color: #666;">Loading prerequisite data...</p>';
    }

    console.log(`Fetching prerequisites for ${courseCode}, all levels: ${includeAllLevels}`);

    // Make the API request to the backend
    return fetch(`http://localhost:5001/api_bp/graph?course=${encodeURIComponent(courseCode)}&all=${includeAllLevels}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received prerequisite data:', data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching prerequisites:', error);
            if (prereqInfo) {
                prereqInfo.innerHTML = `
                    <p style="color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 4px;">
                        Error loading prerequisites: ${error.message}
                    </p>
                    <p>Please check that the course code is valid and try again.</p>
                `;
            }
            throw error;
        });
}

/**
 * Displays the prerequisite tree for a course.
 * @param {string} courseCode - The course code to display prerequisites for
 */
function displayPrerequisiteTree(courseCode) {
    fetchPrerequisites(courseCode)
        .then(data => {
            renderPrerequisiteTree(data);
            // Also display the tree in the main grid area
            displayTreeInMainGrid(data, courseCode);
        })
        .catch(error => {
            console.error('Failed to display prerequisite tree:', error);
        });
}

/**
 * Renders the prerequisite tree in the UI.
 * @param {Object} data - The prerequisite data from the API
 */
function renderPrerequisiteTree(data) {
    const prereqInfo = document.querySelector('.prereq-info');
    if (!prereqInfo) return;

    // Clear any existing content
    prereqInfo.innerHTML = '';

    // If there's no data or empty nodes/edges
    if (!data || !data.nodes || data.nodes.length === 0) {
        prereqInfo.innerHTML = `
            <p style="color: #0c5460; background-color: #d1ecf1; padding: 10px; border-radius: 4px;">
                No prerequisites found for this course.
            </p>
        `;
        return;
    }

    // Create a container for the visualization
    const treeContainer = document.createElement('div');
    treeContainer.id = 'prereq-tree-container';
    treeContainer.style.width = '100%';
    treeContainer.style.marginTop = '20px';
    treeContainer.style.maxHeight = '400px'; // Set a max height to ensure it's scrollable
    treeContainer.style.overflowY = 'auto';  // Make it scrollable
    prereqInfo.appendChild(treeContainer);

    // Create a simple tree view
    const rootNode = findRootNode(data.nodes, data.edges);
    if (rootNode) {
        // Use the same enhanced tree builder for consistency with main view
        const treeHtml = buildSidebarTreeHtml(rootNode, data.nodes, data.edges);
        treeContainer.innerHTML = treeHtml;
    } else {
        treeContainer.innerHTML = '<p>Could not determine the root course.</p>';
    }

    // Add a course list for easy navigation
    addCourseList(data.nodes, data.edges, prereqInfo);
}

/**
 * Builds HTML for the prerequisite tree in the sidebar.
 * @param {Object} node - The current node to render
 * @param {Array} allNodes - All nodes from the API
 * @param {Array} allEdges - All edges from the API
 * @param {number} level - The current nesting level (for indentation)
 * @returns {string} HTML for the tree
 */
function buildSidebarTreeHtml(node, allNodes, allEdges, level = 0) {
    if (!node) return '';
    
    // Find all edges where this node is the target (i.e., its prerequisites)
    const prereqEdges = allEdges.filter(edge => edge.target === node.id);
    
    // Style based on level - compact for sidebar
    const padding = level * 15;
    const backgroundColor = level === 0 ? '#f8f9fa' : (level % 2 === 0 ? '#f8f9fa' : '#f1f3f5');
    const borderColor = level === 0 ? '#142A50' : (level === 1 ? '#6c757d' : '#adb5bd');
    
    let html = `
        <div class="prereq-node-sidebar" style="padding: 10px; 
                                             margin: 5px 0; 
                                             border-radius: 4px; 
                                             background-color: ${backgroundColor}; 
                                             border-left: 3px solid ${borderColor};
                                             margin-left: ${padding}px;">
            <div style="font-weight: ${level === 0 ? '600' : '500'}; 
                      font-size: ${level === 0 ? '14px' : '13px'}; 
                      color: ${level === 0 ? '#142A50' : '#333'};">
                ${node.id} - ${node.name}
            </div>
    `;
    
    if (prereqEdges.length > 0) {
        // Group prerequisites by relation type (AND/OR)
        const groupedByRelation = {};
        prereqEdges.forEach(edge => {
            const relation = edge.relation || 'and';
            if (!groupedByRelation[relation]) {
                groupedByRelation[relation] = [];
            }
            groupedByRelation[relation].push(edge);
        });
        
        // Process each relation group
        Object.entries(groupedByRelation).forEach(([relation, edges]) => {
            if (edges.length > 0) {
                // Use red for OR relationships
                const relationBgColor = relation.toLowerCase() === 'or' ? '#fff5f5' : '#f1f3f5';
                const relationBorderColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#ced4da';
                const relationTextColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#495057';
                
                html += `
                    <div style="margin: 5px 0; 
                              padding: 5px 8px; 
                              background-color: ${relationBgColor}; 
                              border-left: 2px solid ${relationBorderColor}; 
                              color: ${relationTextColor}; 
                              font-size: 12px; 
                              border-radius: 3px;">
                        ${relation.toLowerCase() === 'or' ? 'Complete ONE of:' : 'Complete ALL of:'}
                    </div>
                `;
                
                // Add each prerequisite course
                edges.forEach(edge => {
                    const prereqNode = allNodes.find(n => n.id === edge.source);
                    if (prereqNode) {
                        html += buildSidebarTreeHtml(prereqNode, allNodes, allEdges, level + 1);
                    }
                });
            }
        });
    } else if (level > 0) {
        // If this is a leaf node but not the root, show a simple message
        html += `<div style="font-size: 12px; color: #6c757d; margin-top: 2px;">No further prerequisites</div>`;
    }
    
    html += `</div>`;
    return html;
}

/**
 * Finds the root node in the prerequisite tree (the course that has no dependents).
 * @param {Array} nodes - The nodes from the API response
 * @param {Array} edges - The edges from the API response
 * @returns {Object} The root node
 */
function findRootNode(nodes, edges) {
    if (!nodes || !edges || nodes.length === 0) {
        return null;
    }
    
    // Try to find the node that is only a target and never a source
    const targetIds = new Set(edges.map(edge => edge.target));
    const sourceIds = new Set(edges.map(edge => edge.source));
    
    // Find nodes that are only targets and never sources
    const potentialRoots = Array.from(targetIds).filter(id => !sourceIds.has(id));
    
    if (potentialRoots.length > 0) {
        // Find the node object for the first potential root
        return nodes.find(node => node.id === potentialRoots[0]);
    }
    
    // If we couldn't find a clear root, use the first node with most incoming edges
    const targetCounts = {};
    edges.forEach(edge => {
        targetCounts[edge.target] = (targetCounts[edge.target] || 0) + 1;
    });
    
    // Find the node ID with the most incoming edges
    let maxCount = 0;
    let rootId = null;
    
    Object.entries(targetCounts).forEach(([id, count]) => {
        if (count > maxCount) {
            maxCount = count;
            rootId = id;
        }
    });
    
    if (rootId) {
        return nodes.find(node => node.id === rootId);
    }
    
    // Last resort: return the first node
    return nodes[0];
}

/**
 * Adds a list of all courses in the prerequisite tree for easy navigation.
 * @param {Array} nodes - All nodes from the API
 * @param {Array} edges - All edges from the API
 * @param {HTMLElement} container - The container to add the list to
 */
function addCourseList(nodes, edges, container) {
    if (!nodes || nodes.length <= 1) return;
    
    const courseListContainer = document.createElement('div');
    courseListContainer.style.marginTop = '30px';
    courseListContainer.style.padding = '15px';
    courseListContainer.style.backgroundColor = '#f8f9fa';
    courseListContainer.style.borderRadius = '4px';
    
    courseListContainer.innerHTML = `
        <h4 style="margin-top: 0; color: #142A50; font-size: 16px; margin-bottom: 10px;">All Courses in This Tree</h4>
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Click any course to see its details:</div>
        <div class="course-list" style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${nodes.map(node => `
                <button onclick="displayPrerequisiteTree('${node.id}')" style="background-color: white; border: 1px solid #ddd; border-radius: 4px; padding: 6px 12px; font-size: 13px; cursor: pointer; color: #333; transition: all 0.2s;">
                    ${node.id}
                </button>
            `).join('')}
        </div>
    `;
    
    container.appendChild(courseListContainer);
}

/**
 * Displays the prerequisite tree in the main grid area.
 * @param {Object} data - The prerequisite data to display
 * @param {string} courseCode - The course code being displayed
 */
function displayTreeInMainGrid(data, courseCode) {
    // Save the current tree data for later use
    window.currentPrereqData = data;
    window.currentCourseCode = courseCode;
    
    // Get the content container
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;
    
    // Hide the schedule grid
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'none';
    }
    
    // Create a container for the tree view
    let mainTreeContainer = document.querySelector('#main-prereq-container');
    if (!mainTreeContainer) {
        mainTreeContainer = document.createElement('div');
        mainTreeContainer.id = 'main-prereq-container';
        mainTreeContainer.style.flex = '1';
        mainTreeContainer.style.backgroundColor = 'white';
        mainTreeContainer.style.borderRadius = '8px';
        mainTreeContainer.style.boxShadow = '0 1px 10px rgba(0,0,0,0.1)';
        mainTreeContainer.style.padding = '20px';
        mainTreeContainer.style.display = 'flex';
        mainTreeContainer.style.flexDirection = 'column';
        contentContainer.appendChild(mainTreeContainer);
    }
    
    // Clear any existing content
    mainTreeContainer.innerHTML = '';
    
    // Add header with title and back button
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '20px';
    headerDiv.style.borderBottom = '1px solid #e0e0e0';
    headerDiv.style.paddingBottom = '15px';
    
    // Course title
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
        <h2 style="margin: 0; color: #142A50; font-size: 22px;">Prerequisite Tree for ${courseCode}</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            ${data.nodes.find(n => n.id === courseCode)?.name || 'Course Details'}
        </p>
    `;
    headerDiv.appendChild(titleDiv);
    
    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Return to Schedule';
    backButton.style.padding = '10px 15px';
    backButton.style.backgroundColor = '#f8f9fa';
    backButton.style.border = '1px solid #ddd';
    backButton.style.borderRadius = '4px';
    backButton.style.fontSize = '14px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontWeight = '500';
    backButton.style.display = 'flex';
    backButton.style.alignItems = 'center';
    backButton.style.color = '#333';
    
    // Add icon to button
    backButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
        Return to Schedule
    `;
    
    // Event listener for back button
    backButton.addEventListener('click', function() {
        restoreScheduleGrid();
    });
    
    headerDiv.appendChild(backButton);
    mainTreeContainer.appendChild(headerDiv);
    
    // Add legend
    const legendDiv = document.createElement('div');
    legendDiv.style.display = 'flex';
    legendDiv.style.gap = '15px';
    legendDiv.style.marginBottom = '20px';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = '#f8f9fa';
    legendDiv.style.borderRadius = '4px';
    
    legendDiv.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background-color: #fff5f5; border: 1px solid #c92a2a; border-radius: 2px; margin-right: 5px;"></div>
            <span style="font-size: 13px; color: #333;">OR Relationship (Complete ONE)</span>
        </div>
        <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background-color: #f1f3f5; border: 1px solid #ced4da; border-radius: 2px; margin-right: 5px;"></div>
            <span style="font-size: 13px; color: #333;">AND Relationship (Complete ALL)</span>
        </div>
    `;
    mainTreeContainer.appendChild(legendDiv);
    
    // Create the tree container with a scrollable area
    const treeScrollContainer = document.createElement('div');
    treeScrollContainer.style.flex = '1';
    treeScrollContainer.style.overflow = 'auto';
    treeScrollContainer.style.padding = '10px';
    treeScrollContainer.style.border = '1px solid #e0e0e0';
    treeScrollContainer.style.borderRadius = '4px';
    mainTreeContainer.appendChild(treeScrollContainer);
    
    // Find root node and build tree
    const rootNode = findRootNode(data.nodes, data.edges);
    if (rootNode) {
        const treeHtml = buildEnhancedTreeHtml(rootNode, data.nodes, data.edges);
        treeScrollContainer.innerHTML = treeHtml;
    } else {
        treeScrollContainer.innerHTML = '<p>Could not determine the root course.</p>';
    }
    
    // Add course list for easy navigation
    addCourseList(data.nodes, data.edges, mainTreeContainer);
}

/**
 * Builds an enhanced HTML representation of the prerequisite tree for the main display.
 * @param {Object} node - The current node to render
 * @param {Array} allNodes - All nodes from the API
 * @param {Array} allEdges - All edges from the API
 * @param {number} level - The current nesting level (for indentation)
 * @returns {string} HTML for the enhanced tree
 */
function buildEnhancedTreeHtml(node, allNodes, allEdges, level = 0) {
    if (!node) return '';
    
    // Find all edges where this node is the target (i.e., its prerequisites)
    const prereqEdges = allEdges.filter(edge => edge.target === node.id);
    
    // Style based on level
    const indentPadding = level * 30;
    
    // Different styling for root vs prerequisites - Changed to red theme
    let borderColor = level === 0 ? '#142A50' : (level === 1 ? '#6c757d' : '#adb5bd');
    let backgroundColor = level === 0 ? '#f8f9fa' : (level === 1 ? '#f1f3f5' : '#f8f9fa');
    let textColor = level === 0 ? '#142A50' : (level === 1 ? '#495057' : '#6c757d');
    
    let html = `
        <div class="prereq-node-enhanced" style="padding: 15px; 
                                               margin: 10px 0 10px ${indentPadding}px; 
                                               border-radius: 6px; 
                                               background-color: ${backgroundColor}; 
                                               border-left: 5px solid ${borderColor};
                                               box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-weight: ${level === 0 ? '600' : '500'}; 
                        font-size: ${level === 0 ? '18px' : '16px'}; 
                        color: ${textColor};">
                ${node.id} - ${node.name}
            </div>
    `;
    
    if (prereqEdges.length > 0) {
        // Group prerequisites by relation type (AND/OR)
        const groupedByRelation = {};
        prereqEdges.forEach(edge => {
            const relation = edge.relation || 'and';
            if (!groupedByRelation[relation]) {
                groupedByRelation[relation] = [];
            }
            groupedByRelation[relation].push(edge);
        });
        
        // Process each relation group - Changed to red theme
        Object.entries(groupedByRelation).forEach(([relation, edges]) => {
            if (edges.length > 0) {
                const relationLabel = relation.toLowerCase() === 'or' 
                    ? 'Complete ONE of the following:' 
                    : 'Complete ALL of the following:';
                
                // Changed colors from yellow/orange to red theme
                const relationBgColor = relation.toLowerCase() === 'or' ? '#fff5f5' : '#f1f3f5';
                const relationBorderColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#ced4da';
                const relationTextColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#495057';
                
                html += `
                    <div style="margin: 10px 0; 
                                padding: 8px 12px; 
                                background-color: ${relationBgColor}; 
                                border-left: 3px solid ${relationBorderColor}; 
                                color: ${relationTextColor}; 
                                font-size: 14px; 
                                border-radius: 4px;">
                        ${relationLabel}
                    </div>
                `;
                
                // Add each prerequisite course
                edges.forEach(edge => {
                    const prereqNode = allNodes.find(n => n.id === edge.source);
                    if (prereqNode) {
                        html += buildEnhancedTreeHtml(prereqNode, allNodes, allEdges, level + 1);
                    }
                });
            }
        });
    } else if (level > 0) {
        // If this is a leaf node but not the root, show a message
        html += `
            <div style="margin-top: 5px; font-size: 13px; color: #6c757d;">
                No further prerequisites
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

/**
 * Restores the schedule grid view in the main area.
 */
function restoreScheduleGrid() {
    // Get the content container
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;
    
    // Hide the prerequisite tree container if it exists
    const mainTreeContainer = document.querySelector('#main-prereq-container');
    if (mainTreeContainer) {
        mainTreeContainer.style.display = 'none';
    }
    
    // Show the schedule grid
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'flex';
    }

    // Re-render the current prerequisite data in the sidebar if available
    if (window.currentPrereqData && window.currentCourseCode) {
        // Make sure the PreReqTree tab is active
        const preReqTab = document.querySelector('.tab-button[onclick*="PreReqTree"]');
        if (preReqTab && !preReqTab.classList.contains('active')) {
            openTab('PreReqTree', { currentTarget: preReqTab });
        }
        
        // Update the search input with the current course code
        const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
        if (courseInput) {
            courseInput.value = window.currentCourseCode;
        }
        
        // Render the tree in the sidebar
        renderPrerequisiteTree(window.currentPrereqData);
    }
}

/**
 * Handles the search button click in the prerequisite tab.
 */
function searchPrerequisites() {
    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (!courseInput) {
        console.error('Course input field not found');
        return;
    }

    const courseCode = courseInput.value.trim();
    if (!courseCode) {
        // Show a more visible error in the prereq-info area instead of an alert
        const prereqInfo = document.querySelector('.prereq-info');
        if (prereqInfo) {
            prereqInfo.innerHTML = `
                <div style="color: #721c24; background-color: #f8d7da; padding: 12px; border-radius: 4px; margin-top: 15px; border: 1px solid #f5c6cb;">
                    <p style="margin: 0; font-weight: 500;">Please enter a valid course code.</p>
                    <p style="margin-top: 5px; font-size: 13px;">Example: CPSC 325, MATH 231</p>
                </div>
            `;
        }
        return;
    }

    // Format the course code properly (e.g., "CPSC325" -> "CPSC 325")
    let formattedCode = courseCode.toUpperCase();
    if (/^[A-Z]{2,4}\d{3,4}$/.test(formattedCode)) {
        // If entered without a space (e.g., "CPSC325"), insert a space
        formattedCode = formattedCode.replace(/([A-Z]+)(\d+)/, '$1 $2');
    }
    
    // Show loading state immediately
    const prereqInfo = document.querySelector('.prereq-info');
    if (prereqInfo) {
        prereqInfo.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin: 0; color: #666;">Loading prerequisite tree for ${formattedCode}...</p>
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #142A50; border-radius: 50%; margin-top: 10px; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    // Update the input field with the formatted code
    courseInput.value = formattedCode;
    
    console.log(`Searching prerequisites for ${formattedCode}`);
    
    // Only display in the sidebar initially
    fetchPrerequisites(formattedCode)
        .then(data => {
            console.log('Successfully fetched prerequisite data:', data);
            renderPrerequisiteTree(data);
        })
        .catch(error => {
            console.error('Error fetching prerequisite data:', error);
            if (prereqInfo) {
                prereqInfo.innerHTML = `
                    <div style="color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 4px; margin-top: 10px;">
                        <p style="margin: 0; font-weight: 500;">Error loading prerequisites</p>
                        <p style="margin-top: 8px;">Please check that "${formattedCode}" is a valid course code and try again.</p>
                        <p style="margin-top: 8px; font-size: 13px;">Technical details: ${error.message}</p>
                    </div>
                `;
            }
        });
}

/**
 * Displays the prerequisite tree directly in the main area.
 * This function is called from the "Show Full Tree in Main Area" button.
 */
function displayInMainArea() {
    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (!courseInput || !courseInput.value.trim()) {
        alert('Please enter a valid course code first.');
        return;
    }
    
    const courseCode = courseInput.value.trim().toUpperCase();
    
    // Fetch the data and only show it in the main grid (skip sidebar)
    fetchPrerequisites(courseCode)
        .then(data => {
            // Display only in main grid (not in sidebar)
            displayTreeInMainGrid(data, courseCode);
            
            // Update sidebar info to indicate it's now showing in main area
            const prereqInfo = document.querySelector('.prereq-info');
            if (prereqInfo) {
                prereqInfo.innerHTML = `
                    <div style="background-color: #e7f5ff; padding: 12px; border-radius: 5px; border-left: 4px solid #4dabf7;">
                        <p style="margin: 0; color: #1864ab;">
                            <strong>${courseCode}</strong> prerequisite tree is now displayed in the main area.
                        </p>
                    </div>
                    <p style="font-size: 13px; color: #666; margin-top: 12px;">
                        You can return to the schedule view by clicking "Return to Schedule" in the main area.
                    </p>
                `;
            }
        })
        .catch(error => {
            console.error('Failed to display prerequisite tree in main area:', error);
        });
}

// Initialize the prerequisite search functionality when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global variables to store current prerequisite data
    window.currentPrereqData = null;
    window.currentCourseCode = null;
    
    // Add click event to the search button in the prerequisite tab
    const searchButton = document.querySelector('#PreReqTree .search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', searchPrerequisites);
    }
    
    // Add enter key event to the input field
    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (courseInput) {
        courseInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchPrerequisites();
            }
        });
    }
    
    // Override the original openTab function to add our prerequisite-specific logic
    if (typeof openTab === 'function') {
        const originalOpenTab = openTab;
        window.openTab = function(tabName, event) {
            // Call the original function
            originalOpenTab(tabName, event);
            
            // Handle prerequisite-specific tab switching
            if (tabName === 'PreReqTree' && window.currentPrereqData) {
                setTimeout(() => {
                    renderPrerequisiteTree(window.currentPrereqData);
                }, 100);
            }
        };
    }
    
    // Enhance the displayInMainArea function to store the current data
    const originalDisplayInMainArea = window.displayInMainArea;
    if (originalDisplayInMainArea) {
        window.displayInMainArea = function() {
            originalDisplayInMainArea();
            
            // Store the course code for when we return to the schedule
            const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
            if (courseInput && courseInput.value) {
                window.currentCourseCode = courseInput.value.trim().toUpperCase();
            }
        };
    }
});

/**
 * Helper function to ensure tab switching correctly handles prerequisite tree views
 * This extends the openTab function in the main navigation
 * @param {string} tabName - The name of the tab to switch to
 */
function handlePrereqTabChange(tabName) {
    // If switching away from the PreReqTree tab and the tree is in the main area
    if (tabName !== 'PreReqTree' && window.currentPrereqData) {
        // Make sure the schedule grid is visible
        const scheduleGrid = document.querySelector('.schedule-grid');
        if (scheduleGrid && scheduleGrid.style.display === 'none') {
            restoreScheduleGrid();
        }
    }
    
    // If switching to the PreReqTree tab and we have data to display
    if (tabName === 'PreReqTree' && window.currentPrereqData && window.currentCourseCode) {
        // Update the input field with the current course code
        const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
        if (courseInput) {
            courseInput.value = window.currentCourseCode;
        }
        
        // Re-render the prerequisite tree in the sidebar
        setTimeout(() => {
            renderPrerequisiteTree(window.currentPrereqData);
        }, 100);
    }
}

// Override or extend the openTab function to handle prerequisite views
const originalOpenTab = window.openTab || function() {};
window.openTab = function(tabName, event) {
    // Call the original openTab function
    originalOpenTab(tabName, event);
    
    // Handle the prerequisite-specific logic
    handlePrereqTabChange(tabName);
}; 