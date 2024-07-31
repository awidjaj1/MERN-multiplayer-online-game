import {readFile} from "fs/promises";

export async function load_chunks() {
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
        };
        return {metadata: {grid_size, chunk_size, mapWidth, mapHeight, num_layers}, getChunk, getFirstGid, get_9x9, get_tiles, tilesets, specialTiles};
    } catch(err){
        return console.error(`Error encountered when trying to load chunks: ${err}`);
    }
};