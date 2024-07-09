onmessage = (e) => {
    if(e.data.type === 'player'){
        console.log(Date.now());
    }
}

// let animationFrameId;
// const ctx = canvas.getContext('2d');
// ctx.imageSmoothingEnabled = false;
// const __dir = "/server/public/assets/game/tilesets/";
// const camera = {x: clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width), 
//     y: clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height) };
// const getImageFromGid = (function (){
//     const keys = Object.keys(gidToTilesetMap).map((key) => parseInt(key)).sort((a,b) => b - a);
//     return (gid) => {
//         //TODO: instead of linear search, can do binary search
//         for (const key of keys) {
//             if (key <= gid) return {firstGid: key, src: gidToTilesetMap[key].src};
//         }
//         return {firstGid: null, src: null};
//     }
// })();
// //TODO: maybe eventually delete image references to let GC free up memory?
// const images = {};
// const render = () => {
//     ctx.clearRect(0,0,canvas.width, canvas.height);
//     if(chunks){
//         for(let j = 0; j < 9; j++){
//             let {x,y} = visible_chunks[j];
//             x *= tile_size;
//             y *= tile_size;
//             const chunk = chunks[j];
//             for(const layer of chunk){
//                 if(layer){
//                     for(let i = 0; i < chunk_size ** 2; i++){
//                         const screenX = x + ((i%chunk_size) * tile_size) - camera.x;
//                         const screenY = y + (Math.floor(i/chunk_size)*tile_size) - camera.y;
//                         if(clamp(screenX, -tile_size, canvas.width) !== screenX || clamp(screenY, -tile_size, canvas.height) !== screenY){
//                             continue;
//                         }
//                         let tile = layer[i];
//                         const {firstGid, src} = getImageFromGid(tile);
//                         if(src !== null){
//                             tile -= firstGid;
//                             const imageRow = Math.floor(tile / gidToTilesetMap[firstGid].columns);
//                             const imageCol = tile % gidToTilesetMap[firstGid].columns;
//                             if(!images[src]){
//                                 images[src] = new Image();
//                                 images[src].src = __dir + src;
//                             }
//                             const image = images[src]
//                             ctx.drawImage(image, imageCol * tile_size, imageRow * tile_size, tile_size, tile_size,screenX,screenY, tile_size, tile_size);
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     ctx.fillStyle = "black";
//     for(const player_id in players){
//         ctx.fillRect((players[player_id].x - camera.x), (players[player_id].y - camera.y), 16, 16);
//     }
// }
// const main_loop = () => {
//     animationFrameId = requestAnimationFrame(main_loop);
//     render();
// }
// animationFrameId = requestAnimationFrame(main_loop);

// window.cancelAnimationFrame(animationFrameId);