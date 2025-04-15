// finals.js
export function setupFinalsTabSwitching() {
    console.log('Setting up Finals tab switching...');
    document.addEventListener('DOMContentLoaded', () => {
        const fallBtn = document.getElementById('fall-btn');
        const springBtn = document.getElementById('spring-btn');
        const fallFinals = document.getElementById('fall-finals');
        const springFinals = document.getElementById('spring-finals');
        const finalsTab = document.getElementById('Finals');

        if (!fallBtn || !springBtn || !fallFinals || !springFinals) {
            console.warn('Finals tab switching: one or more elements not found');
            return;
        }

        // Initially hide the Finals tab to prevent it from showing at startup
        if (finalsTab) {
            finalsTab.style.display = 'none';
            finalsTab.classList.remove('active');
        }

        fallBtn.addEventListener('click', () => {
            fallBtn.classList.add('active');
            springBtn.classList.remove('active');
            fallFinals.style.display = 'block';
            springFinals.style.display = 'none';
        });

        springBtn.addEventListener('click', () => {
            springBtn.classList.add('active');
            fallBtn.classList.remove('active');
            springFinals.style.display = 'block';
            fallFinals.style.display = 'none';
        });
    });
}

// Function to show Finals tab when explicitly requested
export function showFinalsTab() {
    const finalsTab = document.getElementById('Finals');
    const finalsNavLink = document.querySelector('.nav-links a[href="#Finals"], .nav-links a[data-tab="Finals"]');
    
    if (finalsTab) {
        // Hide all other tab contents
        document.querySelectorAll('.tab-content, .main-content-view').forEach(el => {
            if (el.id !== 'Finals') {
                el.style.display = 'none';
                el.classList.remove('active');
            }
        });
        
        // Show Finals tab
        finalsTab.style.display = 'block';
        finalsTab.classList.add('active');
        
        // Activate the correct fall/spring button and content
        const fallBtn = document.getElementById('fall-btn');
        const springBtn = document.getElementById('spring-btn');
        const fallFinals = document.getElementById('fall-finals');
        const springFinals = document.getElementById('spring-finals');
        
        if (fallBtn && !fallBtn.classList.contains('active') && !springBtn.classList.contains('active')) {
            fallBtn.classList.add('active');
            if (fallFinals) fallFinals.style.display = 'block';
            if (springFinals) springFinals.style.display = 'none';
        }
        
        // Update nav link
        if (finalsNavLink) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                link.style.color = '#333';
            });
            finalsNavLink.classList.add('active');
            finalsNavLink.style.color = '#142A50';
        }
    }
}
