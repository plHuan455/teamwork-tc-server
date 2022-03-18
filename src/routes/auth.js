import AuthController from '../controllers/AuthController.js';
import express from 'express';
import getTokenDataMidleware from '../midlewares/getTokenDataMidleware.js';

const authRouter = express.Router();

authRouter.get('/get', AuthController.get);
authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.get('/firstAccess', getTokenDataMidleware, AuthController.firstAccess);
authRouter.post('/always-change', AuthController.AlwaysChange);

export default authRouter;
