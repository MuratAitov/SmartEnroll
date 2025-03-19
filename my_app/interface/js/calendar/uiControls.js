/**
 * Toggles the visibility of a day panel.
 * @param {HTMLElement} header - The header element of the day panel.
 */
function toggleDayPanel(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

/**
 * Creates and displays a context menu at the specified position.
 * @param {number} x - The x-coordinate of the menu.
 * @param {number} y - The y-coordinate of the menu.
 * @param {HTMLElement} eventBlock - The event block that was clicked.
 */
function createContextMenu(x, y, eventBlock) {
    removeExistingContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = getContextMenuHTML();
    setupContextMenuActions(menu, eventBlock);

    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}

/**
 * Removes any existing context menu from the document.
 */
function removeExistingContextMenu() {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
}

/**
 * Returns the HTML content for the context menu.
 * @returns {string} - HTML structure of the menu.
 */
function getContextMenuHTML() {
    return `
        <div class="menu-item edit">Edit Event</div>
        <div class="menu-item color">Change Color</div>
        <div class="menu-item duplicate">Duplicate</div>
        <div class="menu-item delete">Delete</div>
    `;
}

/**
 * Sets up event listeners for the context menu actions.
 * @param {HTMLElement} menu - The context menu element.
 * @param {HTMLElement} eventBlock - The event block associated with the menu.
 */
function setupContextMenuActions(menu, eventBlock) {
    menu.querySelector('.edit').addEventListener('click', () => handleEditEvent(eventBlock, menu));
    menu.querySelector('.color').addEventListener('click', () => handleChangeColor(eventBlock, menu));
    menu.querySelector('.duplicate').addEventListener('click', () => handleDuplicateEvent(eventBlock, menu));
    menu.querySelector('.delete').addEventListener('click', () => handleDeleteEvent(eventBlock, menu));
}

/**
 * Handles the event editing process.
 * @param {HTMLElement} eventBlock - The event block being edited.
 * @param {HTMLElement} menu - The context menu.
 */
function handleEditEvent(eventBlock, menu) {
    const currentValues = getCurrentEventValues(eventBlock);
    const editDialog = createEditDialog(currentValues, eventBlock);

    document.body.appendChild(editDialog);
    menu.remove();
}

/**
 * Retrieves current event details from the event block.
 * @param {HTMLElement} eventBlock - The event block.
 * @returns {Object} - Object containing event name, start, and end time.
 */
function getCurrentEventValues(eventBlock) {
    return {
        eventName: eventBlock.querySelector('.event-name').textContent,
        start: eventBlock.querySelector('.event-time').textContent.split(' - ')[0],
        end: eventBlock.querySelector('.event-time').textContent.split(' - ')[1]
    };
}

/**
 * Handles changing the event block color.
 * @param {HTMLElement} eventBlock - The event block.
 * @param {HTMLElement} menu - The context menu.
 */
function handleChangeColor(eventBlock, menu) {
    removeExistingColorPicker();

    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';
    const colors = ['#808080', '#4A90E2', '#B41231', '#357ABD', '#002467', '#2ECC71', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C'];

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.addEventListener('click', () => applyColorToEvent(eventBlock, color, colorPicker, menu));
        colorPicker.appendChild(colorOption);
    });

    document.body.appendChild(colorPicker);
    menu.remove();
}

/**
 * Removes any existing color picker from the document.
 */
function removeExistingColorPicker() {
    const existingPicker = document.querySelector('.color-picker');
    if (existingPicker) existingPicker.remove();
}

/**
 * Applies the selected color to the event block.
 * @param {HTMLElement} eventBlock - The event block.
 * @param {string} color - The selected color.
 * @param {HTMLElement} colorPicker - The color picker element.
 * @param {HTMLElement} menu - The context menu.
 */
function applyColorToEvent(eventBlock, color, colorPicker, menu) {
    eventBlock.style.backgroundColor = color;
    colorPicker.remove();
    menu.remove();
}

/**
 * Handles duplicating an event block.
 * @param {HTMLElement} eventBlock - The event block to duplicate.
 * @param {HTMLElement} menu - The context menu.
 */
function handleDuplicateEvent(eventBlock, menu) {
    const duplicate = eventBlock.cloneNode(true);
    duplicate.querySelector('.event-name').textContent += ' (copy)';
    eventBlock.parentNode.insertBefore(duplicate, eventBlock.nextSibling);
    menu.remove();
}

/**
 * Handles deleting an event block.
 * @param {HTMLElement} eventBlock - The event block to delete.
 * @param {HTMLElement} menu - The context menu.
 */
function handleDeleteEvent(eventBlock, menu) {
    if (confirm('Are you sure you want to delete this event?')) {
        eventBlock.remove();
    }
    menu.remove();
}

/**
 * Closes the context menu when clicking outside of it.
 * @param {HTMLElement} menu - The context menu element.
 */
function closeMenuOnClickOutside(menu) {
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}
