import mongoose from "mongoose";

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
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
