import mongoose from "mongoose";

async function connect() {
    try {
        await mongoose.connect("mongodb+srv://plhuan:Kelkifa123@cluster0.9asae.mongodb.net/teamword_tc?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Rename the `test` collection to `foobar`
        console.log('[DB CONNECTED]');
    } catch (err) {
        console.log("[DB CONNECT ERR]:" + err);
    }
}

export default { connect }
