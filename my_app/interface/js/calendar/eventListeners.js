function addEventBlockListeners(eventBlock) {
    eventBlock.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createContextMenu(e.pageX, e.pageY, eventBlock);
    });
}