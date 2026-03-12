const Loginbtn=document.querySelector('#Loginbtn');

Loginbtn.addEventListener('click',handler);

function handler(){
    setTimeout(()=>{
        window.location.href = "src/view/login.html";
    },2000);
}