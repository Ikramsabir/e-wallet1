const us = JSON.parse(sessionStorage.getItem("us"));
let greetingName = document.querySelector("#greetingName");
let availableBalance = document.querySelector("#availableBalance");
let monthlyIncome = document.querySelector("#monthlyIncome");
let monthlyExpenses = document.querySelector("#monthlyExpenses");
let activeCards = document.querySelector("#activeCards");

if (us) {
    greetingName.textContent = us.name;
    availableBalance.textContent = `${us.wallet.balance} ${us.wallet.currency}`;

    const revenus = us.wallet.transactions
        .filter(t => t.type === "credit")
        .reduce((s, t) => s + t.amount, 0);
    monthlyIncome.textContent = `${revenus} ${us.wallet.currency}`;

    const depense = us.wallet.transactions
        .filter(t => t.type === "debit")
        .reduce((s, t) => s + t.amount, 0);
    monthlyExpenses.textContent = `${depense} ${us.wallet.currency}`;

    activeCards.textContent = us.wallet.cards.length;
}

const quickTransfer = document.querySelector("#quickTransfer");
const transferSection = document.querySelector("#transfer-section");
const closeTransferBtn = document.querySelector("#closeTransferBtn");
const cancelTransferBtn = document.querySelector("#cancelTransferBtn");
const transferForm = document.querySelector("#transferForm");
const sourceCard = document.querySelector("#sourceCard");
const beneficiarySelect = document.querySelector("#beneficiary");
const transactionsContainer = document.querySelector("#recentTransactionsList");

quickTransfer.addEventListener("click", showTransferSection);
closeTransferBtn.addEventListener("click", hideTransferSection);
cancelTransferBtn.addEventListener("click", hideTransferSection);
transferForm.addEventListener("submit", handleTransferSubmit);

function showTransferSection() {
    transferSection.classList.remove("hidden");
}

function hideTransferSection() {
    transferSection.classList.add("hidden");
}

function handleTransferSubmit(e) {
    e.preventDefault();

    const transferData = {
        beneficiary: document.querySelector("#beneficiary").value,
        sourceCard: document.querySelector("#sourceCard").value,
        amount: parseFloat(document.querySelector("#amount").value)
    };

    checkBeneficiary(transferData)
        .then(checkAmount)
        .then(checkSolde)
        .then(createDebitTransaction)
        .then(saveTransfer)
        .then(showSuccess)
        .catch(showError);
}

function checkBeneficiary(data) {
    return new Promise((resolve, reject) => {
        if (!data.beneficiary) {
            reject("Choisir un bénéficiaire");
        } else {
            resolve(data);
        }
    });
}

function checkAmount(data) {
    return new Promise((resolve, reject) => {
        if (isNaN(data.amount) || data.amount <= 0) {
            reject("Montant invalide");
        } else {
            resolve(data);
        }
    });
}

function checkSolde(data) {
    return new Promise((resolve, reject) => {
        if (data.amount > us.wallet.balance) {
            reject("Solde insuffisant");
        } else {
            resolve(data);
        }
    });
}

function createDebitTransaction(data) {
    return new Promise((resolve) => {
        const transaction = {
            id: Date.now(),
            type: "debit",
            amount: data.amount,
            from: data.sourceCard,
            to: data.beneficiary,
            date: new Date().toLocaleDateString()
        };

        us.wallet.transactions.push(transaction);
        us.wallet.balance -= data.amount;

        resolve(data);
    });
}

function saveTransfer(data) {
    return new Promise((resolve) => {
        sessionStorage.setItem("us", JSON.stringify(us));
        resolve(data);
    });
}

function showSuccess() {
    alert("Transfert réussi");
    location.reload();
}

function showError(message) {
    alert(message);
}

if (us) {
    us.wallet.cards.forEach(card => {
        const option = document.createElement("option");
        option.value = card.numcards;
        option.textContent = `${card.type} ****${card.numcards.slice(-4)}`;
        sourceCard.appendChild(option);
    });
}

if (us) {
    const names = new Set();

    us.wallet.transactions.forEach(t => {
        if (t.from && t.from !== us.name && isNaN(t.from)) {
            names.add(t.from);
        }

        if (t.to && t.to !== us.name && isNaN(t.to)) {
            names.add(t.to);
        }
    });

    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        beneficiarySelect.appendChild(option);
    });
}

if (us && us.wallet.transactions) {
    transactionsContainer.innerHTML = "";

    us.wallet.transactions.slice().reverse().forEach(t => {
        const div = document.createElement("div");
        div.classList.add("transaction-item");

        const sign = t.type === "credit" ? "+" : "-";

        div.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-name">${t.to || t.from || "Transaction"}</span>
                <span class="transaction-date">${t.date}</span>
            </div>
            <div class="transaction-amount ${t.type}">
                ${sign}${t.amount} ${us.wallet.currency}
            </div>
        `;

        transactionsContainer.appendChild(div);
    });
}