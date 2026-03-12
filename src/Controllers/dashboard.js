const us=JSON.parse(sessionStorage.getItem("us"));
let greetingName=document.querySelector("#greetingName");
let availableBalance=document.querySelector("#availableBalance");
let monthlyIncome=document.querySelector("#monthlyIncome");
let monthlyExpenses=document.querySelector("#monthlyExpenses");
let activeCards=document.querySelector("#activeCards");


if(us){
    greetingName.textContent=us.name;
    availableBalance.textContent=`${us.wallet.balance} ${us.wallet.currency}`;
    const revenus=us.wallet.transactions.filter(t=>t.type==="credit").reduce((s,t)=>{return s+t.amount},0);
    monthlyIncome.textContent=`${revenus} ${us.wallet.currency}`;
    const depense=us.wallet.transactions.filter(t=>t.type==="debit").reduce((s,t)=>{return s+t.amount},0);
    monthlyExpenses.textContent=`${depense} ${us.wallet.currency}`;

    activeCards.textContent = us.wallet.cards.length;
}


const quickTransfer = document.querySelector("#quickTransfer");
const transferSection = document.querySelector("#transfer-section");
const closeTransferBtn = document.querySelector("#closeTransferBtn");
const cancelTransferBtn = document.querySelector("#cancelTransferBtn");

quickTransfer.addEventListener("click", () => {
    transferSection.classList.remove("hidden");
});

closeTransferBtn.addEventListener("click", () => {
    transferSection.classList.add("hidden");
});

cancelTransferBtn.addEventListener("click", () => {
    transferSection.classList.add("hidden");
});


const transferForm = document.querySelector("#transferForm");

transferForm.addEventListener("submit", function(e){
    e.preventDefault();

    const beneficiary = document.querySelector("#beneficiary").value;
    const amount = parseFloat(document.querySelector("#amount").value);

    // 1️⃣ check beneficiary
    if(!beneficiary){
        alert("Choisir un bénéficiaire");
        return;
    }

    // 2️⃣ check amount
    if(amount <= 0){
        alert("Montant invalide");
        return;
    }

    // 3️⃣ check solde
    if(amount > us.wallet.balance){
        alert("Solde insuffisant");
        return;
    }

    // 4️⃣ debit transaction
    const debitTransaction = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        beneficiary: beneficiary,
        date: new Date().toLocaleDateString()
    };

    us.wallet.transactions.push(debitTransaction);

    // 5️⃣ update solde
    us.wallet.balance -= amount;

    // save
    sessionStorage.setItem("us", JSON.stringify(us));

    alert("Transfert réussi");

    location.reload();
});

const sourceCard = document.querySelector("#sourceCard");

if(us){
    us.wallet.cards.forEach(card=>{

        const option = document.createElement("option");

        option.value = card.numcards;

        option.textContent = `${card.type} ****${card.numcards.slice(-4)}`;

        sourceCard.appendChild(option);

    });
}


const beneficiary = document.querySelector("#beneficiary");

if(us){

    const names = new Set();

    us.wallet.transactions.forEach(t => {

        if(t.from !== us.name){
            names.add(t.from);
        }

        if(t.to !== us.name && isNaN(t.to)){
            names.add(t.to);
        }

    });

    names.forEach(name => {

        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        beneficiary.appendChild(option);

    });

}