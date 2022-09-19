import authRouter from "./auth.js";
import getTokenDataMidleware from "../midlewares/getTokenDataMidleware.js";
import groupRouter from "./group.js";
import noteRouter from "./note.js";
import todoRouter from "./todo.js";
import extensionRoute from "./extension.js";

function router(app) {
    app.use('/api/extension', extensionRoute);
    app.use('/api/auth', authRouter)
    app.use('/api/group', groupRouter);
    app.use('/api/note', getTokenDataMidleware, noteRouter);
    app.use('/api/todo', getTokenDataMidleware, todoRouter);
}

export default router;


