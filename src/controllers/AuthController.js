import GroupMemberModel from "../models/groupMember.js";
import InviteModel from "../models/groupInvite.js";
import RankModel from '../models/rank.js';
import UserModel from '../models/user.js';
import argon2 from 'argon2';
import { createToken } from '../cores/handleToken.js';
import mongoose from 'mongoose';

function handleError(err, res) {
    console.log(err);
    return res.json({ success: false, message: 'internal server' })
}
class AuthController {
    async AlwaysChange(req, res) {
        try {

            const response = await UserModel.deleteMany();

            return res.json({ success: true, message: 'success', response });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' })
        }
    }

    /**
     * [GET] /api/auth/first-access
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async firstAccess(req, res) {
        const { userId } = req.body;
        const response = await UserModel.findOne({ _id: userId }).select('-password -createdAt -updatedAt');
        if (!response) return res.json({ success: false, message: 'Người dùng không hợp lệ' })
        return res.json({ success: true, message: 'success', response });
    }

    async get(req, res) {
        try {
            const response = await UserModel.find();

            return res.json({ success: true, message: 'success', response });
        } catch (err) {
            console.log(error);
            return res.json({ success: false, message: 'internal server' })
        }
    }
    /**
     * [POST] /api/auth/register
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async register(req, res) {
        const { fullname, username, password, email } = req.body.data;
        if (!fullname || !username || !password || !email) {
            return res.json({ success: false, message: 'bad request' })
        }
        try {
            const rank = await RankModel.findOne({ rank: 1 });

            if (!rank) {
                return res.json({ success: false, message: 'internal server' })
            }

            const hashedPassword = await argon2.hash(password);
            const newUser = new UserModel({
                rankId: mongoose.Types.ObjectId(rank._id),
                fullname,
                username,
                password: hashedPassword,
                isAdmin: false,
                email
            })

            const response = await UserModel.create(newUser);
            const accessToken = createToken({ userId: newUser.userId, isAdmin: newUser.isAdmin });

            return res.json({
                success: true, message: 'success',
                response: {
                    username: response.username,
                    email: response.email,
                },
                token: accessToken
            })

        } catch (err) {
            console.log(err);
            const code = err.code;
            if (!err.keyPattern) return res.json({ success: false, message: 'internal server' });

            if (code === 11000) {
                if (err.keyPattern.username) {
                    return res.json({ success: false, message: 'Tài khoản đã tồn tại' })
                }
                if (err.keyPattern.email) {
                    return res.json({ success: false, message: 'email đã tồn tại' })
                }
            }
            return res.json({ success: false, message: 'internal server' })
        }
    }

    // [POST] /api/auth/get-invites
    async GetInvites(req, res) {
        const { userId } = req.body;
        try {
            const getInvite = await InviteModel.aggregate([
                {
                    $lookup: {
                        from: "groups",
                        foreignField: "_id",
                        localField: "groupId",
                        as: "group"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "userId",
                        as: "user"
                    }
                },
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $project: {
                        "group.name": 1,
                        "user.username": 1
                    }
                }
            ]);

            const response = getInvite.map(invite => (
                {
                    _id: invite._id,
                    groupName: invite.group[0]?.name,
                    userInvite: invite.user[0]?.username
                }))
            // let response = getInvite;
            return res.json({ success: true, message: 'success', response });
        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' });
        }
    }

    // [POST] /api/auth/accept-invite
    async AcceptInvite(req, res) {
        const { userId, inviteId } = req.body;
        if (!userId) return res.json({ success: false, message: 'Bạn chưa đăng nhập' });
        if (!inviteId) return res.json({ success: false, message: 'bad request' });
        try {
            const inviteResponse = await InviteModel.findOne({ _id: inviteId });
            if (!inviteResponse) return res.json({ success: false, message: 'bad request' });

            const deleteResponse = await InviteModel.deleteOne({ _id: inviteId })
            if (deleteResponse.deletedCount < 1) return res.json({ success: false, message: 'internal server' });
            const response = await GroupMemberModel.create({ userId: inviteResponse.userId, groupId: inviteResponse.groupId });

            if (!response._id) return res.json({ success: false, message: 'internal server' });
            return res.json({ success: true, message: 'success' });

        } catch (err) {
            console.log(err);
            return res.json({ success: false, message: 'internal server' })
        }
    }
    /**
     * [POST] /api/auth/login
     * @param {*} req 
     * @param {*} res 
     */
    async login(req, res) {
        const { username, password } = req.body.data;
        if (!username || !password) return res.json({ success: false, message: 'internal server' });
        try {
            // Find by username
            const foundUser = await UserModel.findOne({ username }).select('-updatedAt -createdAt');
            // Not see username
            if (!foundUser) return res
                .json({ success: false, message: 'Tài khoản hoạc mật khẩu không chính xác' });
            // Compare password
            const isPassword = await argon2.verify(foundUser.password, password);

            // Password is not true
            if (!isPassword) return res
                // .status(404)
                .json({ success: false, message: 'Tài khoản hoạc mật khẩu không chính xác' })

            // Create token
            const accessToken = createToken({ userId: foundUser._id, isAdmin: foundUser.isAdmin });

            // All good
            return res.json(
                {
                    success: true,
                    message: 'successfully',
                    response: { _id: foundUser._id, username: foundUser.username, isAdmin: foundUser.isAdmin, email: foundUser.email, fullName: foundUser.fullName },
                    token: accessToken,
                })

        } catch (err) {
            console.log(`[AUTH LOGIN ERR]`, err);
            return res.status(500).json({ success: false, message: 'internal server' })
        }

    }
}

export default new AuthController