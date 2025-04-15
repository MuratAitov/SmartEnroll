import { createContextMenu } from './contextMenu.js';

/**
 * Adds event listeners to an event block to handle context menu actions.
 * @param {HTMLElement} eventBlock - The event block element.
 */
export function addEventBlockListeners(eventBlock) {
    eventBlock.addEventListener('click', handleEventBlockClick);
}

/**
 * Handles the event block click event to trigger the context menu.
 * @param {Event} event - The click event object.
 */
function handleEventBlockClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const { pageX: x, pageY: y, currentTarget: eventBlock } = event;
    createContextMenu(x, y, eventBlock);
}
