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
import { User } from "./models/User.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 5000;
const __dirname = import.meta.dirname;
const TICK_RATE = 30;
const SPEED = 10;
const players = {};

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


mongoose
    .connect(process.env.MONGO_URL, {dbName: "MMO"})
    .then(() => httpServer.listen(PORT, main))
    .catch((err) => console.error(`${err} did not connect`));

async function main() {
    console.log(`Listening to ${PORT}`);
    const {tile_size, chunk_size, mapWidth, mapHeight, getChunk, gidToTilesetMap} = await load_chunks();

    io.engine.use(helmet());
    io.use(verifyTokenIO);
    io.use(async (socket, next) => {
        try{
            const sockets = await io.in(`${socket.player_id}`).fetchSockets();
            const isUserConnected = sockets.length > 0;
            if (isUserConnected)
                throw new Error("User is already in game");
            return next();
        }catch(err){
            return next(err);
        }
    })

    io.on("connection", async (socket) => {
        const player_id = socket.player_id;
        socket.join(`${player_id}`);
        const player = await User.findById(player_id);
        players[player_id] = {
            x: player.x, 
            y: player.y, 
            inputs: {
                up: false,
                down: false,
                left: false,
                right: false
            }
        }
        // console.log(player);
        socket.emit("init", 
            {
                tile_size, 
                chunk_size,
                mapWidth,
                mapHeight, 
                gidToTilesetMap,
                player: {
                    username: player.username, 
                    friends: player.friends, 
                    inventory: player.inventory, 
                    equipped: player.equipped,
                    level: player.level, 
                    x: player.x, 
                    y: player.y
                } 
            });

        socket.on("req_chunks", (chunks) => {
            const requested_chunks = chunks.map(({x,y}) => getChunk(x,y));
            socket.emit("resp_chunks", requested_chunks);
        });

        socket.on("keydown", (key) => {
            inputs[key] = true;
        });
        socket.on("keyup", (key)=>{
            if(key === 'all')
                Object.keys(inputs).forEach(key => inputs[key] = false);
            else
                inputs[key] = false;
        })

        socket.on("disconnect", async () => {
            await player.save();
            delete players[player_id];
            console.log("disconnected");
        })

        let lastUpdate = Performance.now();
        setInterval(() => {
            const now = Performance.now();
            const dt = now - lastUpdate;
            tick(dt);
            lastUpdate = now;
        }, 1000 / TICK_RATE);
    });
};

function tick(dt) {
    for(const player_id in players){
        const inputs = players[player_id].inputs;
        let verticalScale = 0;
        let horizontalScale = 0;
        if(inputs.w)
            verticalScale = 1;
        else if(inputs.s)
            verticalScale = -1;

        if(inputs.a)
            horizontalScale = -1;
        else if(inputs.d)
            horizontalScale = 1;
        
        if(verticalScale && horizontalScale){
            players[player_id].x += horizontalScale * SPEED * Math.SQRT1_2;
            players[player_id].y += verticalScale * SPEED * Math.SQRT1_2;
        }else if(verticalScale){
            players[player_id].y += verticalScale * SPEED;
        }else if(horizontalScale){
            players[player_id].x += horizontalScale * SPEED;
        }
    }
}