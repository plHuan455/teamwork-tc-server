import mongoose from "mongoose";

const Schema = mongoose.Schema;

const noteTodo = new Schema({
    noteId: { type: mongoose.Types.ObjectId, ref: 'note', required: true },
    name: { type: String, required: true },
    state: { type: Boolean, default: false },
})

export default mongoose.model('note_todo', noteTodo);