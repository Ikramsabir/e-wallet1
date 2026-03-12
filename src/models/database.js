const database={

users:[
{
id:"1",
name:"Ali",
email:"Ali@example.com",
password:"1232",
wallet:{
balance:12457,
currency:"MAD",
cards:[
{numcards:"124847", type:"visa",balance:14712,expiry:"14-08-27",vcc:"147"},
{numcards:"124478", type:"mastercard",balance:1470,expiry:"14-08-28",vcc:"257"},
],
transactions:[
{ id:"1", type:"credit",amount:140,date:"14-08-25", from:"Ahmed" , to:"124847"},
{ id:"2", type:"debit",amount:200,date:"13-08-25", from:"124847" , to:"Amazon"},
{ id:"3", type:"credit",amount:250,date:"12-08-25", from:"Ahmed" , to:"124478"},
]
}
},

{
id:"2",
name:"Ahmed",
email:"Ahmed@example.com",
password:"1234",
wallet:{
balance:8000,
currency:"MAD",
cards:[
{numcards:"987654", type:"visa",balance:8000,expiry:"11-09-27",vcc:"333"}
],
transactions:[
{ id:"4", type:"credit", amount:300, date:"10-08-25", from:"Ali", to:"987654"},
{ id:"5", type:"debit", amount:120, date:"11-08-25", from:"987654", to:"Netflix"},
{ id:"6", type:"credit", amount:500, date:"12-08-25", from:"Youssef", to:"987654"}
]
}
},

{
id:"3",
name:"Youssef",
email:"Youssef@example.com",
password:"1234",
wallet:{
balance:5000,
currency:"MAD",
cards:[
{numcards:"456789", type:"mastercard",balance:5000,expiry:"10-05-28",vcc:"222"}
],
transactions:[
{ id:"7", type:"credit", amount:200, date:"09-08-25", from:"Ali", to:"456789"},
{ id:"8", type:"debit", amount:80, date:"10-08-25", from:"456789", to:"Spotify"},
{ id:"9", type:"credit", amount:150, date:"11-08-25", from:"Ahmed", to:"456789"}
]
}
}

]
}

const finduserbymail=(mail,password)=> database.users.find((u)=> u.email===mail && u.password===password);





export default finduserbymail;