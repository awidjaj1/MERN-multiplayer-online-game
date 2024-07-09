import { Box, paperClasses } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../utils";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
        const offscreen = canvas.transferControlToOffscreen();
        const worker = new Worker("renderWorker.js");
        worker.postMessage({type: "canvas", payload: offscreen}, [offscreen]);

        socketRef.current.on("init", ({
                                        tile_size, 
                                        chunk_size,
                                        mapWidth,
                                        mapHeight, 
                                        gidToTilesetMap,
                                        players,
                                        id
                                    }) => {
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
                players = updated_players;
                worker.postMessage({type: "players", payload: players});
                //TODO: dont just replace? maybe can be costly if more players
            })

        });


        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('keyup', handleKeyup);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('contextmenu', handleRightClick);
            socketRef.current.disconnect();
        }
    }, []);

    return (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
            <canvas ref={canvasRef} width={screenSize.width} height={screenSize.height}></canvas>
        </Box>);
}