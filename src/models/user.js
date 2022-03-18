import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: { type: String },
    username: { type: String, unique: true, isRequired: true },
    password: { type: String, isRequired: true },
    isAdmin: { type: Boolean, default: false },
    email: { type: String, unique: true, isRequired: true }
}, { timestamps: true })

export default mongoose.model('user', userSchema);