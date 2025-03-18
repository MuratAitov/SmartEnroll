function openHerakPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/Herak Center.pdf';  // Updated path to include directory
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';  // Remove padding for full-width PDF
        scheduleContainer.style.overflow = 'hidden';  // Prevent scrollbars
    }
}

// Also update the Jepson PDFs to use the same directory
function openJepsonFirstFloorPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/Jepson1stFloor.pdf';  // Path is already correct
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}

function openJepsonBasementPDF() {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    if (scheduleContainer) {
        // Create PDF embed element
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = 'Floor Plans/JepsonBasementpdf.pdf';  // Path is already correct
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';
        
        // Replace schedule with PDF viewer
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);
        
        // Add PDF viewer styles
        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}