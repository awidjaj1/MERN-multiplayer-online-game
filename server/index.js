import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("common"));

app.use(express.static("../client/build"));

mongoose
    .connect(process.env.MONGO_URL, {dbName: "MMO"})
    .then(() => app.listen(PORT, () => console.log(`Listening to ${PORT}`)))
    .catch((err) => console.error(`${err} did not connect`));