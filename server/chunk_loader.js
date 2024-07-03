import {readFile} from "fs/promises";

export async function load_chunks() {
    try {
        const __dir = './public/assets/game/tilesets';
        const data = await readFile(`${__dir}/map.json`);
        const map = JSON.parse(data);
        const gidToImageMap = map.tilesets
            .map(({firstgid,source}) => ({[firstgid]:source}))
            .reduce((acc, obj) => {
                for (const key in obj) acc[key] = obj[key];
                return acc;
            }, {});
        //assume tile and chunks are square
        const tile_size = map.tileheight;
        const chunk_size = map.layers[0].chunks[0].height;
        const layers = map.layers.map(({chunks}) => chunks.reduce((acc, chunk) => {
                                                                                    if(acc[chunk.x])
                                                                                        acc[chunk.x][chunk.y] = chunk.data;
                                                                                    else
                                                                                        acc[chunk.x] = {[chunk.y]: chunk.data};
                                                                                    return acc;
                                                                                }, {}));
        
       return {tile_size, chunk_size, layers, gidToImageMap};
    } catch(err){
        return console.error(`Error encountered when trying to load chunks: ${err}`);
    }
};
