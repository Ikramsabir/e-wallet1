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