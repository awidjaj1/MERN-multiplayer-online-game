import {readFile} from "fs/promises";
import { State } from "./classes/State.js";

export async function load_map() {
    try {
        const __dir = './public/assets/game/tilesets';
        const data = await readFile(`${__dir}/map_demo.json`);
        const map = JSON.parse(data);

        //assume tile and chunks are square
        const grid_size = map.tileheight;
        const mapWidth = map.width * grid_size;
        const mapHeight = map.height * grid_size;
        const chunk_size = map.editorsettings.chunksize.height;
        const num_layers = map.layers.length; 
        const layers = map.layers.map(({chunks}) => 
            chunks.reduce((acc, chunk) => {
                if(acc[chunk.x])
                    acc[chunk.x][chunk.y] = chunk.data;
                else
                    acc[chunk.x] = {[chunk.y]: chunk.data};
                return acc;
            }, {}));
        const {tilesets, specialTiles} = (await Promise.all(map.tilesets.map(async ({firstgid, source}) => {
            const data = await readFile(`${__dir}/${source}`);
            const tileset = JSON.parse(data);
            const tiles = tileset.tiles.map((tile) => {
                let hitboxes = null;
                if (tile.objectgroup){
                    hitboxes = tile.objectgroup.objects.map(({x, y, width, height, properties}) => {
                            const new_properties = (properties && 
                                properties.reduce((acc, prop) => {
                                    acc[prop.name] = prop.value;
                                    return acc;
                                }, {})) || {};
                            const hitbox = {x, y, width, height}
                            return { hitbox , properties: new_properties}
                        });
                }
                return {gid: tile.id + firstgid, hitboxes}
            }).reduce((acc, tile) => {
                if(tile.hitboxes)
                    acc[tile.gid] = tile.hitboxes;
                return acc;
            }, {});
            return {firstgid, src: tileset.image, specialTiles: tiles, columns: tileset.columns, tileHeight: tileset.tileheight, tileWidth: tileset.tilewidth};
        }))).reduce((acc, {firstgid, src, specialTiles, columns, tileHeight, tileWidth}) => {
            acc.tilesets[firstgid] = {src, columns, tileHeight, tileWidth};
            Object.assign(acc.specialTiles, specialTiles);
            return acc;
        }, {tilesets: {}, specialTiles: {}});
    
        const getChunk = (function  (){
            const chunks = {}
            return (x,y) => {
                if(chunks[x] === undefined)
                    chunks[x] = {};
                if(chunks[x][y] === undefined)
                    chunks[x][y] = layers.map((layer) => (layer[x] && layer[x][y]) || null);
                return chunks[x][y];
            };
        })();

    

        const checkCollisionStatic = (function (){
            const AABB_Colliding = (rect1, rect2) => {
                return rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y;
            } 
            const get_direction = (axis, value) => {
                if(axis === 'x')
                    return value > 0? 'e': 'w';
                else
                    return value > 0? 's': 'n';   
            }

            const getFirstGid = (function (){
                const keys = Object.keys(tilesets).map((key) => parseInt(key)).sort((a,b) => b - a);
                return (gid) => {
                    //TODO: instead of linear search, can do binary search
                    for (const key of keys) {
                        if (key <= gid) return key;
                    }
                    return null;
                }
            })();

            //we look at collisions to the bottom right since the tile provided is the tile containing the top left corner
            //of the entity's hitbox, kinda hacky way to get tiles cause collision hitbox may span larger than the tile/grid itself
            //so we have to check further out
            const get_4x4 = (tile) => {
                const possible_tiles = [];
                for(let scaleX=0; scaleX<=3; scaleX++){
                    for(let scaleY=0; scaleY<=3; scaleY++){
                        possible_tiles.push({x:tile.x + scaleX*grid_size, y:tile.y + scaleY*grid_size});
                    }
                }
                return possible_tiles;
            }
            
            //get relevant tiles relating to collision at (x,y)
            const get_tiles = (x,y, elevation) => {
                const layer_nums = [elevation*2, elevation*2+1];
                const tileX = x / grid_size;
                const tileY = y / grid_size;
                const chunkX = Math.floor(tileX / chunk_size) * chunk_size;
                const chunkY = Math.floor(tileY / chunk_size) * chunk_size;
                const chunk = getChunk(chunkX, chunkY);
                const tiles = layer_nums.map((layer_num) => chunk[layer_num] && chunk[layer_num][chunk_size * (tileY % chunk_size) + (tileX % chunk_size)]);
                return tiles;
            };

            return (playerWrapper, axis) => {
                Object.keys(playerWrapper.context).forEach((key) => playerWrapper.context[key] = false);
                const direction = get_direction(axis, playerWrapper.velocity[axis])
                const gridHitbox = {x:0,y:0,width:grid_size,height:grid_size};
                const playerStaticHitbox = {
                    x: playerWrapper.entity.coords.x + playerWrapper.staticHitboxOffset.w, 
                    y: playerWrapper.entity.coords.y + playerWrapper.staticHitboxOffset.n, 
                    width: playerWrapper.entity.width  - playerWrapper.staticHitboxOffset.w + playerWrapper.staticHitboxOffset.e, 
                    height: playerWrapper.entity.height - playerWrapper.staticHitboxOffset.n + playerWrapper.staticHitboxOffset.s
                };
                const tile = {x: Math.floor(playerStaticHitbox.x/grid_size) * grid_size, y: Math.floor(playerStaticHitbox.y/grid_size) * grid_size};
                const possible_tiles = get_4x4(tile);
                const possible_tiles_ids = possible_tiles.map(({x,y}) => get_tiles(x,y, playerWrapper.entity.elevation));
            
                //only one direction at a time, even for diagonal (i.e. we move in an L shape). This could make
                //the character move around an object when moving diagonally, but it shouldn't be an issue if the
                //movement steps are small enough
                
                //IF WE COLLIDE WITH A HITBOX CONSIDER THE FOLLOWING:
                //if direction is north, want to get the maximum y-coordinate (given by hitbox.y + hitbox.height)
                //else if direction is east, want to get the minimum x-coordinate (given by hitbox.x)
                //else if direction is south, want to get the minimum y-coordinate (given by hitbox.y)
                //else if direction is west, want to get the maximum x-coordinate (given by hitbox.x + hitbox.width)
                let extract_coord = null;
                let coord = null;
            
                let measure = Math.min;
                let nw = false;
                if(direction === 'n' || direction === 'w'){
                    measure = Math.max;
                    nw = true;
                }
                //note that the coordinate is the topleft corner of the player, so need to shift 
                //according to dimensions of the player if coming from se
                if(direction === 'n' || direction === 's'){
                    extract_coord = (hitbox) => hitbox.y + nw*hitbox.height - !nw*playerWrapper.entity.height - playerWrapper.staticHitboxOffset[direction];
                }else{
                    extract_coord = (hitbox) => hitbox.x + nw*hitbox.width - !nw*playerWrapper.entity.width - playerWrapper.staticHitboxOffset[direction];
                }
            
                for(const i in possible_tiles){
                    const {x,y} = possible_tiles[i];
                    const [ground_id, object_id] = possible_tiles_ids[i];
            
                    const groundHitbox = {...gridHitbox, x:gridHitbox.x + x, y: gridHitbox.y + y};
                    
                    //check there is floor below player's feet
                    if(AABB_Colliding(groundHitbox, playerStaticHitbox) && !ground_id){
                        coord = measure(extract_coord(groundHitbox), coord || extract_coord(groundHitbox));
                    }
                    
                    //check for ground elevation hitboxes
                    if(specialTiles[ground_id]){
                        const gid = getFirstGid(ground_id);
                        const tileWidth = tilesets[gid].tileWidth;
                        const tileHeight = tilesets[gid].tileHeight;
                        const offsetX = grid_size - tileWidth;
                        const offsetY = grid_size - tileHeight;
            
                        specialTiles[ground_id].forEach(({hitbox, properties}) => {
                            const tileHitbox = {...hitbox, x:hitbox.x + x + offsetX, y:hitbox.y + y + offsetY};
                            if(AABB_Colliding(tileHitbox, playerStaticHitbox)){
                                if(properties.type === "collision" && !playerWrapper.elevated){
                                    coord = measure(extract_coord(tileHitbox), coord || extract_coord(tileHitbox));
                                }else if(properties.type === "elevated"){
                                    playerWrapper.context.near_elevation = true;
                                }else if(properties.type === "ladder"){
                                    const playerCenter = playerStaticHitbox.x + playerStaticHitbox.width/2;
                                    const ladderCenter = tileHitbox.x + tileHitbox.width/2;
                                    if(Math.abs(playerCenter - ladderCenter) < grid_size/8){
                                        playerWrapper.context.near_ladder = true;
                                        playerWrapper.context.near_elevation = true;
                                    }
                                }else if(properties.type === "climb_down"
                                    && playerWrapper.currentState.state === State.STATES.CLIMB_S){
                                    playerWrapper.entity.elevation--;
                                }
                            }
                        })
                    }

                    //check for object elevation hitboxes
                    if(specialTiles[object_id]){
                        const gid = getFirstGid(object_id);
                        const tileWidth = tilesets[gid].tileWidth;
                        const tileHeight = tilesets[gid].tileHeight;
                        const offsetX = grid_size - tileWidth;
                        const offsetY = grid_size - tileHeight;
                        for(const {hitbox, properties} of specialTiles[object_id]){
                            const tileHitbox = {...hitbox, x:hitbox.x + x + offsetX, y:hitbox.y + y + offsetY};
            
                            if(AABB_Colliding(tileHitbox, playerStaticHitbox)){
                                if(properties.type === "collision"){
                                    coord = measure(extract_coord(tileHitbox), coord || extract_coord(tileHitbox));
                                }else if(properties.type === "elevated"){
                                    playerWrapper.context.near_elevation = true;
                                }else if(properties.type === "ladder"){
                                    const playerCenter = playerStaticHitbox.x + playerStaticHitbox.width/2;
                                    const ladderCenter = tileHitbox.x + tileHitbox.width/2;
                                    if(Math.abs(playerCenter - ladderCenter) < grid_size/8){
                                        playerWrapper.context.near_ladder = true;
                                        playerWrapper.context.near_elevation = true;
                                    }
                                }else if(properties.type === "climb_up" 
                                    && playerWrapper.currentState.state === State.STATES.CLIMB_N){
                                    playerWrapper.entity.elevation++;
                                }
                            }
                        }
                    }
                }
                
                //keep track of elevated context for next collision detection
                // if(!(coord && !playerWrapper.context.near_elevation && playerWrapper.elevated)){
                //this is finnicky cause what if the player moves off of elevation
                playerWrapper.elevated = playerWrapper.context.near_elevation;
                
                return coord;
            }
        })();
        
        


        return {
                metadata: {grid_size, chunk_size, mapWidth, mapHeight, num_layers}, 
                collision: {checkCollisionStatic}, 
                getChunk, tilesets, specialTiles
            };
    } catch(err){
        return console.error(`Error encountered when trying to load chunks: ${err}`);
    }
};