import { Box, paperClasses } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../utils";
import io from "socket.io-client";
import { Debugger } from "../../components/Debugger";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export const GamePage = () => {
    const MAX_CANVAS_SIZE = {width: 1920, height: 1080};
    const MIN_CANVAS_SIZE = {width: 320, height: 180};
    const canvasRef = useRef(null);
    const token = useSelector((state) => state.token);
    const navigate = useNavigate();
    const screenSize = {width: clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width), 
                        height: clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)};

    useEffect(() => {

        const socket = io({
            auth: {
                token
            }
        });
        const canvas = canvasRef.current;
        const offscreen = canvas.transferControlToOffscreen();
        const worker = new Worker("renderWorker.js");
        worker.postMessage({type: "canvas", payload: offscreen}, [offscreen]);

        const handleInput = (function (event){
            const validInput = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
            return (e) => {
                if(!e.repeat && validInput.includes(e.key)){
                    socket.emit(event, e.key.toLowerCase());
                }
            }
        });
        const handleBlur = ()=>{
            socket.emit("keyup", "all");
        };
        const handleKeydown = handleInput('keydown');
        const handleKeyup = handleInput('keyup');
        //TODO: implement custom right click where you can right click on users in the game to see more info
        const handleRightClick = (e) => {
            socket.emit("keyup", "all");
        };
        const zoom = (e) => {
            worker.postMessage({type:"zoom", payload: e.deltaY*-0.001});
        };
        const handleResize = () => {
            screenSize.width = clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width);
            screenSize.height = clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)
            worker.postMessage({type:"resize", payload: screenSize});
        };
        window.addEventListener('resize', handleResize, true);
        window.addEventListener('keydown', handleKeydown, true);
        window.addEventListener('keyup', handleKeyup, true);
        window.addEventListener('blur', handleBlur, true);
        window.addEventListener('contextmenu', handleRightClick, true);
        window.addEventListener('wheel', zoom, true);

        socket.on('connect_error', (err) => {
            window.alert(`There was an error starting the game. ${err}`);
            navigate("/home");
        });

        socket.on("init", ({
                                grid_size, 
                                chunk_size,
                                num_layers,
                                mapWidth,
                                mapHeight, 
                                tilesets,
                                players,
                                id
                            }) => {
            worker.postMessage({type:"init", payload: {
                grid_size, 
                chunk_size,
                num_layers,
                mapWidth,
                mapHeight, 
                tilesets,
                players,
                id
            }});

            let player = players[id];
            const get_current_chunk = (player) => {
                return {x: Math.floor(player.coords.x / (grid_size * chunk_size)) * chunk_size, 
                    y: Math.floor(player.coords.y / (grid_size * chunk_size)) * chunk_size};
            }
            const get_visible_chunks = (current_chunk) => {
                
                const chunks = [];
                //get chunks in order of right down
                for(let scaleY = -1; scaleY <= 1; scaleY++){
                    for(let scaleX = -1; scaleX <= 1; scaleX++){
                        chunks.push({x: current_chunk.x + scaleX * chunk_size,
                            y: current_chunk.y + scaleY * chunk_size});
                    }
                }
                return chunks
            }
            let current_chunk = get_current_chunk(player);
            let visible_chunks = get_visible_chunks(current_chunk);
            socket.emit("req_chunks", visible_chunks);

            socket.on("resp_chunks", (requested_chunks) => {
                worker.postMessage({type: "chunks", payload: requested_chunks});
            });
            socket.on("players", (updated_players) => {
                player = updated_players[id];
                worker.postMessage({type: "players", payload: updated_players});
                //TODO: dont just replace? maybe can be costly if more players
                const new_chunk = get_current_chunk(player);

                if(new_chunk.x !== current_chunk.x || new_chunk.y !== current_chunk.y){
                    current_chunk = new_chunk;
                    visible_chunks = get_visible_chunks(current_chunk);
                    socket.emit("req_chunks", visible_chunks);
                }
            })

        });


        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('keyup', handleKeyup);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('contextmenu', handleRightClick);
            window.removeEventListener('wheel', zoom);
            worker.postMessage({type:"terminate"}); //not sure if this is necessary
            worker.terminate();
            socket.disconnect();
        }
    }, []);

    return (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
            <canvas ref={canvasRef} width={screenSize.width} height={screenSize.height}></canvas>
        </Box>);
}