import { DEMO_GROUP_TYPE } from "../../globalVariables.js";
import NoteModel from "../models/note.js";
import TodoModel from "../models/noteTodo.js";
import { createTodoSocketEvent } from "../cores/createSocketEvent.js";
import { io } from "../../index.js";
import mongoose from "mongoose";

class TodoController {
    /**
     * [POST] /api/todo/get
     * req.body = {userId, groupId, noteId}
     */
    async Get(req, res) {
        const { userId, groupId, noteId } = req.body;
        if (!groupId || !noteId) return res.json({ success: false, message: 'bad request' });
        try {
            const response = await TodoModel.aggregate([
                {
                    $lookup: {
                        from: 'notes',
                        localField: "noteId",
                        foreignField: "_id",
                        as: 'note',
                    },
                },
                {
                    $lookup: {
                        from: 'group_members',
                        localField: 'note.groupId',
                        foreignField: 'groupId',
                        as: 'groups'
                    }
                },
                {
                    $lookup: {
                        from: "groups",
                        localField: "note.groupId",
                        foreignField: "_id",
                        as: 'group'
                    }
                },
                {
                    $match: {
                        noteId: mongoose.Types.ObjectId(noteId),
                        $or: [{ 'groups.userId': mongoose.Types.ObjectId(userId) }, { "group.type": DEMO_GROUP_TYPE }]
                    }
                },
                {
                    $project: {
                        note: 0,
                        groups: 0,
                        group: 0,
                    }
                }

            ])

            return res.json({ success: true, message: 'success', response })

        } catch (err) {
            console.log(err);

            return res.json({ success: false, message: 'internal server' })
        }
    }
    /**
     * [POST] /api/todo/create
     * req.body = {userId, groupId, todoName, noteId}
     */
    async Create(req, res) {
        const { userId, groupId, todoName, noteId } = req.body;

        if (!groupId || !todoName || !noteId) return res.json({ success: false, message: 'bad request' });

        try {

            const isUserInGroup = await checkUserInGroup({ groupId, userId, noteId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            const newTodo = new TodoModel({
                name: todoName,
                noteId
            })

            const response = await TodoModel.create(newTodo);
            io.emit(createTodoSocketEvent(noteId), { response, action: 'create' })

            return res.json({ success: true, message: 'successfully', response });

        } catch (err) {
            console.log(`[todo add err]`, err);
            return res.json({ success: true, message: 'internal server' });
        }
    }
    /**
     * [Delete] /api/todo/delete
     * req.body = { userId, noteId, todoId, groupId }
     */
    async Delete(req, res) {
        const { userId, noteId, todoId, groupId } = req.body;

        if (!noteId || !groupId || !todoId) return res.json({ success: false, message: 'bad request' })

        try {

            const isUserInGroup = await checkUserInGroup({ groupId, userId, noteId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            const response = await TodoModel.deleteOne({ _id: todoId, noteId });

            io.emit(createTodoSocketEvent(noteId), { response: todoId, action: 'delete' });

            return res.json({ success: true, message: 'successfully', response });


        } catch (err) {
            console.log('todo delete todo err', err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [POST] /api/todo/change-state
     */
    async ChangeState(req, res) {
        const { userId, groupId, noteId, todoId, state } = req.body;

        if (!noteId || !todoId || state == undefined || !groupId) return res.json({ success: false, message: 'bad request' });

        try {

            const isUserInGroup = await checkUserInGroup({ groupId, userId, noteId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            const response = await TodoModel.findOneAndUpdate({ _id: todoId, noteId }, { state }, { new: true });

            io.emit(createTodoSocketEvent(noteId), { response, action: 'changeState' })
            return res.json({ success: true, message: 'successfully', response });

        } catch (err) {
            console.log(err);

            return res.json({ success: false, message: 'internal server' });
        }
    }
}

export default new TodoController;

async function checkUserInGroup({ userId, groupId, noteId }) {
    if (!groupId || !noteId) return false;

    const foundUser = await NoteModel.aggregate([
        {
            $lookup: {
                from: "groups",
                localField: "groupId",
                foreignField: "_id",
                as: 'group'
            }

        },
        {
            $lookup: {
                from: "group_members",
                localField: "group._id",
                foreignField: "groupId",
                as: 'groups'
            }
        },
        {
            $match: {
                groupId: mongoose.Types.ObjectId(groupId),
                _id: mongoose.Types.ObjectId(noteId),
                $or: [{ "group.type": DEMO_GROUP_TYPE }, { "groups.userId": mongoose.Types.ObjectId(userId) }]
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ])

    if (foundUser.length < 1) {
        return false;
    }

    return true;
}