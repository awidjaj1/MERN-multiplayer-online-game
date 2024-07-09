import { Box, paperClasses } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../utils";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Debugger } from "../../components/Debugger";
export const GamePage = () => {
    const MAX_CANVAS_SIZE = {width: 1600, height: 900};
    const MIN_CANVAS_SIZE = {width: 800, height: 450};
    const ZOOM = 2;
    const socketRef = useRef(null);
    const canvasRef = useRef(null);
    const token = useSelector((state) => state.token);
    const navigate = useNavigate();
    const [screenSize, setScreenSize] = useState(
                            {width: clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width), 
                            height: clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)});

    useEffect(() => {
        const handleResize = () => setScreenSize(
                                    {width: clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width), 
                                    height: clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)});
        window.addEventListener('resize', handleResize, true);

        socketRef.current = io({
            auth: {
                token
            }
        });
        const handleInput = (function (event){
            const validInput = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
            return (e) => {
                if(!e.repeat && validInput.includes(e.key)){
                    socketRef.current.emit(event, e.key.toLowerCase());
                }
            }
        });
        const handleBlur = ()=>{
            socketRef.current.emit("keyup", "all");
        };
        const handleKeydown = handleInput('keydown');
        const handleKeyup = handleInput('keyup');
        //TODO: implement custom right click where you can right click on users in the game to see more info
        const handleRightClick = (e) => {
            socketRef.current.emit("keyup", "all");
        }
        window.addEventListener('keydown', handleKeydown, true);
        window.addEventListener('keyup', handleKeyup, true);
        window.addEventListener('blur', handleBlur, true);
        window.addEventListener('contextmenu', handleRightClick, true);

        socketRef.current.on('connect_error', (err) => {
            window.alert(`There was an error starting the game. ${err}`);
            navigate("/home");
        });

        const canvas = canvasRef.current;
        let animationFrameId;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        socketRef.current.on("init", ({
                                        tile_size, 
                                        chunk_size,
                                        mapWidth,
                                        mapHeight, 
                                        gidToTilesetMap,
                                        players,
                                        id
                                    }) => {
            const __dir = "/server/public/assets/game/tilesets/";
            const camera = {x: clamp(players[id].x - canvas.width/2,0,mapWidth - canvas.width), y: clamp(players[id].y - canvas.height/2,0, mapHeight - canvas.height) };
            const current_chunk = {x: parseInt(players[id].x / (tile_size * chunk_size)) * chunk_size, y: parseInt(players[id].y / (tile_size *chunk_size)) * chunk_size}
            let chunks = null;
            const get_visible_chunks = (current_chunk) => {
                
                const chunks = [];
                for(let scaleX=-1; scaleX <= 1; scaleX++){
                    for(let scaleY=-1; scaleY <= 1; scaleY++){
                        chunks.push({x: current_chunk.x + scaleX * chunk_size,
                                    y: current_chunk.y + scaleY * chunk_size});
                    }
                }
                return chunks
            }
            const visible_chunks = get_visible_chunks(current_chunk);
            socketRef.current.emit("req_chunks", visible_chunks);
            socketRef.current.on("resp_chunks", (requested_chunks) => {
                chunks = requested_chunks;
            });
            socketRef.current.on("players", (updated_players) => {
                console.log(Date.now());
                players = updated_players;
                //TODO: dont just replace? maybe can be costly if more players
            })
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
            const render = () => {
                ctx.clearRect(0,0,canvas.width, canvas.height);
                if(chunks){
                    for(let j = 0; j < 9; j++){
                        let {x,y} = visible_chunks[j];
                        x *= tile_size;
                        y *= tile_size;
                        const chunk = chunks[j];
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
                                            images[src] = new Image();
                                            images[src].src = __dir + src;
                                        }
                                        const image = images[src]
                                        ctx.drawImage(image, imageCol * tile_size, imageRow * tile_size, tile_size, tile_size,screenX,screenY, tile_size, tile_size);
                                    }
                                }
                            }
                        }
                    }
                }
                ctx.fillStyle = "black";
                for(const player_id in players){
                    ctx.fillRect((players[player_id].x - camera.x), (players[player_id].y - camera.y), 16, 16);
                }
            }
            const main_loop = () => {
                animationFrameId = requestAnimationFrame(main_loop);
                render();
            }
            animationFrameId = requestAnimationFrame(main_loop);
        });


        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('keyup', handleKeyup);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('contextmenu', handleRightClick);
            window.cancelAnimationFrame(animationFrameId);
            socketRef.current.disconnect();
        }
    }, []);

    return (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
            <canvas ref={canvasRef} width={screenSize.width} height={screenSize.height}></canvas>
        </Box>);
}