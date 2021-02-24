#Learning Nodejs for webapp

My First Node project on git
Another line from Git


How to use:
- Restore packages:
cd server
npm install

- Create .env for DB and stuff values (carefull, console.log if is taking correct values)

- START in dev mode:
cd server: nodemon app (for backend)
cd client: rightclick > Open with LiveServer (install plugin if necessary)

-

JWT RSA
https://www.youtube.com/watch?v=53WqvFca5h8&list=PLdtVpbcGjJ9pZovtcSEV2MuJ7AcG3wOmV&index=48
private key = openssl genrsa -out rsa.private 1024
public key = openssl rsa -in rsa.private -out rsa.public -pubout -outform PEM
