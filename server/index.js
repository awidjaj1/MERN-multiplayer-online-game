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


async function main() {
    console.log(`Listening to ${PORT}`);
    const {tile_size, chunk_size, mapWidth, mapHeight, getChunk, gidToTilesetMap, specialTiles, num_layers} = await load_chunks();


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
            y: player.y,
            elevation: 0,
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
                num_layers,
                mapWidth,
                mapHeight, 
                gidToTilesetMap,
                players,
                id: player_id
            });

        socket.on("req_chunks", (chunks) => {
            const requested_chunks = chunks.map(({x,y}) => getChunk(x,y));
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
            socket.emit("resp_chunks", {layers, layerX: chunks[0].x*tile_size, layerY: chunks[0].y*tile_size});
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
    const getFirstGid = (function (){
        const keys = Object.keys(gidToTilesetMap).map((key) => parseInt(key)).sort((a,b) => b - a);
        return (gid) => {
            //TODO: instead of linear search, can do binary search
            for (const key of keys) {
                if (key <= gid) return key;
            }
            return null;
        }
    })();
    const get_tiles = (x,y, elevation) => {
        const layer_nums = [elevation*2, elevation*2+1];
        const tileX = x / tile_size;
        const tileY = y / tile_size;
        const chunkX = Math.floor(tileX / chunk_size) * chunk_size;
        const chunkY = Math.floor(tileY / chunk_size) * chunk_size;
        const chunk = getChunk(chunkX, chunkY);
        const tiles = layer_nums.map((layer_num) => chunk[layer_num] && chunk[layer_num][chunk_size * (tileY % chunk_size) + (tileX % chunk_size)]);
        return tiles;
    }
    function isColliding(offsetX, offsetY, rect1, rect2){
        return rect1.x + offsetX < rect2.x + rect2.width &&
            rect1.x + offsetX + rect1.width > rect2.x &&
            rect1.y + offsetY < rect2.y + rect2.height &&
            rect1.y + offsetY + rect1.height > rect2.y;
    }
    const checkCollision = (playerHitbox, possible_tiles, possible_tiles_ids) => {
        const ground_tile_hitbox = {x:0,y:0,width:tile_size,height:tile_size};
        for(const i in possible_tiles){
            const {x,y} = possible_tiles[i];
            const [ground_id, object_id] = possible_tiles_ids[i];
            if(isColliding(x, y, ground_tile_hitbox, playerHitbox) && !ground_id){
                return false;
            }
            if(specialTiles[ground_id]){
                //tiled gives hitbox coordinates relative to top left corner, but we render based on bottom right corner
                if(specialTiles[ground_id].some(({hitbox}) => isColliding(x,y,hitbox, playerHitbox))){
                    return false;
                }
            }
            if(specialTiles[object_id]){
                const gid = getFirstGid(object_id);
                const tileWidth = gidToTilesetMap[gid].tileWidth;
                const tileHeight = gidToTilesetMap[gid].tileHeight;
                const offsetX = tile_size - tileWidth;
                const offsetY = tile_size - tileHeight;
                //tiled gives hitbox coordinates relative to top left corner, but we render based on bottom right corner
                if(specialTiles[object_id].some(({hitbox}) => isColliding(x + offsetX,y + offsetY,hitbox, playerHitbox))){
                    return false;
                }
            }
        }
        return true;
    }

    const tick = (dt) => {
        for(const player_id in players){
            const player = players[player_id];
            let newX = player.x;
            let newY = player.y;

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
                newX += Math.round(horizontalScale * SPEED * Math.SQRT1_2);
                newY += Math.round(verticalScale * SPEED * Math.SQRT1_2);
            }else{
                newY += Math.round(verticalScale * SPEED);
                newX += Math.round(horizontalScale * SPEED);
            }
            
            const tile = {x: Math.floor(newX/tile_size) * tile_size, y: Math.floor(newY/tile_size) * tile_size};
            const possible_tiles = [];
            for(let scaleX=-1; scaleX<=1; scaleX++){
                for(let scaleY=-1; scaleY<=1; scaleY++){
                    possible_tiles.push({x:tile.x + scaleX*tile_size, y:tile.y + scaleY*tile_size});
                }
            }
            const possible_tiles_ids = possible_tiles.map(({x,y}) => get_tiles(x,y, player.elevation));
            const attemptedHitboxes = [{x:newX,y:newY,width:tile_size,height:tile_size}];
            if(verticalScale && horizontalScale)
                attemptedHitboxes.push({x:newX,y:player.y,width:tile_size,height:tile_size},
                    {x:player.x,y:newY,width:tile_size,height:tile_size});
            newX = player.x;
            newY = player.y;

            for(const playerHitbox of attemptedHitboxes){
                if(checkCollision(playerHitbox, possible_tiles, possible_tiles_ids)){
                    newX = playerHitbox.x;
                    newY = playerHitbox.y;
                    break;
                }
            }
            player.x = newX;
            player.y = newY;
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
