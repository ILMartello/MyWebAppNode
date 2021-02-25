const jwt = require ('jsonwebtoken');
const fs = require('fs');
const options = {expiresIn:'100s', algorithm : 'RS256'};

function verifyToken(req, res, next){
    const token = req.cookies.token;
    if(!token)return res.status(401).send('Nessun token fornito');
    try{
        const pub_key = fs.readFileSync('../rsa.public');
        //const payload = jwt.verify(token, pub_key, options);
        req.user = jwt.verify(token, pub_key, options);
        
        next();
    }catch(err){
         res.status(401).send('Il token non è valido, oppure è scaduto');
        }
}

function signToken(req, res, next){
        const payload = {id:1, tipoUtente:'premium', tema:'dark'};
        const cookieSetting = {
        expires: new Date(Date.now()+ 1e5),
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
    };
    const prv_key = fs.readFileSync('../rsa.private');
    const token = jwt.sign(payload, prv_key, options);
    res.cookie('token', token, cookieSetting);
    next();
}

function deleteToken(req, res, next){
    const cookieSetting = {
        expires: new Date(0),
        httpOnly: true,
        secure: false
    };
    res.cookie('token', '', cookieSetting);
    next();
}


module.exports = {
    verifyToken,
    signToken,
    deleteToken
}