import { DEMO_GROUP_TYPE } from '../../globalVariables.js';
import GroupModel from "../models/group.js";
import NoteModel from "../models/note.js";
import TodoModel from "../models/noteTodo.js";
import mongoose from 'mongoose';

class NoteController {
    // [POST] /api/todos/always-change
    async AlwaysChange(req, res) {
        const { userId, noteId, data } = req.body;
        // console.log(userId);
        try {
            const demoGroup = await GroupModel.findOne({ type: DEMO_GROUP_TYPE }).select('_id');
            const isValid = await NoteModel.aggregate([
                {
                    $lookup: {
                        from: "group_members",
                        localField: "groupId",
                        foreignField: "groupId",
                        as: "group_members"
                    }
                },
                {
                    $match: {
                        $or: [{ "group_members.userId": mongoose.Types.ObjectId(userId) },
                        { "groupId": mongoose.Types.ObjectId(demoGroup._id) }
                        ],
                        "_id": mongoose.Types.ObjectId(noteId)
                    },
                },
                {
                    $project: {
                        group_members: 0
                    }
                }

            ])

            if (isValid.length === 0) return res.json({ success: false, message: "Forbidden" })
            // const needUpdateNote = foundNote[0];
            const response = await NoteModel.findOneAndUpdate({ _id: noteId }, {
                $set: {
                    name: data.name,
                    color: data.color ? data.color : undefined,
                    to: data.to ? new Date(data.to) : undefined,
                    from: data.from ? new Date(data.from) : undefined,
                }
            }, { returnDocument: 'after' })

            // const response = await NoteModel.findOne({ _id: noteId })

            return res.json({ success: true, message: "success", response })

        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' })
        }
    }


    /** [POST] /api/note/get
     *  Get all note of user
     *  Public (logged)
    */

    async Get(req, res) {
        // return res.sendStatus(401);
        const { userId, groupId, year, month } = req.body;

        if (!groupId || year == undefined || !month == undefined) return res.json({ success: false, message: 'bad request' });

        try {
            const startDateInMonth = new Date(year, month, 1);
            const endDateInMonth = new Date(year, month + 1, 0);

            const startDate = new Date(year, month, 1 - startDateInMonth.getDay());
            const endDate = new Date(year, month, endDateInMonth.getDate() + 6 - endDateInMonth.getDay())

            const response = await NoteModel.aggregate([
                ...handleVerifyUser({
                    from: { $not: { $gt: endDate } },
                    to: { $not: { $lt: startDate } },
                }, groupId, userId),
                {
                    $sort: { from: 1 }
                },
                {
                    $project: {
                        updatedAt: 0,
                        createdAt: 0,
                        groups: 0,
                        group: 0
                    }
                }
            ])
            return res.json({ success: true, message: 'successfully', response });

        } catch (err) {
            console.log('[TODO GET ERROR]', err);
            return res.status(500).json({ success: false, message: 'internal server' });
        }
    }
    /**
     * [POST] /api/note/get-passed
     * @param {*} req {groupId}
     * @param {*} res 
     * @returns {Array} Passed Notes (to < new Date())
     */
    async GetPassed(req, res) {
        const { groupId, userId } = req.body;
        if (!groupId) return res.json({ success: false, message: 'bad request' });
        try {
            const response = await NoteModel.aggregate([
                ...handleVerifyUser({ to: { $lt: new Date() } }, groupId, userId),
                { $sort: { from: -1 } },
                {
                    $project: {
                        updatedAt: 0,
                        createAt: 0,
                        groups: 0,
                        group: 0
                    }
                }
            ])

            return res.json({ success: true, message: 'success', response });

        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }
    }
    /** [POST] /api/note/create
     *  Add a new note
     *  public (logged)
     */
    async Create(req, res) {
        const { data, userId, groupId } = req.body;

        // console.log(req.body);
        if (!groupId | !data) return res.json({ success: false, message: 'bad request' });

        try {
            const isUserInGroup = await checkUserInGroup({ groupId, userId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            const newData = new NoteModel({ name: data.name, color: data.color, groupId, from: new Date(data.from), to: new Date(data.to) })
            const response = await NoteModel.create(newData);

            return res.json({ success: true, message: 'succesfully', response });

        } catch (err) {

            console.log(`[TODO CREATE TODO]`, err);
            return res.json({ success: true, message: 'internal server' });
        }

    }
    // [PATCH] /api/note/update
    async Update(req, res) {
        const { userId, noteId, data } = req.body;

        if (!noteId || typeof data !== 'object') return res.json({ success: false, message: "bad request" });
        try {

            const demoGroup = await GroupModel.findOne({ type: DEMO_GROUP_TYPE }).select('_id');
            const foundNote = await NoteModel.aggregate([
                {
                    $lookup: {
                        from: "group_members",
                        localField: "groupId",
                        foreignField: "groupId",
                        as: "group_members"
                    }
                },
                {
                    $match: {
                        $or: [{ "group_members.userId": mongoose.Types.ObjectId(userId) },
                        { "groupId": mongoose.Types.ObjectId(demoGroup._id) }
                        ],
                        "_id": mongoose.Types.ObjectId(noteId)
                    },
                },
                {
                    $project: {
                        _id: 1
                    }
                }

            ])

            if (foundNote.length === 0) return res.json({ success: false, message: "Forbidden" })
            // const needUpdateNote = foundNote[0];
            const response = await NoteModel.findOneAndUpdate({ _id: noteId }, {
                $set: {
                    name: data.name,
                    color: data.color ? data.color : undefined,
                    to: data.to ? new Date(data.to) : undefined,
                    from: data.from ? new Date(data.from) : undefined,
                }
            }, { returnDocument: 'after' }).select('-updatedAt -createdAt')

            return res.json({ success: true, message: "success", response })
        }
        catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' })
        }
    }


    /** [DELETE] /api/note/delete 
     *  Delete a todo
     *  public (logged)
    */
    async Delete(req, res) {
        const { noteId, userId, groupId } = req.body;

        // console.log(`[req body]`, req.body);
        if (!data) return req.json({ success: false, message: 'bad request' });
        try {

            // Is user in group
            const isUserInGroup = await checkUserInGroup({ groupId, userId, });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })


            await NoteModel.deleteOne({ _id: noteId, groupId });
            return res.json({ success: true, message: 'successfully', response: data });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [POST] /api/todos/deleteMulti
     * @param {Object} req {groupId, userId, noteList}
     * @param {*} res 
     */
    async DeleteMulti(req, res) {
        const { userId, groupId, noteList } = req.body;

        if (!groupId || !noteList) return res.json({ success: false, message: 'bad request' });
        try {
            const isUserInGroup = await checkUserInGroup({ groupId, userId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            await NoteModel.deleteMany({ _id: { $in: noteList }, groupId });
            return res.json({ success: true, message: 'successfully' });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [DELETE] /api/todos/deleteTodo
     * @param {*} req {userId, noteId, todoId, groupId}
     * @param {*} res 
     */
    async DeleteTodo(req, res) {
        const { userId, noteId, todoId, groupId } = req.body;

        if (!noteId || !groupId || !todoId) return res.json({ success: false, message: 'bad request' })

        try {

            const isUserInGroup = await checkUserInGroup({ groupId, userId, noteId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' })

            const response = await TodoModel.deleteOne({ _id: todoId, noteId });

            return res.json({ success: true, message: 'successfully', response });


        } catch (err) {
            console.log('todo delete todo err', err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [POST] /api/todos/search
     * @param {Object*} req //search, groupId, userId
     * @param {*} res 
     */
    async Search(req, res) {
        const { search = undefined, userId, groupId } = req.body;
        if (search === undefined || !groupId) return res.json({ success: false, message: 'bad request' });

        try {
            const response = await NoteModel.aggregate([
                ...handleVerifyUser({ name: { $regex: search, $options: 'i' } }, groupId, userId),
                {
                    $sort: {
                        from: -1
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }
                }
            ])

            return res.json({ success: true, message: 'successfully', response });

        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }


    }
}


function handleVerifyUser(matchObj = {}, groupId, userId) {
    return [{
        $lookup: {
            from: "group_members",
            localField: "groupId",
            foreignField: "groupId",
            as: 'groups'
        }
    },
    {
        $lookup: {
            from: "groups",
            localField: "groupId",
            foreignField: "_id",
            as: 'group'
        }
    },
    {
        $match: {
            groupId: mongoose.Types.ObjectId(groupId),
            $or: [
                { 'group.type': DEMO_GROUP_TYPE },
                { "groups.userId": mongoose.Types.ObjectId(userId) }
            ],
            ...matchObj
        }
    }]
}
async function checkUserInGroup({ userId, groupId }) {
    const foundUser = await GroupModel.aggregate([
        {
            $lookup: {
                from: "group_members",
                localField: "_id",
                foreignField: "groupId",
                as: 'groups'
            }
        },
        {
            $match: {
                _id: mongoose.Types.ObjectId(groupId),
                $or: [{ type: DEMO_GROUP_TYPE }, { "groups.userId": mongoose.Types.ObjectId(userId) }]
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ])

    // const foundUser = await GroupMemberModel.find({ groupId, $or:[{userId}, ] });
    if (foundUser.length < 1) {
        return false;
    }

    return true;
}

export default new NoteController;