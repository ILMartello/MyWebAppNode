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




const app = express();
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




app.get('/login', (req , res) =>{
    const payload = {id:1, isLogged: true};
    const options = {expiresIn:'100s'};
    const cookieSetting = {
        expires: new Date(Date.now()+ 1e5),
        httpOnly: true,
        secure: false
    };
    const token = jwt.sign(payload, process.env.JWTKEY, options);
    res.cookie('token', token, cookieSetting).send();
    //per testare aprire un nuovo terminal e : url -X POST localhost:5000/login
});

app.get('/user/profile', (req,res)=>{
    const token = req.cookies.token;
    if(!token)return res.status(401).send('Nessun token fornito');
    try{
        const payload = jwt.verify(token, process.env.JWTKEY);
        console.log(payload);
    }catch(err){ res.status(401).send('Il token non è valido, oppure è scaduto');}
   
   
    res.send('Il token è valido');
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