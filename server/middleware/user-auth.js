const jwt = require ('jsonwebtoken');
const fs = require('fs');

module.exports = (req, res, next)=>{
    const token = req.cookies.token;
    const options = {expiresIn:'100s', algorithm : 'RS256'};
    if(!token)return res.status(401).send('Nessun token fornito');
    try{
        const pub_key = fs.readFileSync('../rsa.public');
        const payload = jwt.verify(token, pub_key, options);
        next();
    }catch(err){
         res.status(401).send('Il token non è valido, oppure è scaduto');
        }
}