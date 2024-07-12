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
const TICK_RATE = 70;
const SPEED = 0.35;
const players = {};
const inputHandler = {};

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

function isColliding(offsetX, offsetY, rect1, rect2){
    return rect1.x + offsetX < rect2.x + rect2.width &&
        rect1.x + offsetX + rect1.width > rect2.x &&
        rect1.y + offsetY < rect2.y + rect2.height &&
        rect1.y + offsetY + rect1.height > rect2.y;
}

async function main() {
    console.log(`Listening to ${PORT}`);
    const {tile_size, chunk_size, mapWidth, mapHeight, getChunk, gidToTilesetMap, specialTiles} = await load_chunks();

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
            username: player.username, 
            level: player.level, 
            x: player.x, 
            y: player.y
        } 
        inputHandler[player_id] = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        const inputs = inputHandler[player_id];
        socket.emit("init", 
            {
                tile_size, 
                chunk_size,
                mapWidth,
                mapHeight, 
                gidToTilesetMap,
                players,
                id: player_id
            });

        socket.on("req_chunks", (chunks) => {
            const requested_chunks = chunks.map(({x,y}) => {return {x: x*tile_size, y: y*tile_size, chunk: getChunk(x,y)}});
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
        });

        socket.on("disconnect", async () => {
            player.x = players[player_id].x;
            player.y = players[player_id].y;
            await player.save();
            // clearInterval(updateLoop);
            delete players[player_id];
            console.log("disconnected");
        });
    });

    const tick = (dt) => {
        for(const player_id in players){
            const player = players[player_id];
            const prevX = player.x;
            const prevY = player.y;
    
            const inputs = inputHandler[player_id];
            let verticalScale = 0;
            let horizontalScale = 0;
            if(inputs.w)
                verticalScale = -dt;
            else if(inputs.s)
                verticalScale = dt;
    
            if(inputs.a)
                horizontalScale = -dt;
            else if(inputs.d)
                horizontalScale = dt;
            
            if(verticalScale && horizontalScale){
                player.x += Math.round(horizontalScale * SPEED * Math.SQRT1_2);
                player.y += Math.round(verticalScale * SPEED * Math.SQRT1_2);
            }else if(verticalScale){
                player.y += Math.round(verticalScale * SPEED);
            }else if(horizontalScale){
                player.x += Math.round(horizontalScale * SPEED);
            }
            
            const playerHitbox = {x: player.x, y: player.y, width: tile_size, height: tile_size};
            const tile = {x: Math.floor(player.x/tile_size) * tile_size, y: Math.floor(player.y/tile_size) * tile_size};
            const chunkX = Math.floor(tile.x/(chunk_size*tile_size)) * chunk_size;
            const chunkY = Math.floor(tile.y/(chunk_size*tile_size)) * chunk_size;
            const chunk = getChunk(chunkX, chunkY);
            const tileX = (tile.x - chunkX * tile_size) / tile_size;
            const tileY = (tile.y - chunkY * tile_size) / tile_size;
            const possible_tiles = chunk.map((layer) => {
                if(!layer) return null;
                return [
                    {gid:layer[tileY * chunk_size + tileX], x: tile.x, y: tile.y}, {gid:layer[tileY * chunk_size + tileX + 1], x:tile.x+tile_size, y:tile.y},
                    {gid:layer[(tileY + 1)*chunk_size + tileX], x:tile.x, y:tile.y+tile_size}, {gid:layer[(tileY + 1)*chunk_size + tileX + 1], x:tile.x+tile_size, y:tile.y+tile_size}
                ];
            });

            for(const layer of possible_tiles){
                if(!layer)
                    continue;
                for(const possible_tile of layer){
                    if(specialTiles[possible_tile.gid]){
                        if(specialTiles[possible_tile.gid].some((special_tile) => isColliding(possible_tile.x, possible_tile.y, special_tile.hitbox, playerHitbox))){
                            player.x = prevX;
                            player.y = prevY;
                            return;
                        }
                    }
                }
            }
        }
        io.emit("players", players);
    }

    let lastUpdate = Date.now();
    const updateLoop = setInterval(() => {
        const now = Date.now();
        const dt = now - lastUpdate;
        tick(dt);
        lastUpdate = now;
    }, 1000 / TICK_RATE);
};
