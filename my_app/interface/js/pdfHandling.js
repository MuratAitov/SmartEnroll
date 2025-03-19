/**
 * Opens a specified PDF in the schedule container.
 * @param {string} pdfPath - The path to the PDF file.
 */
function openPDF(pdfPath) {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    
    if (scheduleContainer) {
        // Create and configure PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = pdfPath;
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';

        // Replace the current schedule content with the PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);

        // Apply styling to ensure proper display
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}

/**
 * Opens the Herak Center Floor Plan PDF.
 */
function openHerakPDF() {
    openPDF('Floor Plans/Herak Center.pdf');
}

/**
 * Opens the Jepson First Floor Plan PDF.
 */
function openJepsonFirstFloorPDF() {
    openPDF('Floor Plans/Jepson1stFloor.pdf');
}

/**
 * Opens the Jepson Basement Floor Plan PDF.
 */
function openJepsonBasementPDF() {
    openPDF('Floor Plans/JepsonBasementpdf.pdf');
}
