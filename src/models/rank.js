import mongoose from "mongoose";

const Schema = mongoose.Schema;

const limitSchema = new Schema({
    rank: { type: Number, required: true, unique: true },
    todoLimit: { type: Number, required: true },
    noteLimit: { type: Number, required: true },
    groupLimit: { type: Number, required: true },
})

export default mongoose.model('rank', limitSchema);