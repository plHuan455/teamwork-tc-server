import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupInviteSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user' },
    groupId: { type: mongoose.Types.ObjectId, required: true, ref: 'group' },
})

export default mongoose.model('group_invite', groupInviteSchema);