import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
    {
        name: { type: String },
        adminId: { type: Schema.Types.ObjectId, ref: 'user' },
        type: { type: String, default: 'user' }
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('group', groupSchema);
