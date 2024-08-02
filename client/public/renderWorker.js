// import { clamp } from "../src/utils"; 
// can't import clamp since this file is not being bundled
// TODO: look into webpack

const __dir = "/server/public/assets/game/tilesets/";
const DEFAULT_FONT_SIZE = 6;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
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
let zoom = MIN_ZOOM;

function clamp(val, min, max){
    if(val < min) return min;
    else if(val > max) return max;
    return val;
};

onmessage = async (e) => {
    switch(e.data.type){
        case "zoom":
            zoom = clamp(zoom + e.data.payload, MIN_ZOOM, MAX_ZOOM);
            camera.x = Math.round(clamp(zoom*(players[id].coords.x + players[id].width/2) - canvas.width/2,0,mapWidth*zoom - canvas.width));
            camera.y = Math.round(clamp(zoom*(players[id].coords.y + players[id].height/2) - canvas.height/2,0, mapHeight*zoom - canvas.height));
            ctx.font = `${DEFAULT_FONT_SIZE*zoom}px Arial`;
        case "resize":
            //when canvas is resized, context is reset
            canvas.width = e.data.payload.width;
            canvas.height = e.data.payload.height;
            ctx.imageSmoothingEnabled = false;
            ctx.textAlign = "center";
            ctx.fillStyle = "black"; 
            ctx.font = `${DEFAULT_FONT_SIZE*zoom}px Arial`;
            break;
        case "players":
            players = e.data.payload;
            camera.x = Math.round(clamp(zoom*(players[id].coords.x + players[id].width/2) - canvas.width/2,0,mapWidth*zoom - canvas.width));
            camera.y = Math.round(clamp(zoom*(players[id].coords.y + players[id].height/2) - canvas.height/2,0, mapHeight*zoom - canvas.height));
            for(const pid in players){
                const src = players[pid].spriteSheet;
                if(!images[src]){
                    const response = await fetch(__dir + src);
                    const blob = await response.blob();
                    const img = await createImageBitmap(blob);
                    images[src] = img;
                }
            }
            break;
        case "chunks":
            chunks = e.data.payload;
            break;
        case "canvas":
            canvas = e.data.payload;
            ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.font = `${DEFAULT_FONT_SIZE*zoom}px Arial`;
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
            camera.x = Math.round(clamp(zoom*(players[id].coords.x + players[id].width/2) - canvas.width/2,0,mapWidth*zoom - canvas.width));
            camera.y = Math.round(clamp(zoom*(players[id].coords.y + players[id].height/2) - canvas.height/2,0, mapHeight*zoom - canvas.height));
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
        const response = await fetch(__dir + src);
        const blob = await response.blob();
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
        players_to_draw.sort((p1, p2) => players[p2].coords.y - players[p1].coords.y);

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
                //^ only matters for tiles larger than the grid_size
                //but canvas renders the image downwards and right, so we have to offset x,y position to top left corner
                const tile_dx = grid_size - tileWidth;
                const tile_dy = grid_size - tileHeight;
                //x and y canvas draw locations
                const canvasX = (layerX + layer_dx + tile_dx)*zoom - camera.x;
                const canvasY = (layerY + layer_dy + tile_dy)*zoom - camera.y;
                //width and height of drawing on canvas
                const canvasWidth = tileWidth * zoom;
                const canvasHeight = tileHeight * zoom;
                if(clamp(canvasX, -canvasWidth, canvas.width) === canvasX && clamp(canvasY, -canvasHeight, canvas.height) === canvasY)
                    ctx.drawImage(images[src], imageCol * tileWidth, imageRow * tileHeight, 
                        tileWidth, tileHeight,
                        canvasX,canvasY,canvasWidth,canvasHeight);
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
                while(players_to_draw.length && players[players_to_draw.at(-1)].coords.y < layer_dy + layerY){
                    //don't have to worry about the case where you have to draw the player before the first row of tiles
                    //since the first row will always be offscreen anyways
                    const player_id = players_to_draw.pop();
                    const player = players[player_id];
                    const canvasX = player.coords.x*zoom - camera.x;
                    const canvasY = player.coords.y*zoom - camera.y;
                    const canvasWidth = player.width * zoom;
                    const canvasHeight = player.height * zoom;

                    if(clamp(canvasX, -canvasWidth, canvas.width) === canvasX && clamp(canvasY, -canvasHeight, canvas.height) === canvasY){
                        ctx.drawImage(
                            images[player.spriteSheet], 
                            player.frameX * player.width, 
                            player.frameY * player.height, 
                            player.width, player.height,
                            canvasX, 
                            canvasY, 
                            canvasWidth, canvasHeight);
                        ctx.fillText(`lvl.${player.level} ${player.username}`, 
                            canvasX + canvasWidth/2, 
                            canvasY + canvasHeight + DEFAULT_FONT_SIZE*zoom,
                        )
                    }
                }
            }
        }
    
    }
}
