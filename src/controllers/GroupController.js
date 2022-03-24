import { DEMO_GROUP_TYPE } from "../../globalVariables.js";
import GroupInviteModel from "../models/groupInvite.js";
import GroupMemberModel from "../models/groupMember.js";
import GroupModel from "../models/group.js";
import UserModel from "../models/user.js";
import { io } from "../../index.js";
import mongoose from "mongoose";

class GroupController {
    async AlwaysChange(req, res) {
        let response = "";
        try {
            const response = await GroupInviteModel.deleteMany();
            return res.json({ success: true, message: 'successfully', response });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }
    }
    /**
     * [GET] /api/group/get
     * Get all group of user by userId
     * @param {*} req 
     * @param {*} res 
     */
    async Get(req, res) {
        const { userId } = req.body;

        try {
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
                        $or: [{ type: DEMO_GROUP_TYPE }, { "groups.userId": mongoose.Types.ObjectId(userId) }]
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

            return res.json({ success: true, message: 'success', response });

        } catch (err) {
            console.log(`[DOC GET GROUP ERR]`, err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    async GetMember(req, res) {
        const { userId, groupId } = req.body;

        try {
            const isUserInGroup = await GroupMemberModel.findOne({ groupId, userId });
            if (!isUserInGroup) return res.json({ success: false, message: 'Bạn không trong nhóm này' });

            const response = await GroupMemberModel.find({ groupId }).populate({ path: 'userId', select: 'username' }).select('-_id -groupId');

            return res.json({ success: true, message: 'success', response });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    // [DELETE] /api/group/delete-member
    async DeleteMember(req, res) {
        const { userId, groupId, memberId } = req.body;
        if (!userId || !memberId || !groupId || userId === memberId) return res.json({ success: false, message: 'bad request' });

        try {
            const groupResponse = await GroupModel.findOne({ _id: groupId, adminId: userId });
            if (!groupResponse) return res.json({ success: false, message: 'Bạn không có quyền xóa thành viên' });

            const deleteResponse = await GroupMemberModel.deleteOne({ groupId, userId: memberId });
            if (deleteResponse.deletedCount === 0) {
                return res.json({ success: false, message: 'Xóa không thành công' });
            }
            return res.json({ success: true, message: 'success' });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }

    }
    /**
    * [POST] /api/group/create
    * Create a new group
    * @param {*} req req.body = {name: String, username : {type: Array, desc: Array of user in group}}
    * @param {*} res 
    */

    async Create(req, res) {
        const { userId, name } = req.body;
        if (!userId) return res.json({ success: false, message: 'Bạn cần đăng nhập' });

        if (!name) return res.json({ success: false, message: 'bad request' });

        try {
            const userResponse = await UserModel.findOne({ _id: userId }).populate('rankId').select("_id rankId");
            const groupCount = await GroupModel.count({ adminId: userId });
            // if(groupCount )
            if (groupCount >= userResponse.rankId.groupLimit) {
                return res.json({ success: false, message: `Nhóm được tạo đã đạt tối đa (${userResponse.rankId.groupLimit})` })
            }
            // console.log(userResponse);
            if (!userResponse) return res.json({ success: false, message: 'Người dùng không tồn tại' });

            const newGroup = new GroupModel({
                _id: mongoose.Types.ObjectId(),
                name,
                adminId: mongoose.Types.ObjectId(userId),
                type: 'user'
            })
            const newMember = new GroupMemberModel({
                groupId: newGroup._id,
                userId: mongoose.Types.ObjectId(userId),
            })
            const response = await Promise.all([GroupModel.create(newGroup), GroupMemberModel.create(newMember)]);

            // if (!response._id) return res.json({ success: false, message: 'internal server' });
            return res.json({ success: true, message: 'success', response: response[0] });
        } catch (err) {
            console.log(`[create group err]`, err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    /**
     * [DELETE] /api/group/delete
     */
    async Delete(req, res) {
        const { userId, groupId } = req.body;
        if (!userId || !groupId) return res.json({ success: false, message: 'bad request' });


        return res.json({ success: false, message: 'internal server' })
    }

    /**
     * [POST] /api/groups/addMember
     * 
     * @param {*} req : {userId: String, users: Array};
     * @param {*} res 
     * @return add members to group by groupId
     */

    async Invite(req, res) {
        const { userId, groupId, username } = req.body;

        if (!userId || !groupId) return res.json({ success: false, message: 'bad request' });

        try {
            const [foundMember, foundGroup] = await Promise.all([UserModel.findOne({ username }).select("_id"), GroupModel.findOne({ adminId: userId, _id: groupId }).populate('adminId')]);
            if (!foundGroup) return res.json({ success: false, message: 'Bạn không có quyền thêm thành viên' })
            if (!foundMember) return res.json({ success: false, message: 'Không tìm thấy thành viên' })

            const [inviteRes, memberRes] = await Promise.all([
                GroupInviteModel.findOne({ userId: foundMember._id, groupId }),
                GroupMemberModel.findOne({ userId: foundMember._id, groupId })
            ])
            if (memberRes) return res.json({ success: false, message: "Người nay đã trong nhóm" })
            if (inviteRes) return res.json({ success: false, message: 'Bạn đã gửi lời mời đến người này rồi' })

            const response = await GroupInviteModel.create({ groupId, userId: foundMember._id });

            if (!response._id) return res.json({ success: false, message: 'internal server error' });

            const invite = { _id: response._id, userInvite: foundGroup.adminId.username, groupName: foundGroup.name }

            io.emit(`invite:${foundMember._id}`, invite);

            return res.json({ success: true, message: 'success' })
        } catch (err) {
            console.log(`[GROUP INVITE ERR]`, err);
            return res.json({ success: false, message: 'internal server' })
        }

    }

    // [DELETE] /api/group/delete
    async Delete(req, res) {
        const { userId, groupId } = req.body;
        try {
            const deleteGroupResponse = await GroupModel.deleteOne({ adminId: userId, groupId, type: 'user' });
            if (deleteGroupResponse.deletedCount === 0) return res.json({ success: false, message: 'Xóa nhóm thất bại' });
            await GroupMemberModel.deleteMany({ groupId });

            return res.json({ success: true, message: 'success' });
        } catch (err) {
            console.log(err);

            return res.json({ success: false, message: 'internal server' });

        }
    }
}
export default new GroupController;