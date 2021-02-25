const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

//For session and db save
const {v4 : uuidv4} = require('uuid');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
//For jwt
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//For RSA
const fs = require('fs');
const {verifyToken, signToken, deleteToken} = require('./middleware/user-auth');

//



const app = express();
const options = {expiresIn:'100s', algorithm : 'RS256'};
app.use(cookieParser());
dotenv.config();

const dbService = require('./dbService');

//Middleware per session

app.use(session({
    secret: process.env.SESSIONKEY,
    resave:false,
    saveUninitialized: true,
    cookie: {secure: false},
    genid: ()=>uuidv4(),
    store: new MySQLStore({
        host: process.env.HOST,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DB_PORT
    })
}));
//end middleware session


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));



//Test Conservazione dello stato e informazioni nel cookie
app.get('/',(req,res)=>{
    req.session.colorepreferito = "blu";
    console.log(req.session.id);
    res.send();
});
//Test finto login
/*
app.get('/colore',(req,res)=>{
    res.send(`il tuo colore preferito è ${req.session.colorepreferito}`);
}); 

app.get('/login', (req,res)=>{
    req.session.isLogged = true;
    res.send();
});
app.get('/postlogin',(req,res)=>{
    if(req.session.isLogged){
        res.send('sei loggato');
    }
    else{res.send('non sei loggato');}
}); 
app.get('/logout', (req,res)=>{
   // req.session.isLogged = false;
    //oppure per distruggere il documento salvato
    req.session.destroy(err=>console.log(err));
    res.send();
});
*/




app.get('/login',signToken, (req , res) =>{
 res.send();
});

app.get('/logout',deleteToken, (req,res)=>{
res.send();
});

app.get('/user/profile', verifyToken, (req,res)=>{
   console.log("APP TEMA :");
   console.log(req.user.tema);
    res.send('Sei Autenticato');
});


app.get('/user/message', verifyToken, (req,res)=>{
    res.send('Sei Autenticato');
});


// create
app.post('/insert', (request, response) => {
    const { name } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.insertNewName(name);

    result
    .then(data => response.json({ data: data}))
    .catch(err => console.log(err));
});

// read
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

// update
app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// delete
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.listen(process.env.PORT, () => console.log('app is running'));