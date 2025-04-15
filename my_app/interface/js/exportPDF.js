/**
 * Exports the current schedule to PDF format.
 * Uses html2canvas and jsPDF to generate a PDF of the current schedule.
 */
function exportToPDF() {
    const scheduleContainer = document.getElementById('schedule-container');
    
    if (!scheduleContainer) {
        showErrorMessage('Schedule container not found');
        return;
    }
    
    // Check if html2canvas and jsPDF are available
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        // Load the required libraries if not already loaded
        loadPDFLibraries()
            .then(() => generatePDF(scheduleContainer))
            .catch(error => {
                console.error('Error loading PDF libraries:', error);
                showErrorMessage('Failed to load PDF export libraries');
            });
    } else {
        // Libraries already loaded, generate PDF directly
        generatePDF(scheduleContainer);
    }
}

/**
 * Loads the required libraries for PDF generation.
 * @returns {Promise} A promise that resolves when libraries are loaded
 */
function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        // Load html2canvas
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.onload = () => {
            // After html2canvas loads, load jsPDF
            const jsPDFScript = document.createElement('script');
            jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPDFScript.onload = resolve;
            jsPDFScript.onerror = reject;
            document.head.appendChild(jsPDFScript);
        };
        html2canvasScript.onerror = reject;
        document.head.appendChild(html2canvasScript);
    });
}

/**
 * Generates a PDF from the schedule container.
 * @param {HTMLElement} container - The schedule container element
 */
function generatePDF(container) {
    showLoadingIndicator();
    
    // Get the current semester for the filename
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    // Create a notification that we're generating the PDF
    showNotification('Generating PDF...', 'info');
    
    // Use html2canvas to capture the container as an image
    html2canvas(container, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Initialize PDF document
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });
        
        // Calculate dimensions to maintain aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Add title and metadata
        pdf.setFontSize(10);
        const today = new Date().toLocaleDateString();
        pdf.text(`Gonzaga University Schedule - ${currentSemester} (Generated on ${today})`, 10, pdfHeight + 10);
        
        // Save the PDF
        pdf.save(`GU_Schedule_${currentSemester.replace(/\s+/g, '_')}.pdf`);
        
        // Hide loading indicator and show success message
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showSuccessMessage('Schedule exported to PDF successfully');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showErrorMessage('Failed to generate PDF: ' + error.message);
    });
} 