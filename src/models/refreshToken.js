import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, unique: true, ref: 'user' },
        token: { type: String }
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('refresh_token', schema);
