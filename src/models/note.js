import mongoose from "mongoose";

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    name: { type: String },
    from: { type: Date },
    to: { type: Date },
    color: { type: String },
    groupId: { type: mongoose.Types.ObjectId, ref: 'group', required: true },
}, { timestamps: true })

export default mongoose.model('note', noteSchema);