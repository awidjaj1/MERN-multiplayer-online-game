import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

console.log(process.cwd());

app.use(express.static("../client/build"));

app.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
});