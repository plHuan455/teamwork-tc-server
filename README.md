# Teamwork-tc Server
<a href="https://teamwork-tc.herokuapp.com/">https://teamwork-tc.herokuapp.com/</a>

## Project Description
A Nodejs + Express framework server using NoSQL Database (Mongodb)

Using for calling api from clients

## Language
Javascript

## Libraries and Frameworks
- <a href="https://expressjs.com/">Express</a>
- <a href="https://mongoosejs.com/docs/queries.html">Mongoose</a>
- <a href="https://www.npmjs.com/package/jsonwebtoken">Jsonwebtoken</a>
- <a href="https://socket.io/">Socket.io</a>
- <a href="https://www.npmjs.com/package/cors">Cors</a>
- <a href="https://www.npmjs.com/package/argon2">Argon2</a>
- <a href="https://www.npmjs.com/package/express-rate-limit">Express Rate Limit</a>
- ...

## Models
<img width="100%" alt="teamwork_tc_database" src="https://user-images.githubusercontent.com/73534639/164203305-978f1b4f-ccda-4d15-ac52-d23209d5adf5.png">

## Install and Run
Clone this project to your local and:
- install packages ```npm install```
- Add .env file in root folder with content:
```
JWT_SECRET = [YOUR JSONWEBTOKEN STRING]

MONGO_URI = [YOUR MONGODB URI]
```
- run project ```npm run dev```
