import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import { authRouter } from "./routes/auth";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//logging
app.use(morgan("common"));
//security headers
app.use(helmet());
//for json req
app.use(express.json());
//for form req
app.use(express.urlencoded({limit: "2mb"}));

app.use("/auth", authRouter);

//serve static files from "../client/build"
app.use("/", express.static("../client/build"));




mongoose
    .connect(process.env.MONGO_URL, {dbName: "MMO"})
    .then(() => app.listen(PORT, () => console.log(`Listening to ${PORT}`)))
    .catch((err) => console.error(`${err} did not connect`));