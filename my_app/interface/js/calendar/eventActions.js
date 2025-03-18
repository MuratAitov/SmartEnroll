function setupContextMenu(eventBlock) {
    const menu = createContextMenu(eventBlock);
    setupEditEventAction(menu, eventBlock);
    setupColorChangeAction(menu, eventBlock);
    setupDuplicateEventAction(menu, eventBlock);
    setupDeleteEventAction(menu, eventBlock);
    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}
// Add event listeners for menu items
    menu.querySelector('.edit').addEventListener('click', () => {
        // Get current values
        const currentName = eventBlock.querySelector('.event-name').textContent;
        const currentTime = eventBlock.querySelector('.event-time').textContent;
        const [currentStart, currentEnd] = currentTime.split(' - ');

        // Create edit form HTML
        const editForm = document.createElement('div');
        editForm.className = 'edit-form';
        editForm.innerHTML = `
            <div class="form-group">
                <input type="text" id="edit-name" placeholder="Event Name" value="${currentName}">
            </div>
            <div class="form-group">
                <div class="weekday-buttons">
                    <button class="weekday-btn" data-day="T">T</button>
                    <button class="weekday-btn" data-day="W">W</button>
                    <button class="weekday-btn" data-day="R">R</button>
                    <button class="weekday-btn" data-day="F">F</button>
                    <button class="weekday-btn" data-day="M">M</button>
                </div>
            </div>
            <div class="form-group">
                <input type="time" id="edit-start" value="${currentStart}">
            </div>
            <div class="form-group">
                <input type="time" id="edit-end" value="${currentEnd}">
            </div>
            <div class="edit-buttons">
                <button class="save-btn">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        // Show edit form
        const editDialog = document.createElement('div');
        editDialog.className = 'edit-dialog';
        editDialog.appendChild(editForm);
        document.body.appendChild(editDialog);

        // Add event listeners for weekday buttons
        editForm.querySelectorAll('.weekday-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });

        // Handle save
        editForm.querySelector('.save-btn').addEventListener('click', () => {
            const newName = editForm.querySelector('#edit-name').value;
            const newStart = editForm.querySelector('#edit-start').value;
            const newEnd = editForm.querySelector('#edit-end').value;
            const selectedDays = Array.from(editForm.querySelectorAll('.weekday-btn.selected'))
                .map(btn => btn.dataset.day);
            
            // Validate inputs
            if (!newName || !newStart || !newEnd) {
                alert('Please fill in all fields');
                return;
            }
            if (selectedDays.length === 0) {
                alert('Please select at least one day');
                return;
            }

            // Remove existing event blocks
            const cell = eventBlock.parentElement;
            cell.innerHTML = '';

            // Create new event blocks for each selected day
            selectedDays.forEach(day => {
                const dayIndex = ['M', 'T', 'W', 'R', 'F'].indexOf(day) + 1;
                const startCell = document.querySelector(`table tr:nth-child(${startHour - 8 + 2}) td:nth-child(${dayIndex + 1})`);
                
                if (startCell) {
                    addEventToSchedule(newName, [day], newStart, newEnd);
                }
            });

            editDialog.remove();
        });

        // Handle cancel
        editForm.querySelector('.cancel-btn').addEventListener('click', () => {
            editDialog.remove();
        });

        menu.remove();
    });

    menu.querySelector('.color').addEventListener('click', () => {
        // Remove any existing color picker
        const existingPicker = document.querySelector('.color-picker');
        if (existingPicker) {
            existingPicker.remove();
        }

        // Create color picker
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        
        // Define colors
        const colors = [
            '#808080', // Gray
            '#4A90E2', // Blue
            '#B41231', // Red
            '#357ABD', // Light Blue
            '#002467', // Dark Blue
            '#2ECC71', // Green
            '#E67E22', // Orange
            '#9B59B6', // Purple
            '#E74C3C', // Bright Red
            '#1ABC9C'  // Turquoise
        ];

        // Add color options
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            
            colorOption.addEventListener('click', () => {
                // Get the event name to find related blocks
                const eventName = eventBlock.querySelector('.event-name').textContent;
                const eventTime = eventBlock.querySelector('.event-time').textContent;
                
                // Find all event blocks with the same name and time
                const allEventBlocks = document.querySelectorAll('.event-block');
                allEventBlocks.forEach(block => {
                    if (block.querySelector('.event-name').textContent === eventName &&
                        block.querySelector('.event-time').textContent === eventTime) {
                        block.style.backgroundColor = color;
                    }
                });
                
                colorPicker.remove();
                menu.remove();
            });
            
            colorPicker.appendChild(colorOption);
        });

        // Position the color picker next to the context menu
        const menuRect = menu.getBoundingClientRect();
        colorPicker.style.left = `${menuRect.right + 5}px`;
        colorPicker.style.top = `${menuRect.top}px`;

        // Add to document
        document.body.appendChild(colorPicker);

        // Close color picker when clicking outside
        document.addEventListener('click', function closeColorPicker(e) {
            if (!colorPicker.contains(e.target) && !menu.contains(e.target)) {
                colorPicker.remove();
                document.removeEventListener('click', closeColorPicker);
            }
        });

        menu.remove();
    });

    menu.querySelector('.duplicate').addEventListener('click', () => {
        const clone = eventBlock.cloneNode(true);
        
        // Define colors for duplicates
        const colors = [
            '#E74C3C',  // Bright Red
            '#2ECC71',  // Green
            '#E67E22',  // Orange
            '#9B59B6',  // Purple
            '#1ABC9C'   // Turquoise
        ];
        
        // Get current color in RGB format for accurate comparison
        const computedStyle = window.getComputedStyle(eventBlock);
        const currentColor = computedStyle.backgroundColor;
        
        // Convert hex colors to RGB for comparison
        const availableColors = colors.filter(color => {
            const tempDiv = document.createElement('div');
            tempDiv.style.color = color;
            document.body.appendChild(tempDiv);
            const rgbColor = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            return rgbColor !== currentColor;
        });
        
        // Set a random different color for the duplicate
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        clone.style.backgroundColor = randomColor;
        
        // Get original event name
        const originalName = eventBlock.querySelector('.event-name').textContent;
        
        // Find existing copies and get the next number
        const cell = eventBlock.parentNode;
        const existingBlocks = cell.querySelectorAll('.event-block');
        let copyNumber = 0;
        
        existingBlocks.forEach(block => {
            const name = block.querySelector('.event-name').textContent;
            if (name.startsWith(originalName + ' copy')) {
                const match = name.match(/copy(\d+)?$/);
                if (match) {
                    const num = match[1] ? parseInt(match[1]) : 0;
                    copyNumber = Math.max(copyNumber, num + 1);
                } else {
                    copyNumber = Math.max(copyNumber, 1);
                }
            }
        });
        
        // Update only the clone's name
        clone.querySelector('.event-name').textContent = `${originalName} copy${copyNumber || ''}`;
        
        // Calculate width and position based on total number of blocks
        const totalBlocks = existingBlocks.length + 1;
        const blockWidth = 96 / totalBlocks;
        const gap = 2 / (totalBlocks - 1);
        
        // Reposition all blocks
        existingBlocks.forEach((block, index) => {
            block.style.width = `${blockWidth}%`;
            block.style.left = `${(index * (blockWidth + gap))}%`;
        });
        
        // Position the new clone
        clone.style.width = `${blockWidth}%`;
        clone.style.left = `${((totalBlocks - 1) * (blockWidth + gap))}%`;
        
        // Keep the same height and position
        clone.style.height = eventBlock.style.height;
        clone.style.top = eventBlock.style.top;
        
        // Add event listeners to the clone
        addEventBlockListeners(clone);
        
        // Add to the same cell
        eventBlock.parentNode.appendChild(clone);
        
        menu.remove();
    });

    // Updated delete functionality
    menu.querySelector('.delete').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this event?')) {
            const cell = eventBlock.parentElement;
            eventBlock.remove();
            
            // Get remaining blocks in the same cell
            const remainingBlocks = cell.querySelectorAll('.event-block');
            const totalBlocks = remainingBlocks.length;
            
            if (totalBlocks > 0) {
                // Recalculate width and position for remaining blocks
                const blockWidth = 96 / totalBlocks;
                const gap = 2 / (totalBlocks - 1 || 1);
                
                // Reposition remaining blocks
                remainingBlocks.forEach((block, index) => {
                    block.style.width = `${blockWidth}%`;
                    block.style.left = `${(index * (blockWidth + gap))}%`;
                });
            }
        }
        menu.remove();
    });

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}