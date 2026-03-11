const Loginbtn=document.querySelector('#Loginbtn');

Loginbtn.addEventListener('click',handler);

function handler(){
    setTimeout(()=>{
        document.location="login.html";
    },2000);
}