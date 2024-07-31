// import { clamp } from "../src/utils"; 
// can't import clamp since this file is not being bundled
// TODO: look into webpack

const __dir = "/server/public/assets/game/tilesets/";
const images = {};
let chunks;
let players;
let camera = {};
let grid_size;
let chunk_size;
let num_layers;
let mapWidth;
let mapHeight;
let tilesets;
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
            grid_size = e.data.payload.grid_size;
            chunk_size = e.data.payload.chunk_size;
            num_layers = e.data.payload.num_layers;
            mapWidth = e.data.payload.mapWidth;
            mapHeight = e.data.payload.mapHeight;
            tilesets = e.data.payload.tilesets;
            id = e.data.payload.id;
            camera.x = Math.round(clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width));
            camera.y = Math.round(clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height));
            getFirstGid = (function (){
                const keys = Object.keys(tilesets).map((key) => parseInt(key)).sort((a,b) => b - a);
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
    for(const gid in tilesets){
        const src = tilesets[gid].src;
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
    const player_ids = Object.keys(players);
    player_ids.sort((p1, p2) => players[p2].elevation - players[p1].elevation);
    if(!chunks)
        return;

    const {layerX,layerY,layers} = chunks;
    for(let layer_num = 0; layer_num < num_layers; layer_num++){
        const layer = layers[layer_num];
        const elevation = (layer_num - 1) / 2;
        const players_to_draw = [];

        //doesnt matter if the player belongs to this chunk or not
        while(player_ids.length && players[player_ids.at(-1)].elevation === elevation){
            players_to_draw.push(player_ids.pop());
        }
        players_to_draw.sort((p1, p2) => players[p2].y - players[p1].y);

        let layer_dx = 0;
        let layer_dy = 0;
        for(let tile of layer){
            if(tile){
                const firstGid = getFirstGid(tile);
                tile -= firstGid;
                const imageRow = Math.floor(tile / tilesets[firstGid].columns);
                const imageCol = tile % tilesets[firstGid].columns;
                const src = tilesets[firstGid].src;
                const tileWidth = tilesets[firstGid].tileWidth;
                const tileHeight = tilesets[firstGid].tileHeight;

                    
                //want to place tiles upward and left--so according to bottom right corner (to avoid overwriting tiles and cause thats how we configured it in Tiled)
                //^ only matters for tiles larger than the grid_size (rn is named grid_size, will rename later)
                //but canvas renders the image downwards and right, so we have to offset x,y position to top left corner
                const tile_dx = grid_size - tileWidth;
                const tile_dy = grid_size - tileHeight;
                const canvasX = layerX + layer_dx + tile_dx - camera.x;
                const canvasY = layerY + layer_dy + tile_dy - camera.y;
                if(clamp(canvasX, -tileWidth, canvas.width) === canvasX && clamp(canvasY, -tileHeight, canvas.height) === canvasY)
                    ctx.drawImage(images[src], imageCol * tileWidth, imageRow * tileHeight, 
                        tileWidth, tileHeight,
                        canvasX,canvasY,tileWidth, tileHeight);
            }

            //a null tile indicates a chunk_sized row of empty tiles
            if(tile === null)
                layer_dx += grid_size * chunk_size;
            else
                layer_dx += grid_size;

            if(!(layer_dx % (grid_size * chunk_size * 3))){
                //check if we move onto next row of layer
                layer_dx = 0;
                layer_dy += grid_size;
                //TODO: only draw when player in camera
                while(players_to_draw.length && players[players_to_draw.at(-1)].y < layer_dy + layerY){
                    //don't have to worry about the case where you have to draw the player before the first row of tiles
                    //since the first row will always be offscreen anyways
                   const player_id = players_to_draw.pop();
                   ctx.fillRect((players[player_id].x - camera.x), (players[player_id].y - camera.y) - 0.5*grid_size, grid_size, 1.5*grid_size);
                    ctx.fillText(`lvl.${players[player_id].level} ${players[player_id].username}`, 
                        (players[player_id].x - camera.x) + grid_size/2, 
                        (players[player_id].y - camera.y) + grid_size*2)
                }
            }
        }
    
    }
}
