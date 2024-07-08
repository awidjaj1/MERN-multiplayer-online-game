import {readFile} from "fs/promises";

export async function load_chunks() {
    try {
        const __dir = './public/assets/game/tilesets';
        const data = await readFile(`${__dir}/map_demo.json`);
        const map = JSON.parse(data);

        //assume tile and chunks are square
        const tile_size = map.tileheight;
        const mapWidth = map.width * tile_size;
        const mapHeight = map.height * tile_size;
        const chunk_size = map.layers[0].chunks[0].height;
        const layers = map.layers.map(({chunks}) => 
            chunks.reduce((acc, chunk) => {
                if(acc[chunk.x])
                    acc[chunk.x][chunk.y] = chunk.data;
                else
                    acc[chunk.x] = {[chunk.y]: chunk.data};
                return acc;
            }, {}));
        const gidToTilesetMap = (await Promise.all(map.tilesets.map(async ({firstgid, source}) => {
            const data = await readFile(`${__dir}/${source}`);
            const tileset = JSON.parse(data);
            const tiles = tileset.tiles.map((tile) => {
                let hitboxes = null;
                if (tile.objectgroup){
                    hitboxes = tile.objectgroup.objects.map(({polygon, x, y, properties}) => {
                            const new_polygon = polygon.map(({x:poly_x, y:poly_y}) => {return {x: poly_x + x, y: poly_y + y}})
                            const new_properties = (properties && 
                                properties.reduce((acc, prop) => {
                                    acc[prop.name] = prop.value;
                                    return acc;
                                }, {})) || {};
                            return { polygon: new_polygon, properties: new_properties}
                        });
                }
                return {id: tile.id, hitboxes}
            }).reduce((acc, tile) => {
                if(tile.hitboxes)
                    acc[tile.id] = tile.hitboxes;
                return acc;
            }, {});
            return {firstgid, src: tileset.image, hitboxes: tiles, columns: tileset.columns};
        }))).reduce((acc, {firstgid, src, hitboxes, columns}) => {
            acc[firstgid] = {src, hitboxes, columns};
            return acc;
        }, {});
    
        const getChunk = (function  (){
            const chunks = {}
            return (x,y) => {
                if(chunks[x] === undefined)
                    chunks[x] = {}
                if(chunks[x][y] === undefined)
                    chunks[x][y] = layers.map((layer) => (layer[x] && layer[x][y]) || null);
                return chunks[x][y];
            };
        })();
        return {tile_size, chunk_size, mapWidth, mapHeight, getChunk, gidToTilesetMap};
    } catch(err){
        return console.error(`Error encountered when trying to load chunks: ${err}`);
    }
};