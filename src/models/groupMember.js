import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupMemberSchema = new Schema({
    groupId: { type: mongoose.Types.ObjectId, ref: 'group', required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'user' },
})

export default mongoose.model('group_member', groupMemberSchema);