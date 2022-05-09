import AuthController from '../controllers/AuthController.js';
import authDdosMidleware from '../midlewares/antiDDosMidleware.js';
import express from 'express';
import getTokenDataMidleware from '../midlewares/getTokenDataMidleware.js';

const authRouter = express.Router();

authRouter.get('/get', AuthController.get);
authRouter.get('/firstAccess', getTokenDataMidleware, AuthController.firstAccess);
authRouter.get('/get-invites', getTokenDataMidleware, AuthController.GetInvites);
authRouter.post('/register', AuthController.register);
authRouter.post('/login', authDdosMidleware(6), AuthController.login);
authRouter.post('/accept-invite', getTokenDataMidleware, AuthController.AcceptInvite);
authRouter.post('/refresh-token', AuthController.RefreshToken);
authRouter.post('/check-email-and-username', AuthController.CheckRegisterField);
authRouter.delete('/disagree-invite', getTokenDataMidleware, AuthController.DisagreeInvite);
authRouter.delete('/disagree-all-invite', getTokenDataMidleware, AuthController.DisagreeAllInvite);
authRouter.post('/always-change', AuthController.AlwaysChange);

export default authRouter;
