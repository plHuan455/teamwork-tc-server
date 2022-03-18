import authRouter from "./auth.js";
import groupRouter from "./group.js";
import noteRouter from "./note.js";
import todoRouter from "./todo.js";

function router(app) {
    app.use('/api/auth', authRouter)
    app.use('/api/group', groupRouter);
    app.use('/api/note', noteRouter);
    app.use('/api/todo', todoRouter);
}


export default router;


