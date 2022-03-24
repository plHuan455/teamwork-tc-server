import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: { type: String },
    username: { type: String, unique: true, isRequired: true },
    password: { type: String, isRequired: true },
    isAdmin: { type: Boolean, default: false, ref: 'user' },
    email: { type: String, unique: true, isRequired: true },
    rankId: { type: mongoose.Types.ObjectId, ref: 'rank' }
}, { timestamps: true })

export default mongoose.model('user', userSchema);