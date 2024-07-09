// import { clamp } from "../src/utils"; 
// can't import clamp since this file is not being bundled
// TODO: look into webpack

let chunks;
let players;
let camera = {};
let tile_size;
let chunk_size;
let mapWidth;
let mapHeight;
let gidToTilesetMap;
let id;
let animationFrameId;
let ctx;
let canvas;

function clamp(val, min, max){
    if(val < min) return min;
    else if(val > max) return max;
    return val;
};

onmessage = (e) => {
    switch(e.data.type){
        case "resize":
            canvas.width = e.data.payload.width;
            canvas.height = e.data.payload.height;
            break;
        case "players":
            players = e.data.payload;
            camera.x = clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width);
            camera.y = clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height);
            break;
        case "chunks":
            chunks = e.data.payload;
            break;
        case "canvas":
            canvas = e.data.payload;
            ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.textAlign = "center";
            break;
        case "init":
            players = e.data.payload.players;
            tile_size = e.data.payload.tile_size;
            chunk_size = e.data.payload.chunk_size;
            mapWidth = e.data.payload.mapWidth;
            mapHeight = e.data.payload.mapHeight;
            gidToTilesetMap = e.data.payload.gidToTilesetMap;
            id = e.data.payload.id;
            const __dir = "/server/public/assets/game/tilesets/";
            camera.x = clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width);
            camera.y = clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height);
            const getImageFromGid = (function (){
                const keys = Object.keys(gidToTilesetMap).map((key) => parseInt(key)).sort((a,b) => b - a);
                return (gid) => {
                    //TODO: instead of linear search, can do binary search
                    for (const key of keys) {
                        if (key <= gid) return {firstGid: key, src: gidToTilesetMap[key].src};
                    }
                    return {firstGid: null, src: null};
                }
            })();
            //TODO: maybe eventually delete image references to let GC free up memory?
            const images = {};
            const render = async () => {
                ctx.clearRect(0,0,canvas.width, canvas.height);
                if(chunks){
                    for(let j = 0; j < 9; j++){
                        const {x,y,chunk} = chunks[j];
                        for(const layer of chunk){
                            if(layer){
                                for(let i = 0; i < chunk_size ** 2; i++){
                                    const screenX = x + ((i%chunk_size) * tile_size) - camera.x;
                                    const screenY = y + (Math.floor(i/chunk_size)*tile_size) - camera.y;
                                    if(clamp(screenX, -tile_size, canvas.width) !== screenX || clamp(screenY, -tile_size, canvas.height) !== screenY){
                                        continue;
                                    }
                                    let tile = layer[i];
                                    const {firstGid, src} = getImageFromGid(tile);
                                    if(src !== null){
                                        tile -= firstGid;
                                        const imageRow = Math.floor(tile / gidToTilesetMap[firstGid].columns);
                                        const imageCol = tile % gidToTilesetMap[firstGid].columns;
                                        if(!images[src]){
                                            const blob = await fetch(__dir + src).then(r => r.blob());
                                            const img = await createImageBitmap(blob);
                                            images[src] = img
                                        }
                                        ctx.drawImage(images[src], imageCol * tile_size, imageRow * tile_size, tile_size, tile_size,screenX,screenY, tile_size, tile_size);
                                    }
                                }
                            }
                        }
                    }
                }
                ctx.fillStyle = "black";
                for(const player_id in players){
                    ctx.fillRect((players[player_id].x - camera.x), (players[player_id].y - camera.y), tile_size, tile_size);
                    ctx.fillText(`lvl.${players[player_id].level} ${players[player_id].username}`, 
                        (players[player_id].x - camera.x) + tile_size/2, 
                        (players[player_id].y - camera.y) + tile_size*2)
                }
            }
            const main_loop = () => {
                animationFrameId = requestAnimationFrame(main_loop);
                render();
            }
            animationFrameId = requestAnimationFrame(main_loop);
            break;
        case "terminate":
            cancelAnimationFrame(animationFrameId);
            break;
    }
}

