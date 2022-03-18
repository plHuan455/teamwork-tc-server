import TodoController from "../controllers/TodoController.js";
import express from "express";

const todoRouter = express.Router();


todoRouter.post('/get', TodoController.Get)
todoRouter.post('/create', TodoController.Create)
todoRouter.post('/change-state', TodoController.ChangeState)
todoRouter.delete('/delete', TodoController.Delete)

export default todoRouter;