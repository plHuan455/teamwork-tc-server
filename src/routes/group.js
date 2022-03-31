import GroupController from "../controllers/GroupController.js";
import express from "express";
import getTokenDataMidleware from "../midlewares/getTokenDataMidleware.js"

const groupRouter = express.Router();

groupRouter.get('/always-change', GroupController.AlwaysChange);
groupRouter.get('/get', getTokenDataMidleware, GroupController.Get);
groupRouter.post('/invite', getTokenDataMidleware, GroupController.Invite);
groupRouter.post('/create', getTokenDataMidleware, GroupController.Create);
groupRouter.post('/get-members', getTokenDataMidleware, GroupController.GetMember);
groupRouter.post('/out', getTokenDataMidleware, GroupController.OutGroup);
groupRouter.delete('/delete-member', getTokenDataMidleware, GroupController.DeleteMember);
groupRouter.delete('/delete-group', getTokenDataMidleware, GroupController.Delete);
export default groupRouter;