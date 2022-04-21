import 'dotenv/config';

import DB from "./src/cores/connectDB.js";
import { Server } from 'socket.io';
import authDdosMidleware from './src/midlewares/antiDDosMidleware.js';
import corsMidleware from "./src/midlewares/corsMidleware.js";
import express from "express";
import http from 'http';
import router from './src/routes/index.js'
import { whiteList } from './globalVariables.js';

const PORT = process.env.PORT || 8080;

const app = express();


// Socket io
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: whiteList,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})


DB.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(corsMidleware);

app.use(authDdosMidleware(60)) // limit 60 requests in 1 minutes
router(app);
server.listen(PORT, () => { console.log(`Web at http://localhost:${PORT}`); });