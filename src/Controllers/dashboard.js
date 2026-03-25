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

  if (dashboardData) {
    greetingName.textContent = dashboardData.userName;
    currentDate.textContent = dashboardData.currentDate;
    solde.textContent = dashboardData.availableBalance;
    incomeElement.textContent = dashboardData.monthlyIncome;
    expensesElement.textContent = dashboardData.monthlyExpenses;
    activecards.textContent = dashboardData.activeCards;
  }

  // Display transactions
  transactionsList.innerHTML = "";

  user.wallet.transactions.slice().reverse().forEach(transaction => {
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

// Cards
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

/* function checkUser(numcompte, callback) {
  setTimeout(() => {
    const destinataire = finduserbyaccount(numcompte);
    if (destinataire) {
      callback(destinataire);
    } else {
      console.log("Destinataire non trouvé");
    }
  }, 500);
}

function checkSolde(exp, amount, callback) {
  setTimeout(() => {
    const solde = exp.wallet.balance;
    if (solde >= amount) {
      callback("Solde suffisant");
    } else {
      callback("Solde insuffisant");
    }
  }, 400);
}

function updateSolde(exp, destinataire, amount, callback) {
  setTimeout(() => {  
    exp.wallet.balance -= amount;
    destinataire.wallet.balance += amount;
    callback("Solde mis à jour");
  }, 300);
}

function addtransactions(exp, destinataire, amount, callback) {
  setTimeout(() => { 
    // Transaction pour l'expéditeur (débit)
    const transactionDebit = {
      id: Date.now(),
      type: "debit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    // Transaction pour le destinataire (crédit)
    const transactionCredit = {
      id: Date.now() + 1,
      type: "credit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    exp.wallet.transactions.push(transactionDebit);
    destinataire.wallet.transactions.push(transactionCredit);
    renderDashboard();
    callback("Transaction enregistrée");
  }, 200);
}

function transferer(exp, numcompte, amount) {
  console.log("\n DÉBUT DU TRANSFERT ");

  // Étape 1: Vérifier le destinataire
  checkUser(numcompte, function afterCheckUser(destinataire) {
    console.log("Étape 1: Destinataire trouvé -", destinataire.name);

    // Étape 2: Vérifier le solde
    checkSolde(exp, amount, function afterCheckSolde(soldemessage) {
      console.log(" Étape 2:", soldemessage);

      if (soldemessage.includes("Solde suffisant")) {
        // Étape 3: Mettre à jour les soldes
        updateSolde(exp, destinataire, amount, function afterUpdateSolde(updatemessage) {
          console.log(" Étape 3:", updatemessage);

          // Étape 4: Enregistrer la transaction
          addtransactions(exp, destinataire, amount, function afterAddTransactions(transactionMessage) {
            console.log(" Étape 4:", transactionMessage);
            console.log(`Transfert de ${amount} réussi!`);
          });
        });
      }
    });
  });
} */


function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const destinataire = finduserbyaccount(numcompte);

      if (destinataire) {
        resolve(destinataire);
      } else {
        reject("Destinataire non trouvé");
      }
    }, 500);
  });
}

function checkSolde(exp, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const soldeActuel = exp.wallet.balance;

      if (soldeActuel >= amount) {
        resolve("Solde suffisant");
      } else {
        reject("Solde insuffisant");
      }
    }, 400);
  });
}

function updateSolde(exp, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      exp.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("Solde mis à jour");
    }, 300);
  });
}

function addtransactions(exp, destinataire, amount, selectedCard) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Transaction pour l'expéditeur (débit)
      const transactionDebit = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        from: selectedCard,
        to: destinataire.name,
        date: new Date().toLocaleDateString()
      };

      // Transaction pour le destinataire (crédit)
      const transactionCredit = {
        id: Date.now() + 1,
        type: "credit",
        amount: amount,
        from: exp.name,
        to: destinataire.name,
        date: new Date().toLocaleDateString()
      };

      exp.wallet.transactions.push(transactionDebit);
      destinataire.wallet.transactions.push(transactionCredit);

      resolve("Transaction enregistrée");
    }, 200);
  });
}

// **************************************transfer***************************************************//

function transferer(exp, numcompte, amount, selectedCard) {
  console.log("\n DÉBUT DU TRANSFERT ");

  let savedDestinataire;

  // Étape 1: Vérifier le destinataire
  checkUser(numcompte)
    .then((destinataire) => {
      savedDestinataire = destinataire;
      console.log("Étape 1: Destinataire trouvé -", destinataire.name);

      // Étape 2: Vérifier le solde
      return checkSolde(exp, amount);
    })
    .then((soldemessage) => {
      console.log("Étape 2:", soldemessage);

      // Étape 3: Mettre à jour les soldes
      return updateSolde(exp, savedDestinataire, amount);
    })
    .then((updatemessage) => {
      console.log("Étape 3:", updatemessage);

      // Étape 4: Enregistrer la transaction
      return addtransactions(exp, savedDestinataire, amount, selectedCard);
    })
    .then((transactionMessage) => {
      console.log("Étape 4:", transactionMessage);

      sessionStorage.setItem("currentUser", JSON.stringify(exp));
      renderDashboard();
      closeTransfer();
      transferForm.reset();

      console.log(`Transfert de ${amount} réussi!`);
      alert(`Transfert de ${amount} réussi!`);
    })
    .catch((error) => {
      console.log("Erreur :", error);
      alert(error);
    });
}

function handleTransfer(e) {
  e.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const selectedCard = sourceCard.value;
  const amount = Number(document.getElementById("amount").value);

  if (!beneficiaryId) {
    alert("Choisir un bénéficiaire");
    return;
  }

  if (!selectedCard) {
    alert("Choisir une carte");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Montant invalide");
    return;
  }

  const beneficiaryObject = findbeneficiarieByid(user.id, beneficiaryId);

  if (!beneficiaryObject) {
    alert("Bénéficiaire introuvable");
    return;
  }

  const beneficiaryAccount = beneficiaryObject.account;

  transferer(user, beneficiaryAccount, amount, selectedCard);
}