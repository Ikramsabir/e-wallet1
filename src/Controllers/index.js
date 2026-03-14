const Loginbtn=document.querySelector('#Loginbtn');

Loginbtn.addEventListener('click',handler);

function handler(){
    setTimeout(()=>{
        Loginbtn.textContent="Loging...";
        window.location.href = "src/view/login.html";
    },2000);
}