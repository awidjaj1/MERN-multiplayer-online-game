import tmx from "tmx-parser";

async function load_chunks() {
    const map = await new Promise((res, rej) => {
        tmx.parseFile("./public/assets/game/tilesets/map.tmx", (err, map) => {
            if(err) return rej(err);
            return res(map);
        })
    });
    console.log(map);
    console.log("********************************************************");
    console.log(map.layers[0].tiles);
};

load_chunks();