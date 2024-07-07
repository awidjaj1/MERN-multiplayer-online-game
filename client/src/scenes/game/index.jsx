import { Box, paperClasses } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../utils";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export const GamePage = () => {
    const MAX_CANVAS_SIZE = {width: 1600, height: 900};
    const MIN_CANVAS_SIZE = {width: 800, height: 450};
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
        window.addEventListener('resize', handleResize);
        socketRef.current = io({
            auth: {
                token
            }
        });

        socketRef.current.on('connect_error', (err) => {
            window.alert(`There was an error starting the game. ${err}`);
            navigate("/home");
        });

        let animationFrameId;
        let chunks = null;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        socketRef.current.on("init", (init) => {
            const {
                tile_size, 
                chunk_size,
                mapWidth,
                mapHeight, 
                gidToImageMap, 
                username, 
                friends, 
                inventory, 
                equipped,
                level, 
                x, 
                y
            } = init
            const tile_path = "/server/public/assets/game/tilesets/";
            const player = {x, y, level, equipped, inventory, username, friends};
            const camera = {x: clamp(player.x - canvas.width/2,0,mapWidth - canvas.width), y: clamp(player.y - canvas.height/2,0, mapHeight - canvas.height) };
            const current_chunk = {x: parseInt(player.x / chunk_size), y: parseInt(player.y / chunk_size)}
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
            const getImageFromGid = (function (){
                const keys = Object.keys(init.gidToImageMap).map((key) => parseInt(key)).sort((a,b) => b - a);
                return (gid) => {
                    //TODO: instead of linear search, can do binary search
                    for (const key of keys) {
                        let src =  init.gidToImageMap[key];
                        if (key <= gid) return {firstGid: key, src: src.substring(0, src.length - 3) + "png"};
                    }
                    return {firstGid: null, src: null};
                }
            })();
            for(let i = 0; i < 40; i++){
                const {firstGid, src} = getImageFromGid(i);
                console.log(firstGid, src);
            }
            //TODO: maybe eventually delete image references to let GC free up memory?
            const images = {};
            const render = () => {
                ctx.clearRect(0,0,canvas.width, canvas.height);
                if(chunks){
                    for(let j = 0; j < 9; j++){
                        let {x,y} = visible_chunks[j];
                        x *= 16;
                        y *= 16;
                        const chunk = chunks[j];
                        for(const l in chunk){
                            const layer = chunk[l];
                            if(l !== '2' && layer){
                                for(let i = 0; i < 64 * 64; i++){
                                    const screenX = x + ((i%64) * 16) - camera.x;
                                    const screenY = y + (Math.floor(i/64)*16) - camera.y;
                                    if(clamp(screenX, 0, canvas.width) !== screenX || clamp(screenY, 0, canvas.height) !== screenY){
                                        continue;
                                    }
                                    let tile = layer[i];
                                    const {firstGid, src} = getImageFromGid(tile);
                                    if(src !== null){
                                        tile -= firstGid;
                                        const imageRow = Math.floor(tile / 4);
                                        const imageCol = tile % 4;
                                        if(!images[src]){
                                            images[src] = new Image();
                                            images[src].src = tile_path + src;
                                        }
                                        const image = images[src]
                                        ctx.drawImage(image, imageCol * 16, imageRow * 16, 16, 16,screenX,screenY, 16, 16);
                                    }
                                }
                            }
                        }
                    }
                }
                ctx.fillStyle = "black";
                ctx.fillRect((player.x - camera.x) + Math.random() * 10, (player.y - camera.y) + Math.random() * 10, 20, 60);
            }
            const main_loop = () => {
                animationFrameId = requestAnimationFrame(main_loop);
                render();
            }
            animationFrameId = requestAnimationFrame(main_loop);
        })


        return () => {
            window.removeEventListener('resize', handleResize);
            window.cancelAnimationFrame(animationFrameId);
            socketRef.current.disconnect();
        }
    }, []);

    return (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
            <canvas ref={canvasRef} width={screenSize.width} height={screenSize.height}></canvas>
        </Box>);
}