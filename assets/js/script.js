class ToolHubApp {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupListeners();
    }

    // Cache frequently used DOM elements
    cacheElements() {
        this.cards = document.querySelectorAll('.tool-card'); // all tool cards
        this.logo = document.querySelector('.logo'); // header logo
    }

    // Setup event listeners
    setupListeners() {
        // Only attach click to launch buttons
        this.cards.forEach(card => {
            const btn = card.querySelector('.launch-button');
            if (btn) {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    this.navigateTo(card.dataset.tool); // Navigate when launch button is clicked
                });
            }
        });

        // Logo click scrolls to top
        this.logo.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Navigation logic
    navigateTo(tool) {
        const paths = {
            'investment-allocation-calculator': 'data/investment_allocation_calculator/index.html',
            'dcf-calculator': null // in development
        };

        if (paths[tool]) {
            window.location.href = paths[tool]; // Go to tool page
        } else {
            alert('Tool coming soon!');
        }
    }
}

/* =============== Copyright =============== */
const footer = document.getElementById('footer');
const year = new Date().getFullYear();
const projectName = document.title || "My Project"; // Use page title
footer.textContent = `© ${year} ${projectName}. All rights reserved.`;

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new ToolHubApp();
});