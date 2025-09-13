/* =============== PORTFOLIO STATE MANAGEMENT =============== */
let portfolio = {
    cash: 0,
    items: [],
    simulationHeaders: [
        { percent: 10 },
        { percent: 20 },
        { percent: 30 },
        { percent: 40 },
        { percent: 50 },
        { percent: 60 },
        { percent: 70 },
        { percent: 80 }
    ]
};

let chartInstance = null;
let editingIndex = null;
let selectedColor = 'highlight-blue';
let editingSimIndex = null;

/* =============== LOCAL STORAGE MANAGEMENT =============== */
const STORAGE_KEY = 'investmentPortfolio';
const THEME_KEY = 'portfolioTheme';

// Load portfolio from localStorage
function loadPortfolio() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            portfolio = JSON.parse(saved);
            document.getElementById('cashInput').value = portfolio.cash || '';
        } catch (e) {
            console.error('Failed to load portfolio:', e);
        }
    }
}

// Save portfolio to localStorage
function savePortfolio() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch (e) {
        console.error('Failed to save portfolio:', e);
    }
}

/* =============== THEME MANAGEMENT =============== */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        icon.innerHTML = '<path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>';
    } else {
        icon.innerHTML = '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.591a.75.75 0 101.06 1.06l1.591-1.591zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.591-1.591a.75.75 0 10-1.06 1.06l1.591 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.591a.75.75 0 001.06 1.06l1.591-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06L6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.591z"/>';
    }
}

/* =============== CALCULATION FUNCTIONS =============== */
function getTotalAllocation() {
    return portfolio.items.reduce((sum, item) => sum + (parseFloat(item.portion) || 0), 0);
}

function calculateActualPercent(item) {
    const total = getTotalAllocation();
    return total > 0 ? (parseFloat(item.portion) / total) * 100 : 0;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/* =============== MODAL MANAGEMENT =============== */
function openAddModal() {
    editingIndex = null;
    document.getElementById('modalTitle').textContent = 'Add New Stock';
    document.getElementById('stockName').value = '';
    document.getElementById('stockName').disabled = false;
    document.getElementById('stockPortion').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    selectedColor = 'highlight-blue';
    updateColorSelection();
    document.getElementById('stockModal').classList.add('show');
}

function openEditModal(index) {
    editingIndex = index;
    const item = portfolio.items[index];
    document.getElementById('modalTitle').textContent = 'Edit Stock';
    document.getElementById('stockName').value = item.name;
    document.getElementById('stockName').disabled = true;
    document.getElementById('stockPortion').value = item.portion;
    document.getElementById('deleteBtn').style.display = 'inline-flex';
    selectedColor = item.color || 'highlight-blue';
    updateColorSelection();
    document.getElementById('stockModal').classList.add('show');
}

function closeModal() {
    document.getElementById('stockModal').classList.remove('show');
    editingIndex = null;
}

function openSimModal(index) {
    editingSimIndex = index;
    const header = portfolio.simulationHeaders[index];
    document.getElementById('simPercent').value = header.percent;
    document.getElementById('simModal').classList.add('show');
}

function closeSimModal() {
    document.getElementById('simModal').classList.remove('show');
    editingSimIndex = null;
}

/* =============== COLOR PICKER =============== */
function updateColorSelection() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === selectedColor) {
            option.classList.add('selected');
        }
    });
}

/* =============== CRUD OPERATIONS =============== */
function saveStock() {
    const name = document.getElementById('stockName').value.trim().toUpperCase();
    const portion = parseFloat(document.getElementById('stockPortion').value);

    // Validation
    if (!name) {
        alert('Please enter a stock symbol');
        return;
    }

    if (isNaN(portion) || portion <= 0 || portion > 100) {
        alert('Please enter a valid percentage between 0.01 and 100');
        return;
    }

    // Check for duplicates (only when adding new)
    if (editingIndex === null) {
        const exists = portfolio.items.some(item => item.name === name);
        if (exists) {
            alert('This stock already exists in your portfolio');
            return;
        }
    }

    // Save stock
    if (editingIndex !== null) {
        portfolio.items[editingIndex].portion = portion;
        portfolio.items[editingIndex].color = selectedColor;
    } else {
        portfolio.items.push({
            name: name,
            portion: portion,
            color: selectedColor,
            darkened: []
        });
    }

    savePortfolio();
    renderAll();
    closeModal();
}

function deleteStock() {
    if (editingIndex !== null && confirm('Are you sure you want to delete this stock?')) {
        portfolio.items.splice(editingIndex, 1);
        savePortfolio();
        renderAll();
        closeModal();
    }
}

function saveSimulation() {
    const percent = parseFloat(document.getElementById('simPercent').value);

    if (isNaN(percent) || percent < 0 || percent > 100) {
        alert('Please enter a valid percentage between 0 and 100');
        return;
    }

    portfolio.simulationHeaders[editingSimIndex].percent = percent;
    savePortfolio();
    renderAll();
    closeSimModal();
}

function clearAll() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        portfolio = {
            cash: 0,
            items: [],
            simulationHeaders: [
                { percent: 10 },
                { percent: 20 },
                { percent: 30 },
                { percent: 40 },
                { percent: 50 },
                { percent: 60 },
                { percent: 70 },
                { percent: 80 }
            ]
        };
        document.getElementById('cashInput').value = '';
        savePortfolio();
        renderAll();
    }
}

/* =============== RENDERING FUNCTIONS =============== */
function updateStats() {
    const totalAllocation = getTotalAllocation();
    document.getElementById('totalInvestment').textContent = formatCurrency(portfolio.cash);
    document.getElementById('stockCount').textContent = portfolio.items.length;
    document.getElementById('totalAllocation').textContent = totalAllocation.toFixed(1) + '%';

    // Update allocation card color based on percentage
    const allocationCard = document.getElementById('totalAllocation').parentElement;
    if (totalAllocation > 100) {
        allocationCard.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
    } else if (totalAllocation === 100) {
        allocationCard.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    } else {
        allocationCard.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
    }
}

function renderPortfolioList() {
    const container = document.getElementById('portfolioList');

    if (portfolio.items.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        </svg>
                        <h3>Your portfolio is empty</h3>
                        <p>Click "Add Stock" to get started</p>
                    </div>
                `;
        return;
    }

    container.innerHTML = portfolio.items.map((item, index) => `
                <div class="portfolio-item ${item.color}" onclick="openEditModal(${index})">
                    <div class="portfolio-item-name">${item.name}</div>
                    <div class="portfolio-item-portion">${item.portion.toFixed(2)}%</div>
                </div>
            `).join('');
}

function renderResultTable() {
    const tbody = document.querySelector('#resultTable tbody');

    if (portfolio.items.length === 0 || portfolio.cash === 0) {
        tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="5">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                            </svg>
                            <h3>No data available</h3>
                            <p>Enter investment amount and add stocks to begin</p>
                        </td>
                    </tr>
                `;
        return;
    }

    const totalAllocation = getTotalAllocation();

    tbody.innerHTML = portfolio.items.map(item => {
        const actualPercent = calculateActualPercent(item);
        const amount = portfolio.cash * (item.portion / 100);
        const status = totalAllocation > 100 ? '⚠️ Over-allocated' : '✅ OK';

        return `
                    <tr class="${item.color}">
                        <td>${item.name}</td>
                        <td>${item.portion.toFixed(2)}%</td>
                        <td>${actualPercent.toFixed(2)}%</td>
                        <td>${formatCurrency(amount)}</td>
                        <td>${status}</td>
                    </tr>
                `;
    }).join('');
}

function renderSimulationTable() {
    const thead = document.querySelector('#simulationTable thead tr');
    const tbody = document.querySelector('#simulationTable tbody');

    // Update headers
    const headerHtml = '<th>Stock</th>' + portfolio.simulationHeaders.map((header, index) =>
        `<th class="editable-sim" data-percent="${header.percent}" onclick="openSimModal(${index})">${header.percent}%</th>`
    ).join('');
    thead.innerHTML = headerHtml;

    if (portfolio.items.length === 0 || portfolio.cash === 0) {
        tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="9">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10l5 5 5-5z"/>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                            <h3>No stocks added yet</h3>
                            <p>Add stocks to see simulation results</p>
                        </td>
                    </tr>
                `;
        return;
    }

    tbody.innerHTML = portfolio.items.map(item => {
        const baseAmount = portfolio.cash * (item.portion / 100);
        let row = `<tr class="${item.color}"><td>${item.name}</td>`;

        portfolio.simulationHeaders.forEach(header => {
            const simAmount = baseAmount * (header.percent / 100);
            const isDarkened = item.darkened && item.darkened.includes(header.percent);
            row += `<td onclick="toggleDarkened('${item.name}', ${header.percent})" style="cursor: pointer; ${isDarkened ? 'filter: brightness(0.15);' : ''}">${formatCurrency(simAmount)}</td>`;
        });

        return row + '</tr>';
    }).join('');
}

function toggleDarkened(stockName, percent) {
    const item = portfolio.items.find(i => i.name === stockName);
    if (!item) return;

    if (!item.darkened) item.darkened = [];

    const index = item.darkened.indexOf(percent);
    if (index > -1) {
        item.darkened.splice(index, 1);
    } else {
        item.darkened.push(percent);
    }

    savePortfolio();
    renderSimulationTable();
}

function updateChart() {
    const ctx = document.getElementById('allocationChart');

    if (portfolio.items.length === 0) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    const data = {
        labels: portfolio.items.map(item => item.name),
        datasets: [{
            data: portfolio.items.map(item => item.portion),
            backgroundColor: [
                '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
                '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
                '#FB923C', '#9CA3AF'
            ],
            borderWidth: 0
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const amount = portfolio.cash * (value / 100);
                            return `${label}: ${value.toFixed(2)}% (${formatCurrency(amount)})`;
                        }
                    }
                }
            }
        }
    };

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, config);
}

function renderAll() {
    updateStats();
    renderPortfolioList();
    renderResultTable();
    renderSimulationTable();
    updateChart();
}

/* =============== EVENT LISTENERS =============== */
document.getElementById('cashInput').addEventListener('input', (e) => {
    portfolio.cash = parseFloat(e.target.value) || 0;
    savePortfolio();
    renderAll();
});

document.getElementById('colorPicker').addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        selectedColor = e.target.dataset.color;
        updateColorSelection();
    }
});

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeSimModal();
    }
});

// Close modals on outside click
document.getElementById('stockModal').addEventListener('click', (e) => {
    if (e.target.id === 'stockModal') {
        closeModal();
    }
});

document.getElementById('simModal').addEventListener('click', (e) => {
    if (e.target.id === 'simModal') {
        closeSimModal();
    }
});

/* =============== INITIALIZATION =============== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadPortfolio();
    renderAll();
});