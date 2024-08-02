import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import path from "path";
import { load_map } from "./map_loader.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyTokenIO, verifyNotLoggedIn } from "./middleware/auth.js";
import { User } from "./models/User.js";
import PlayerWrapper from "./classes/Player.js";
import InputHandler from "./classes/InputHandler.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 5000;
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


mongoose
    .connect(process.env.MONGO_URL, {dbName: "MMO"})
    .then(() => httpServer.listen(PORT, main))
    .catch((err) => console.error(`${err} did not connect`));


const tick = (map, clients, dt) => {
    for(const player_id in clients){
        const {playerWrapper, inputHandler} = clients[player_id];
        playerWrapper.update(inputHandler.inputs, map, dt);
    }
    io.emit("players", PlayerWrapper.players);
}


async function main() {
    console.log(`Listening to ${PORT}`);
    const clients = {};
    const TICK_RATE = 70;
    const map = await load_map();
    const {grid_size, chunk_size, mapWidth, mapHeight, num_layers} = map.metadata;


    io.engine.use(helmet());
    io.use(verifyTokenIO);
    io.use(verifyNotLoggedIn(io));
    io.on("connection", async (socket) => {
        const player_id = socket.player_id;
        socket.join(`${player_id}`);

        const player_db = await User.findById(player_id);
        const player = {
            username: player_db.username, 
            level: player_db.level, 
            coords: {
                x: player_db.x, 
                y: player_db.y},
            height: 16,
            width: 16,
            elevation: player_db.elevation,
            frameX: 0,
            frameY: 0,
            spriteSheet: "8d_player-Sheet.png"
        };
        clients[player_id] = {
            playerWrapper: new PlayerWrapper(player),
            inputHandler: new InputHandler(socket)
        }
        PlayerWrapper.players[player_id] = player;
        const initial_payload = {
            ...map.metadata,
            tilesets: map.tilesets,
            players: PlayerWrapper.players,
            id: player_id
        };
        socket.emit("init", initial_payload);

        socket.on("req_chunks", (chunks) => {
            const requested_chunks = chunks.map(({x,y}) => map.getChunk(x,y));
            const layers = [];
            for(let i=0; i<num_layers; i++){
                let layer = [];
                for(let j=0; j<3; j++){
                    for(let row=0; row < chunk_size; row++){
                        for(let k=0; k<3; k++){
                            const chunk = requested_chunks[j*3 + k][i];
                            if(!chunk){
                                //null indicates an empty row; i.e. 64 empty tiles in a row
                                layer.push(null);
                                continue;
                            }
                            const chunk_row = chunk.slice(row*chunk_size, (row+1)*chunk_size);
                            layer = layer.concat(chunk_row);
                        }
                    }
                }
                layers.push(layer);
            }
            socket.emit("resp_chunks", {layers, layerX: chunks[0].x*grid_size, layerY: chunks[0].y*grid_size});
        });
        socket.on("disconnect", async () => {
            player_db.level = player.level;
            player_db.x = player.coords.x;
            player_db.y = player.coords.y; //prolly fix this in the db
            player_db.elevation = player.elevation;
            await player_db.save();
            delete clients[player_id];
            delete PlayerWrapper.players[player_id];
            console.log("disconnected");
        });
    });
    
    let lastUpdate = Date.now();
    setInterval(() => {
        const now = Date.now();
        const dt = now - lastUpdate;
        tick(map, clients, dt);
        lastUpdate = now;
    }, 1000 / TICK_RATE);
};
