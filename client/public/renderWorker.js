// import { clamp } from "../src/utils"; 
// can't import clamp since this file is not being bundled
// TODO: look into webpack

const __dir = "/server/public/assets/game/tilesets/";
const images = {};
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
let getFirstGid;

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
            ctx.imageSmoothingEnabled = false;
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            break;
        case "players":
            players = e.data.payload;
            camera.x = Math.round(clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width));
            camera.y = Math.round(clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height));
            break;
        case "chunks":
            console.log("loaded new chunks");
            chunks = e.data.payload;
            break;
        case "canvas":
            canvas = e.data.payload;
            ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            break;
        case "init":
            players = e.data.payload.players;
            tile_size = e.data.payload.tile_size;
            chunk_size = e.data.payload.chunk_size;
            mapWidth = e.data.payload.mapWidth;
            mapHeight = e.data.payload.mapHeight;
            gidToTilesetMap = e.data.payload.gidToTilesetMap;
            id = e.data.payload.id;
            camera.x = Math.round(clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width));
            camera.y = Math.round(clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height));
            getFirstGid = (function (){
                const keys = Object.keys(gidToTilesetMap).map((key) => parseInt(key)).sort((a,b) => b - a);
                return (gid) => {
                    //TODO: instead of linear search, can do binary search
                    for (const key of keys) {
                        if (key <= gid) return key;
                    }
                    return null;
                }
            })();

            //TODO: maybe eventually delete image references to let GC free up memory?
            init();

            break;
        case "terminate":
            cancelAnimationFrame(animationFrameId);
            break;
    }
}

async function init () {
    for(const gid in gidToTilesetMap){
        const src = gidToTilesetMap[gid].src;
        const blob = await fetch(__dir + src).then(r => r.blob());
        const img = await createImageBitmap(blob);
        images[src] = img;
    }
    animationFrameId = requestAnimationFrame(main_loop);

}
function main_loop() {
    animationFrameId = requestAnimationFrame(main_loop);
    render();
}
function render() {
    // ctx.clearRect(0,0,canvas.width, canvas.height);
    if(chunks){
        for(let j = 0; j < 9; j++){
            const {x,y,chunk} = chunks[j];
            for(let i = 0; i < chunk_size ** 2; i++){
                const screenX = x + ((i%chunk_size) * tile_size) - camera.x;
                const screenY = y + (Math.floor(i/chunk_size)*tile_size) - camera.y;
                if(clamp(screenX, -tile_size, canvas.width) !== screenX || clamp(screenY, -tile_size, canvas.height) !== screenY){
                    continue;
                }
                for(const k in chunk){
                    const layer = chunk[k];
                    if(layer){
                        let tile = layer[i];
                        const firstGid = getFirstGid(tile);
                        if(firstGid){
                            tile -= firstGid;
                            const imageRow = Math.floor(tile / gidToTilesetMap[firstGid].columns);
                            const imageCol = tile % gidToTilesetMap[firstGid].columns;
                            const src = gidToTilesetMap[firstGid].src;
                            const tileWidth = gidToTilesetMap[firstGid].tileWidth;
                            const tileHeight = gidToTilesetMap[firstGid].tileHeight;
                            //want to place tiles upward and left (to avoid overwriting tiles)
                            //but canvas renders the image downwards and right, so we have to offset y position
                            const offsetY = tile_size - tileHeight; 
                            const offsetX = tile_size - tileWidth;

                            
                            // console.log(gidToTilesetMap[firstGid].tileWidth, gidToTilesetMap[firstGid].tileHeight);
                            ctx.drawImage(images[src], imageCol * tileWidth, imageRow * tileHeight, 
                                tileWidth, tileHeight,
                                screenX + offsetX,screenY + offsetY,tileWidth, tileHeight);
                        }
                    }
                }
            }
        }
    }
    
    for(const player_id in players){
        ctx.fillRect((players[player_id].x - camera.x), (players[player_id].y - camera.y), tile_size, tile_size);
        ctx.fillText(`lvl.${players[player_id].level} ${players[player_id].username}`, 
            (players[player_id].x - camera.x) + tile_size/2, 
            (players[player_id].y - camera.y) + tile_size*2)
    }
}
