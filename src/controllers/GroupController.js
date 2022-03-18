import { DEMO_GROUP_TYPE } from "../../globalVariables.js";
import GroupMemberModel from "../models/groupMember.js";
import GroupModel from "../models/group.js";
import mongoose from "mongoose";
import userModel from "../models/user.js";

class GroupController {
    async AlwaysChange(req, res) {
        let response = "";
        try {
            // await GroupMemberModel.create({ groupId: "6230626f4257f7717c825a53" })
            const response = await GroupMemberModel.find();

            return res.json({ success: true, message: 'successfully', response });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'failed' });
        }
    }
    /**
     * [GET] /api/groups/getDemo
     * @param {*} req 
     * @param {*} res 
     */
    async getDemoGroups(req, res) {
        try {
            const response = await GroupModel.findOne({ type: 'demo' });
            return res.json({ success: true, message: 'successfully', response });
        } catch (err) {
            console.log(`[GROUP GET DEMO ERR]`, err);
            return res.json({ success: false, message: 'internal server' });
        }
    }


    /**
     * [GET] /api/groups/get
     * Get all group of user by userId
     * @param {*} req 
     * @param {*} res 
     */
    async get(req, res) {
        const { userId } = req.body;

        try {
            // Get group with type === demo  ||  userId in user of group
            // const response = await GroupModel.
            //     find({ $or: [{ type: 'demo' }, { users: userId }] })//.populate({ path: 'users', select: "_id username fullname type" });

            const response = await GroupModel.aggregate([
                {
                    $lookup: {
                        from: 'group_members',
                        foreignField: 'groupId',
                        localField: '_id',
                        as: 'groups'
                    }
                },
                {
                    $match: {
                        $or: [{ type: DEMO_GROUP_TYPE }, { "groups.userId": userId }]
                    }
                },
                {
                    $project: {
                        updatedAt: 0,
                        createdAt: 0,
                        groups: 0
                    }
                }
            ])

            return res.json({ success: true, message: 'successfully', response });

        } catch (err) {
            console.log(`[DOC GET GROUP ERR]`, err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
    * [POST] /api/groups/create
    * Create a new group
    * @param {*} req req.body = {name: String, username : {type: Array, desc: Array of user in group}}
    * @param {*} res 
    */

    async create(req, res) {
        const { userId, name, usernames = [] } = req.body;


        if (!userId) return res.json({ success: false, message: 'need signin' });

        if (!name) return res.json({ success: false, message: 'bad request' });

        try {

            const foundUser = await userModel.find({ $or: [{ username: { $in: usernames } }, { _id: userId }] }).select('_id');

            const response = await
                GroupModel
                    .create({ name, users: foundUser.map(value => value._id) })
                    .then(group => group.populate({ path: 'users', select: "_id username fullname" }));

            return res.json({ success: true, message: 'successfully', response });
        } catch (err) {
            console.log(`[create group err]`, err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [POST] /api/groups/addMember
     * 
     * @param {*} req : {userId: String, users: Array};
     * @param {*} res 
     * @return add members to group by groupId
     */

    async addMember(req, res) {
        const { userId, users = [], groupId } = req.body;

        if (!userId || !groupId) return res.json({ success: false, message: 'bad request' });
        if (users.length === 0) return res.json({ success: false, message: 'Nhập người dùng chưa đúng' });

        try {
            // Check user in group
            const isUserInGroup = await GroupModel.findOne({ _id: groupId, users: userId, type: { $not: { $regex: /demo/ } } });
            if (!isUserInGroup) return res.json({ success: false, message: 'not allow' });

            // Check added usernames is exist in userModel
            const foundUsernameArr = await userModel.find({ username: { $in: users } }).select('_id');
            if (foundUsernameArr.length === 0) return res.json({ success: false, message: 'Not found usernames' });

            // All good
            const response =
                await GroupModel
                    .findOneAndUpdate(
                        { _id: groupId },
                        { $addToSet: { users: { $each: foundUsernameArr.map(user => user._id) } } },
                        { new: true }
                    ).then(group => group
                        .populate({ path: 'users', select: "_id username fullname" })
                    );

            return res.json({ success: true, message: 'successfully', response });


        } catch (err) {
            console.log(`[GROUP ADD MEMBER ERR]`, err);
        }

    }
}
export default new GroupController;