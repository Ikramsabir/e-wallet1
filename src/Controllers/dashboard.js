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

    const beneficiaryValue = document.querySelector("#beneficiary").value;
    const amount = parseFloat(document.querySelector("#amount").value);

    if (!beneficiaryValue) {
        alert("Choisir un bénéficiaire");
        return;
    }

    if (amount <= 0 || isNaN(amount)) {
        alert("Montant invalide");
        return;
    }

    if (amount > us.wallet.balance) {
        alert("Solde insuffisant");
        return;
    }

    const debitTransaction = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        beneficiary: beneficiaryValue,
        date: new Date().toLocaleDateString()
    };

    us.wallet.transactions.push(debitTransaction);

    us.wallet.balance -= amount;
    sessionStorage.setItem("us", JSON.stringify(us));

    alert("Transfert réussi");
    location.reload();
}

const sourceCard = document.querySelector("#sourceCard");
if (us) {
    us.wallet.cards.forEach(card => {
        const option = document.createElement("option");
        option.value = card.numcards;
        option.textContent = `${card.type} ****${card.numcards.slice(-4)}`;
        sourceCard.appendChild(option);
    });
}

const beneficiarySelect = document.querySelector("#beneficiary");
if (us) {
    const names = new Set();
    us.wallet.transactions.forEach(t => {
        
        if (t.from && t.from !== us.name) names.add(t.from);
        if (t.to && t.to !== us.name && isNaN(t.to)) names.add(t.to);
    });

    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        beneficiarySelect.appendChild(option);
    });
}



const transactionsContainer = document.querySelector("#recentTransactionsList");

if(us && us.wallet.transactions){

transactionsContainer.innerHTML="";

us.wallet.transactions.slice().reverse().forEach(t=>{

const div=document.createElement("div");
div.classList.add("transaction-item");

const sign = t.type==="credit" ? "+" : "-";

div.innerHTML=`
<div class="transaction-info">
<span class="transaction-name">${t.from || t.beneficiary || "Transaction"}</span>
<span class="transaction-date">${t.date}</span>
</div>

<div class="transaction-amount ${t.type}">
${sign}${t.amount} ${us.wallet.currency}
</div>
`;

transactionsContainer.appendChild(div);

});

}