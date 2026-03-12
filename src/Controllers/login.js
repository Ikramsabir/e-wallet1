import finduserbymail from "../models/database.js";

let mail=document.querySelector("#mail");
let password=document.querySelector("#password");

const submitbtn=document.querySelector("#submitbtn");

submitbtn.addEventListener("click",handler2);

function handler2(){
    let email=mail.value;
    let pass=password.value;
    submitbtn.textContent="Serch !!!!";
    if(email==="" || pass===""){
        alert("les cases sont vides");
        submitbtn.textContent = "Se connecter";
        return;
    }else{
        setTimeout(()=>{
            let user=finduserbymail(email,pass);
            if(user){
                sessionStorage.setItem("us", JSON.stringify(user));
                document.location="dashboard.html";
            }else{
                submitbtn.textContent = "Se connecter";
                alert("ne trouve pas !!!");
            }
        },2000);
    }
}