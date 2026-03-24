import { getbeneficiaries, finduserbyaccount, findbeneficiarieByid } from "../models/database.js";

const user = JSON.parse(sessionStorage.getItem("currentUser"));

// DOM elements
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transfer-section");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn = document.getElementById("submitTransferBtn");
const amountInput = document.getElementById("amount");
const transferForm = document.getElementById("transferForm");

// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "../../index.html";
}

// Events
transferBtn.addEventListener("click", handleTransfersection);
closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
transferForm.addEventListener("submit", handleTransfer);

// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} ${user.wallet.currency}`,
    monthlyExpenses: `${monthlyExpenses} ${user.wallet.currency}`,
  };
};

function renderDashboard() {
  const dashboardData = getDashboardData();

  greetingName.textContent = dashboardData.userName;
  currentDate.textContent = dashboardData.currentDate;
  solde.textContent = dashboardData.availableBalance;
  incomeElement.textContent = dashboardData.monthlyIncome;
  expensesElement.textContent = dashboardData.monthlyExpenses;
  activecards.textContent = dashboardData.activeCards;

  // Display transactions
  transactionsList.innerHTML = "";

  user.wallet.transactions
    .slice()
    .reverse()
    .forEach(transaction => {
      const transactionItem = document.createElement("div");
      transactionItem.className = "transaction-item";

      const sign = transaction.type === "credit" ? "+" : "-";
      const person = transaction.to || transaction.from || "Transaction";

      transactionItem.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-name">${person}</span>
          <span class="transaction-date">${transaction.date}</span>
        </div>
        <div class="transaction-amount ${transaction.type}">
          ${sign}${transaction.amount} ${user.wallet.currency}
        </div>
      `;

      transactionsList.appendChild(transactionItem);
    });
}

renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.add("hidden");
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTransfersection() {
  transferSection.classList.remove("hidden");
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}

// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiarySelect.innerHTML = `<option value="" disabled selected>Choisir un bénéficiaire</option>`;

  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();

function renderCards() {
  sourceCard.innerHTML = `<option value="" disabled selected>Sélectionner une carte</option>`;

  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = `${card.type} ****${card.numcards.slice(-4)}`;
    sourceCard.appendChild(option);
  });
}
renderCards();

//###################################  Transfer  #####################################################//

// check function

function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const beneficiary = finduserbyaccount(numcompte);

      if (beneficiary) {
        resolve(beneficiary);
      } else {
        reject("beneficiary not found");
      }
    }, 500);
  });
}

function checkSolde(expediteur, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (expediteur.wallet.balance >= amount) {
        resolve("Sufficient balance");
      } else {
        reject("Insufficient balance");
      }
    }, 500);
  });
}

function updateSolde(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("update balance done");
    }, 300);
  });
}

function addtransactions(expediteur, destinataire, amount, selectedCard) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // create credit transaction
      const credit = {
        id: Date.now(),
        type: "credit",
        amount: amount,
        date: new Date().toLocaleString(),
        from: expediteur.name,
        to: destinataire.name
      };

      // create debit transaction
      const debit = {
        id: Date.now() + 1,
        type: "debit",
        amount: amount,
        date: new Date().toLocaleString(),
        from: selectedCard,
        to: destinataire.name
      };

      expediteur.wallet.transactions.push(debit);
      destinataire.wallet.transactions.push(credit);

      resolve("transaction added successfully");
    }, 500);
  });
}

// **************************************transfer***************************************************//

function transfer(expediteur, numcompte, amount, selectedCard) {
  let savedDestinataire;

  checkUser(numcompte)
    .then((destinataire) => {
      savedDestinataire = destinataire;
      console.log("Étape 1: Destinataire trouvé -", destinataire.name);
      return checkSolde(expediteur, amount);
    })
    .then((soldemessage) => {
      console.log(soldemessage);
      return updateSolde(expediteur, savedDestinataire, amount);
    })
    .then((updatemessage) => {
      console.log(updatemessage);
      return addtransactions(expediteur, savedDestinataire, amount, selectedCard);
    })
    .then((addtransactionMessage) => {
      console.log(addtransactionMessage);

      sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
      renderDashboard();
      closeTransfer();
      transferForm.reset();
      alert("Transfert réussi !");
    })
    .catch((error) => {
      console.log(error);
      alert(error);
    });
}

function handleTransfer(e) {
  e.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const sourceCardValue = sourceCard.value;
  const amount = Number(amountInput.value);

  if (!beneficiaryId) {
    alert("Choisir un bénéficiaire");
    return;
  }

  if (!sourceCardValue) {
    alert("Choisir une carte");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Montant invalide");
    return;
  }

  const beneficiaryData = findbeneficiarieByid(user.id, beneficiaryId);

  if (!beneficiaryData) {
    alert("Bénéficiaire introuvable");
    return;
  }

  const beneficiaryAccount = beneficiaryData.account;

  transfer(user, beneficiaryAccount, amount, sourceCardValue);
}