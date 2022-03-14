import express from "express";

const PORT = 8080;

const app = express();



app.get('/', (req, res) => {
    res.json({ success: true, message: 'success' });
})


app.listen(PORT, () => { console.log(`Web at localhost:${PORT}`); });