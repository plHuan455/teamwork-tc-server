import NoteController from "../controllers/NoteController.js";
import express from "express";

const noteRouter = express.Router();

noteRouter.post('/search', NoteController.Search);
noteRouter.post('/always-change', NoteController.AlwaysChange);
noteRouter.post('/get', NoteController.Get);
noteRouter.post('/get-passed', NoteController.GetPassed);
noteRouter.post('/create', NoteController.Create);
noteRouter.patch('/update', NoteController.Update);
noteRouter.delete('/delete', NoteController.Delete);
noteRouter.delete('/delete-multi', NoteController.DeleteMulti);


export default noteRouter;

