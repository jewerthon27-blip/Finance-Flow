const balanceDisplay = document.querySelector('#balance');
const incomeDisplay = document.querySelector('#money-plus');
const expenseDisplay = document.querySelector('#money-minus');
const list = document.querySelector('#transactions');
const form = document.querySelector('#form');
const progressBar = document.querySelector('#progress-bar');
const usageText = document.querySelector('#usage-text');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function clearAll() {
    if(confirm("Deseja apagar todas as transações permanentemente?")) {
        transactions = [];
        updateLocalStorage();
        init();
    }
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0);
    const expense = Math.abs(amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0));

    balanceDisplay.innerText = `R$ ${total.replace('.', ',')}`;
    incomeDisplay.innerText = `+ R$ ${income.toFixed(2).replace('.', ',')}`;
    expenseDisplay.innerText = `- R$ ${expense.toFixed(2).replace('.', ',')}`;

    const percentage = income > 0 ? Math.min((expense / income) * 100, 100) : 0;
    progressBar.style.width = `${percentage}%`;
    usageText.innerText = `${percentage.toFixed(0)}% da receita utilizada`;
    progressBar.style.backgroundColor = percentage > 85 ? '#ef4444' : '#10b981';
}

function addTransactionDOM(t) {
    const item = document.createElement('li');
    item.innerHTML = `
        <div style="display:flex; align-items:center;">
            <button class="delete-btn" onclick="removeTransaction(${t.id})">Excluir</button>
            <div>
                <strong>${t.name}</strong> <br>
                <small style="color: #64748b">${t.category} • ${t.method}</small>
            </div>
        </div>
        <span style="font-weight: bold; color: ${t.amount < 0 ? '#ef4444' : '#10b981'}">
            ${t.amount < 0 ? '-' : '+'} R$ ${Math.abs(t.amount).toFixed(2)}
        </span>
    `;
    list.appendChild(item);
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const categories = [...new Set(transactions.filter(t => t.amount < 0).map(t => t.category))];
    const dataValues = categories.map(cat => {
        return Math.abs(transactions.filter(t => t.category === cat && t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.length ? categories : ['Sem despesas'],
            datasets: [{
                data: dataValues.length ? dataValues : [1],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } 
            } 
        }
    });
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.querySelector('input[name="transaction-type"]:checked').value;
    const amountInput = document.querySelector('#amount').value;
    const amountValue = type === 'expense' ? -Math.abs(amountInput) : Math.abs(amountInput);

    const transaction = {
        id: Math.floor(Math.random() * 100000),
        name: document.querySelector('#text').value,
        category: document.querySelector('#category').value,
        method: document.querySelector('#method').value,
        amount: amountValue
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();
    form.reset();
});

function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

init();