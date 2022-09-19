import ExtensionController from '../controllers/ExtensionController.js';
import express from 'express';

const extensionRoute  = express.Router();

extensionRoute.post('/bank-manager', ExtensionController.PostBankManage);
export default extensionRoute;  