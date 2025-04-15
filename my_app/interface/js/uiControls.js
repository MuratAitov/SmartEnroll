/**
 * Sets up the autocomplete functionality for the instructor input field
 */
function setupInstructorAutocomplete() {
    console.log('Setting up instructor autocomplete');
    const instructorInput = document.getElementById('instructor-input');
    if (!instructorInput) {
        console.warn('Instructor input not found');
        return;
    }
    
    // Use a mock data approach instead of relying on a backend endpoint
    const mockInstructors = [
        "Dr. Smith", "Dr. Johnson", "Prof. Williams", "Prof. Brown", 
        "Dr. Jones", "Dr. Garcia", "Prof. Miller", "Prof. Davis",
        "Dr. Rodriguez", "Dr. Martinez", "Prof. Hernandez", "Prof. Lopez"
    ];
    
    console.log('Using mock instructors data:', mockInstructors);
    
    // Store the instructors list for later use
    window.instructors = mockInstructors;
    
    // Set up autocomplete with the mock instructors
    setupCustomAutocomplete(instructorInput, mockInstructors);
}

/**
 * Sets up a custom autocomplete feature for an input element
 * @param {HTMLInputElement} inputElement - The input element to apply autocomplete to
 * @param {Array} items - The array of items for autocomplete suggestions
 */
function setupCustomAutocomplete(inputElement, items) {
    // Create autocomplete container
    const container = document.createElement('div');
    container.className = 'autocomplete-container';

    // Insert container after input
    inputElement.parentNode.insertBefore(container, inputElement.nextSibling);

    // Move input inside container
    container.appendChild(inputElement);

    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'autocomplete-list';
    container.appendChild(dropdownList);

    // Event handlers
    inputElement.addEventListener('input', function() {
        const value = this.value.toLowerCase();

        // Hide dropdown if input is empty
        if (!value) {
            dropdownList.style.display = 'none';
            return;
        }

        // Filter items based on input
        const filteredItems = items.filter(item =>
            item.toLowerCase().includes(value)
        ).slice(0, 10); // Limit to 10 suggestions

        // Populate dropdown
        if (filteredItems.length > 0) {
            dropdownList.innerHTML = '';

            filteredItems.forEach(item => {
                const element = document.createElement('div');
                element.className = 'autocomplete-item';
                element.innerHTML = highlightMatches(item, value);

                element.addEventListener('click', function() {
                    inputElement.value = item;
                    dropdownList.style.display = 'none';
                });

                dropdownList.appendChild(element);
            });

            dropdownList.style.display = 'block';
        } else {
            dropdownList.style.display = 'none';
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdownList.style.display = 'none';
        }
    });

    // Show dropdown when focusing on input
    inputElement.addEventListener('focus', function() {
        const value = this.value.toLowerCase();
        if (value) {
            // Trigger input event to show matching items
            this.dispatchEvent(new Event('input'));
        }
    });

    // Add keyboard navigation
    inputElement.addEventListener('keydown', function(e) {
        const items = dropdownList.querySelectorAll('.autocomplete-item');
        if (!items.length) return;

        const currentSelected = dropdownList.querySelector('.selected');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!currentSelected) {
                items[0].classList.add('selected');
            } else {
                const nextSibling = currentSelected.nextElementSibling;
                if (nextSibling) {
                    currentSelected.classList.remove('selected');
                    nextSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSelected) {
                const prevSibling = currentSelected.previousElementSibling;
                if (prevSibling) {
                    currentSelected.classList.remove('selected');
                    prevSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'Enter') {
            if (currentSelected) {
                e.preventDefault();
                inputElement.value = currentSelected.textContent;
                dropdownList.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
        }
    });
}

/**
 * Highlights matched text in autocomplete suggestions
 * @param {string} text - The full text
 * @param {string} query - The search query to highlight
 * @returns {string} HTML with matched parts wrapped in <strong> tags
 */
function highlightMatches(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

/**
 * Resets button styles to default state.
 * @param {HTMLElement} button - The button element.
 */
function resetButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #C4C8CE;
        color: #6c757d;
        background-color: transparent;
    `;
}

/**
 * Applies the selected button style.
 * @param {HTMLElement} button - The button element.
 */
function setSelectedButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #002467;
        color: #ffffff;
        background-color: #002467;
    `;
}