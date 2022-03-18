import GroupController from "../controllers/GroupController.js";
import express from "express";

const groupRouter = express.Router();

groupRouter.post('/addMember', GroupController.addMember);
groupRouter.post('/create', GroupController.create);
groupRouter.get('/always-change', GroupController.AlwaysChange);
groupRouter.get('/getDemo', GroupController.getDemoGroups);
groupRouter.get('/get', GroupController.get);

export default groupRouter;