/* ==== STORAGE & INITIALIZATION ==== */
const STORAGE_PORTFOLIO = 'STORAGE_PORTFOLIO';
let portfolio = {
    cash: 0,
    items: [],
    simulationHeaders: []
};


if (!localStorage.getItem(STORAGE_PORTFOLIO)) {
    // Ask permission only if storage doesn't exist
    if (confirm("Do you allow this app to store portfolio data locally?")) {
        portfolio = {
            cash: 0,
            items: [],
            simulationHeaders: [
                { label: "1st", percent: 20 },
                { label: "2st", percent: 30 },
                { label: "3st", percent: 40 },
                { label: "4st", percent: 50 },
                { label: "5st", percent: 60 },
                { label: "6st", percent: 70 }
            ]
        };

        const saveToStorage = () => localStorage.setItem(STORAGE_PORTFOLIO, JSON.stringify(portfolio));
    } else {
        // Redirect to a blank page if denied
        window.location.href = 'about:blank';
        exit()
    }
} else {
    // Storage already exists, load it directly
    portfolio = JSON.parse(localStorage.getItem(STORAGE_PORTFOLIO));
}

let editingIndex = null, chosenColor = null, simEditingColIndex = null;

const cashInput = document.getElementById('cashInput'),
    resultTbody = document.querySelector('#resultTable tbody'),
    simTbody = document.querySelector('#simulationTable tbody'),
    simHeaders = Array.from(document.querySelectorAll('#simulationTable thead th.editable-sim'));

cashInput.value = portfolio.cash || 0;

/* ==== HELPER FUNCTIONS ==== */
const saveToStorage = () => localStorage.setItem(STORAGE_PORTFOLIO, JSON.stringify(portfolio));
const totalPortion = () => portfolio.items.reduce((s, x) => s + (Number(x.portion) || 0), 0);
const formatCurrency = v => '$' + Number(v || 0).toFixed(2);

const computeAllocations = cash => portfolio.items.map(p => {
    const expected = Number(p.portion) || 0;
    return {
        name: p.name,
        expected,
        color: p.color,
        actualPercent: totalPortion() > 0 ? (expected / totalPortion()) * 100 : 0,
        allocation: (cash * expected / 100),
        darkened: p.darkened || []
    };
});

/* ==== RENDER FUNCTIONS ==== */
function renderSimulationHeaders() {
    const headerRow = document.getElementsByClassName("editable-sim");
    Array.from(headerRow).forEach((th, index) => {
        const newPercent = portfolio.simulationHeaders[index].percent;
        th.dataset.percent = newPercent;
        th.innerText = newPercent + '%';
    });
}

const renderResultTable = cash => {
    const html = computeAllocations(cash).map((a, i) =>
        `<tr class="${a.color || ''}" data-index="${i}"><td>${a.name}</td><td>${a.expected.toFixed(2)}%</td><td>${formatCurrency(a.allocation)}</td></tr>`).join('');
    resultTbody.innerHTML = html;
    if (totalPortion() > 100) alert('Warning: total expected % exceeds 100%');
};

const renderSimulationTable = cash => {
    const allocs = computeAllocations(cash);
    simHeaders.forEach(th => { if (!th.dataset.percent) { const p = parseFloat(th.innerText.replace('%', '')) || 0; th.dataset.percent = p; th.innerText = p + '%'; } });
    simTbody.innerHTML = allocs.map(a => {
        let row = `<tr class="${a.color || ''}"><td>${a.name}</td>`;
        simHeaders.forEach(th => {
            const p = Number(th.dataset.percent) || 0;
            const isDark = a.darkened.includes(p);
            row += `<td data-percent="${p}"${isDark ? ' data-darkened="true" style="background-color:rgba(0,0,0,.25);color:#fff"' : ''}>${formatCurrency(a.allocation * (p / 100))}</td>`;
        });
        return row + '</tr>';
    }).join('');
};

const renderAll = () => {
    const cash = Number(cashInput.value) || 0;
    renderSimulationHeaders();
    renderResultTable(cash);
    renderSimulationTable(cash);
    saveToStorage();
};

/* ==== MODAL HELPERS ==== */
const openModal = modal => modal.style.display = 'flex';
const closeModal = () => { document.getElementById('editModal').style.display = 'none'; editingIndex = null; chosenColor = null; };
const openAddStockModal = () => { document.getElementById('addStockModal').style.display = 'flex'; document.getElementById('newStockName').value = ''; document.getElementById('newStockPortion').value = ''; };
const closeAddStockModal = () => document.getElementById('addStockModal').style.display = 'none';
const openSimModal = (colIndex, currentPercent) => { simEditingColIndex = colIndex; document.getElementById('editSimValue').value = currentPercent; document.getElementById('editSimModal').style.display = 'flex'; };
const closeSimModal = () => { document.getElementById('editSimModal').style.display = 'none'; simEditingColIndex = null; };

/* ==== EVENT LISTENERS ==== */
document.querySelector('.clear').addEventListener('click', () => {
    if (!confirm('Are you sure you want to clear all portfolio data?')) return;
    portfolio = {
        cash: 0,
        items: [],
        simulationHeaders: [
            { label: "1st", percent: 20 },
            { label: "2st", percent: 30 },
            { label: "3st", percent: 40 },
            { label: "4st", percent: 50 },
            { label: "5st", percent: 60 },
            { label: "6st", percent: 70 }
        ]
    };
    cashInput.value = '';
    closeModal();
    closeAddStockModal();
    closeSimModal();
    renderAll();
});

document.querySelector('.add').addEventListener('click', openAddStockModal);

resultTbody.addEventListener('click', e => {
    const tr = e.target.closest('tr'); if (!tr) return;
    editingIndex = Number(tr.dataset.index); chosenColor = portfolio.items[editingIndex].color;
    document.getElementById('editPortion').value = portfolio.items[editingIndex].portion;
    openModal(document.getElementById('editModal'));
});

document.getElementById('colorOptions').addEventListener('click', e => { if (e.target.classList.contains('color-option')) chosenColor = e.target.dataset.color; });

function wireModal(modalId, saveCb, deleteCb) {
    const modal = document.getElementById(modalId);
    modal.querySelector('.save').onclick = saveCb;
    modal.querySelector('.delete') && (modal.querySelector('.delete').onclick = deleteCb);
    modal.querySelector('.cancel').onclick = () => modal.style.display = 'none';
}

wireModal('editModal', () => {
    if (editingIndex == null) return;
    const val = parseFloat(document.getElementById('editPortion').value) || 0;
    portfolio.items[editingIndex].portion = val;
    if (chosenColor) portfolio.items[editingIndex].color = chosenColor;
    renderAll(); closeModal();
}, () => {
    if (editingIndex == null) return;
    if (confirm(`Delete ${portfolio.items[editingIndex].name}?`)) {
        portfolio.items.splice(editingIndex, 1);
        renderAll(); closeModal();
    }
});

wireModal('addStockModal', () => {
    const name = document.getElementById('newStockName').value.trim(); // get stock name
    const portion = parseFloat(document.getElementById('newStockPortion').value); // get portion value

    // Validate stock name
    if (!name) return alert('Stock name cannot be empty');

    // Validate portion value
    if (isNaN(portion)) return alert('Portion must be a number');

    // Check min/max range (0 < portion <= 100)
    if (portion <= 0 || portion > 100) return alert('Portion must be greater than 0 and less than or equal to 100');

    // Check for duplicate stock names (case-insensitive)
    const exists = portfolio.items.some(item => item.name.toUpperCase() === name.toUpperCase());
    if (exists) return alert('Stock name already exists!');

    // Add new stock to portfolio
    portfolio.items.push({
        name: name.toUpperCase(),
        portion,
        color: 'highlight-gray',
        darkened: []
    });

    renderAll(); // re-render tables
    closeAddStockModal(); // close modal
});

simHeaders.forEach((th, idx) => th.addEventListener('click', () => {
    const current = Number(th.dataset.percent) || parseFloat(th.innerText.replace('%', '')) || 0;
    openSimModal(idx, current);
}));

wireModal('editSimModal', () => {
    const raw = parseFloat(document.getElementById('editSimValue').value);
    if (isNaN(raw) || raw < 0) return alert('Enter valid percent');
    const th = simHeaders[simEditingColIndex]; if (!th) return closeSimModal();
    th.dataset.percent = raw; th.innerText = raw + '%';
    portfolio.simulationHeaders[simEditingColIndex].percent = raw;
    renderSimulationTable(Number(cashInput.value) || 0); closeSimModal();
    saveToStorage()
});

simTbody.addEventListener('click', e => {
    const td = e.target.closest('td'); if (!td || !td.dataset.percent) return;
    const tr = td.parentElement; const idx = Array.from(tr.parentElement.children).indexOf(tr);
    const val = parseFloat(td.dataset.percent); const stock = portfolio.items[idx]; if (!stock) return;
    if (!stock.darkened) stock.darkened = [];
    if (stock.darkened.includes(val)) {
        stock.darkened = stock.darkened.filter(x => x !== val); td.dataset.darkened = ''; td.style.background = ''; td.style.color = '';
    } else {
        stock.darkened.push(val); td.dataset.darkened = 'true'; td.style.background = 'rgba(0,0,0,.25)'; td.style.color = '#fff';
    }
    saveToStorage();
});

cashInput.addEventListener('input', () => {
    portfolio.cash = Number(cashInput.value) || 0;
    saveToStorage(); renderAll();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeAddStockModal(); closeSimModal(); } });

renderAll();