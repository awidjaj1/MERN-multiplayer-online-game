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
const TICK_RATE = 70;
const SPEED = 0.35;
const clients = {};

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
    const {grid_size, chunk_size, mapWidth, mapHeight, getChunk, gidToTilesetMap, specialTiles, num_layers} = await load_chunks();


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
            x: player_db.x, 
            y: player_db.y,
            elevation: player_db.elevation,
            frameX: 0,
            frameY: 0,
            spriteSheet: "8d_player-Sheet.png"
        };
        clients[player_id] = {
            player: new PlayerWrapper(player),
            inputs: new InputHandler(socket)
        }
        PlayerWrapper.players[player_id] = player;
        const initial_payload = {
            grid_size, 
            chunk_size,
            num_layers,
            mapWidth,
            mapHeight, 
            gidToTilesetMap,
            players: PlayerWrapper.players,
            id: player_id
        };
        socket.emit("init", initial_payload);

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
            socket.emit("resp_chunks", {layers, layerX: chunks[0].x*grid_size, layerY: chunks[0].y*grid_size});
        });

        socket.on("disconnect", async () => {
            for(const key in player)
                player_db[key] = player[key];
            await player_db.save();
            delete clients[player_id];
            delete PlayerWrapper.players[player_id];
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
    const get_9x9 = (tile) => {
        const possible_tiles = [];
        for(let scaleX=-1; scaleX<=1; scaleX++){
            for(let scaleY=-1; scaleY<=1; scaleY++){
                possible_tiles.push({x:tile.x + scaleX*grid_size, y:tile.y + scaleY*grid_size});
            }
        }
        return possible_tiles;
    }
    const get_tiles = (x,y, elevation) => {
        const layer_nums = [elevation*2, elevation*2+1];
        const tileX = x / grid_size;
        const tileY = y / grid_size;
        const chunkX = Math.floor(tileX / chunk_size) * chunk_size;
        const chunkY = Math.floor(tileY / chunk_size) * chunk_size;
        const chunk = getChunk(chunkX, chunkY);
        const tiles = layer_nums.map((layer_num) => chunk[layer_num] && chunk[layer_num][chunk_size * (tileY % chunk_size) + (tileX % chunk_size)]);
        return tiles;
    }
    

    const tick = (dt) => {
        for(const player_id in clients){
            const {player, inputs} = clients[player_id];
            const oldX = player.x;
            const oldY = player.y;
            player.update();
            
            
            const tile = {x: Math.floor(player.x/grid_size) * grid_size, y: Math.floor(player.y/grid_size) * grid_size};
            const possible_tiles = get_9x9(tile);
        
            const possible_tiles_ids = possible_tiles.map(({x,y}) => get_tiles(x,y, player.elevation));

            // const attemptedHitboxes = [{x:newX,y:newY,width:grid_size,height:grid_size}];
            // if(verticalScale && horizontalScale)
            //     attemptedHitboxes.push({x:newX,y:player.y,width:grid_size,height:grid_size},
            //         {x:player.x,y:newY,width:grid_size,height:grid_size});
            // newX = player.x;
            // newY = player.y;

            // for(const playerHitbox of attemptedHitboxes){
            //     if(checkCollision(playerHitbox, possible_tiles, possible_tiles_ids)){
            //         newX = playerHitbox.x;
            //         newY = playerHitbox.y;
            //         break;
            //     }
            // }
            // player.x = newX;
            // player.y = newY;
        }
        io.emit("players", PlayerWrapper.players);
    }

    let lastUpdate = Date.now();
    const updateLoop = setInterval(() => {
        const now = Date.now();
        const dt = now - lastUpdate;
        tick(dt);
        lastUpdate = now;
    }, 1000 / TICK_RATE);
};
