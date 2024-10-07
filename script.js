const incomes = JSON.parse(localStorage.getItem("incomes")) || [];
const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// FUNCTIONS TO CALCULATE TOTALS AND BALANCE
function calculateTotalIncome() {
    return incomes.reduce((total, income) => total + income.amount, 0);
}

function calculateTotalExpenses() {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function calculateBalance() {
    return calculateTotalIncome() - calculateTotalExpenses();
}

// FUNCTIONS TO UPDATE THE DOM
function updateDOM() {
    document.getElementById("totalIncome").innerText = calculateTotalIncome();
    document.getElementById("totalExpenses").innerText = calculateTotalExpenses();
    document.getElementById("balance").innerText = calculateBalance();

    // UPDATE INCOME AND EXPENSE LISTS
    const incomeList = document.getElementById("incomeList");
    const expenseList = document.getElementById("expenseList");
    incomeList.innerHTML = "";
    expenseList.innerHTML = "";

    incomes.forEach(income => {
        const li = document.createElement("li");
        li.innerText = `${income.description} (${income.category}): $${income.amount}`;
        incomeList.appendChild(li);
    });

    expenses.forEach(expense => {
        const li = document.createElement("li");
        li.innerText = `${expense.description} (${expense.category}): $${expense.amount}`;
        expenseList.appendChild(li);
    });

    updateFinanceChart();
    updateExpenseDistributionChart();
}

// FUNCTIONS TO ADD INCOME AND EXPENSES
function addIncome() {
    const description = document.getElementById("incomeDescription").value;
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    const category = document.getElementById("incomeCategory").value;

    if (description && amount > 0 && category) {
        incomes.push({ description, amount, category });
        document.getElementById("incomeDescription").value = "";
        document.getElementById("incomeAmount").value = "";
        document.getElementById("incomeCategory").value = "";
        localStorage.setItem("incomes", JSON.stringify(incomes));
        updateDOM();
    } else {
        alert("Please enter a valid description, amount, and category.");
    }
}

function addExpense() {
    const description = document.getElementById("expenseDescription").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;

    if (description && amount > 0 && category) {
        expenses.push({ description, amount, category });
        document.getElementById("expenseDescription").value = "";
        document.getElementById("expenseAmount").value = "";
        document.getElementById("expenseCategory").value = "";
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateDOM();
    } else {
        alert("Please enter a valid description, amount, and category.");
    }
}

document.getElementById("addIncome").addEventListener("click", addIncome);
document.getElementById("addExpense").addEventListener("click", addExpense);

// CHART.JS GRAPHS
const ctxFinance = document.getElementById('financeChart').getContext('2d');
const ctxDistribution = document.getElementById('expenseDistributionChart').getContext('2d');
let financeChart, expenseDistributionChart;

function updateFinanceChart() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();

    if (financeChart) {
        financeChart.destroy(); // DESTROY THE PREVIOUS CHART BEFORE CREATING A NEW ONE
    }

    financeChart = new Chart(ctxFinance, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount',
                data: [totalIncome, totalExpenses],
                backgroundColor: ['#28a745', '#dc3545'],
                borderColor: ['#218838', '#c82333'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateExpenseDistributionChart() {
    const categories = {};
    expenses.forEach(expense => {
        if (categories[expense.category]) {
            categories[expense.category] += expense.amount;
        } else {
            categories[expense.category] = expense.amount;
        }
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (expenseDistributionChart) {
        expenseDistributionChart.destroy(); // DESTROY THE PREVIOUS CHART BEFORE CREATING A NEW ONE
    }

    expenseDistributionChart = new Chart(ctxDistribution, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#fd7e14'],
            }]
        },
        options: {
            responsive: true
        }
    });
}

// FUNCTION TO EXPORT DATA TO CSV
function exportData() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Description,Category,Amount,Type\n"; // HEADERS

    incomes.forEach(income => {
        csvContent += `${income.description},${income.category},${income.amount},Income\n`;
    });

    expenses.forEach(expense => {
        csvContent += `${expense.description},${expense.category},${expense.amount},Expense\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "personal_finances.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("exportData").addEventListener("click", exportData);

// IMPORT DATA FROM CSV
document.getElementById("import").addEventListener("click", () => {
    const fileInput = document.getElementById("importData");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const lines = text.split("\n").slice(1); // IGNORE THE HEADER LINE

            lines.forEach(line => {
                const [description, category, amount, type] = line.split(",");

                if (type === "Income") {
                    incomes.push({ description, amount: parseFloat(amount), category });
                } else if (type === "Expense") {
                    expenses.push({ description, amount: parseFloat(amount), category });
                }
            });

            localStorage.setItem("incomes", JSON.stringify(incomes));
            localStorage.setItem("expenses", JSON.stringify(expenses));
            updateDOM();
        };

        reader.readAsText(file);
    }
});

// RECURRING INCOME AND EXPENSES
const recurringIncomes = [];
const recurringExpenses = [];

// FUNCTION TO ADD RECURRING INCOME
function addRecurringIncome() {
    const description = document.getElementById("recurringIncomeDescription").value;
    const amount = parseFloat(document.getElementById("recurringIncomeAmount").value);
    const category = document.getElementById("recurringIncomeCategory").value;

    if (description && amount > 0 && category) {
        recurringIncomes.push({ description, amount, category });
        document.getElementById("recurringIncomeDescription").value = "";
        document.getElementById("recurringIncomeAmount").value = "";
        document.getElementById("recurringIncomeCategory").value = "";
        alert("Recurring income added!");
    } else {
        alert("Please enter a valid description, amount, and category.");
    }
}

// FUNCTION TO ADD RECURRING EXPENSE
function addRecurringExpense() {
    const description = document.getElementById("recurringExpenseDescription").value;
    const amount = parseFloat(document.getElementById("recurringExpenseAmount").value);
    const category = document.getElementById("recurringExpenseCategory").value;

    if (description && amount > 0 && category) {
        recurringExpenses.push({ description, amount, category });
        document.getElementById("recurringExpenseDescription").value = "";
        document.getElementById("recurringExpenseAmount").value = "";
        document.getElementById("recurringExpenseCategory").value = "";
        alert("Recurring expense added!");
    } else {
        alert("Please enter a valid description, amount, and category.");
    }
}

// NOTIFICATION TIMER
setInterval(() => {
    const totalExpenses = calculateTotalExpenses();
    if (totalExpenses > 1000) { // EXAMPLE THRESHOLD FOR NOTIFICATION
        alert("Warning: Your total expenses have exceeded $1000!");
    }
}, 60000); // NOTIFY EVERY MINUTE

// INITIALIZE DOM
updateDOM();

// FUNCTION TO FETCH DATA FROM A LOCAL JSON FILE
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        data.incomes.forEach(income => incomes.push(income));
        data.expenses.forEach(expense => expenses.push(expense));
        localStorage.setItem("incomes", JSON.stringify(incomes));
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateDOM();
    } catch (error) {
        console.error("Error loading data: ", error);
    }
}

// CALL THE LOADDATA FUNCTION WHEN THE PAGE LOADS
window.onload = loadData;

