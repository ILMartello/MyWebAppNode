const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

//For jwt
const {v4 : uuidv4} = require('uuid');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');

dotenv.config();
const dbService = require('./dbService');

const connection = require('./dbService');



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

//
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


//Test Conservazione dello stato e informazioni nel coockie
app.get('/',(req,res)=>{
    req.session.colorepreferito = "blu";
    console.log(req.session.id);
    res.send();
}); 
app.get('/colore',(req,res)=>{
    res.send(`il tuo colore preferito è ${req.session.colorepreferito}`);
}); 
//Test finto login
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