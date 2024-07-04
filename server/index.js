import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import path from "path";
import { load_chunks } from "./chunk_loader.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyTokenIO } from "./middleware/auth.js";

dotenv.config();
const app = express();
const __dirname = import.meta.dirname;

//logging
app.use(morgan("common"));
//security headers
app.use(helmet({contentSecurityPolicy: {
    directives: {
        imgSrc: ["'self'", 'data:', 'blob:'], //allow to load images from blobs
    }
}}));
//for json req
app.use(express.json());
// //for form req
// app.use(express.urlencoded({limit: "2mb"}));
// app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
// app.use(cors());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
//serve server-side static assets
app.use("/server/public/assets", express.static("public/assets"));
//serve static files from "../client/build"
app.use(express.static("../client/build"));
//catch all route since we're serving a SPA (for refreshes and manual url input)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});


const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URL, {dbName: "MMO"})
    .then(() => httpServer.listen(PORT, main))
    .catch((err) => console.error(`${err} did not connect`));

async function main() {
    console.log(`Listening to ${PORT}`);
    const {tile_size, chunk_size, getChunk, gidToImageMap} = await load_chunks();
    
    // retrieving the correct image should be done client side?
    // const keys = Object.keys(gidToImageMap).map((key) => parseInt(key)).sort((a,b) => b - a);
    // const getImageFromGid = (gid) => {
    //     for (const key of keys) {
    //         if (key <= gid) return gidToImageMap[key];
    //     }
    // };
    io.engine.use(helmet());
    io.engine.use(verifyTokenIO);

    io.on("connection", (socket) => {
        const user = socket.request.user;
        console.log(user);

        socket.on("disconnect", () => {
            console.log("disconnected");
        })
    });
}