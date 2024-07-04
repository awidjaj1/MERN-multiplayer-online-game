import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { clamp } from "../../utils";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export const GamePage = () => {
    const MAX_CANVAS_SIZE = {width: 1600, height: 900};
    const MIN_CANVAS_SIZE = {width: 800, height: 450};
    const canvasRef = useRef(null);
    const token = useSelector((state) => state.token);
    const navigate = useNavigate();
    const [screenSize, setScreenSize] = useState(
                            {width: clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width), 
                            height: clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)});

    let chunks = null;

    useEffect(() => {
        const handleResize = () => setScreenSize(
                                    {width: clamp(window.innerWidth, MIN_CANVAS_SIZE.width, MAX_CANVAS_SIZE.width), 
                                    height: clamp(window.innerHeight, MIN_CANVAS_SIZE.height, MAX_CANVAS_SIZE.height)});
        window.addEventListener('resize', handleResize);
        //i think this is a simpler option than doing express type middleware
        //where we set the token in Authorizaiton: Bearer header
        const socket = io({
            auth: {
                token
            }
        });

        socket.on('connect', () => {
            console.log("Connected");
            const tile_path = "/server/public/assets/game/tilesets";

            socket.on("init", (init) => {
                console.log(init);
                const chunk_size = init.chunk_size;
                const player = {x: init.x, y: init.y};
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
                console.log(visible_chunks);
                socket.emit("req_chunks", visible_chunks);
                socket.on("resp_chunks", (requested_chunks) => {
                    chunks = requested_chunks;
                });

            })
        });

        socket.on('connect_error', (err) => {
            window.alert(`There was an error starting the game. ${err}`);
            navigate("/home");
        });

        return () => {
            socket.disconnect();
            window.removeEventListener('resize', handleResize);
        }
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = screenSize.width;
        canvas.height = screenSize.height;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const main_loop = () => {
            animationFrameId = requestAnimationFrame(main_loop);
            ctx.fillStyle = "white";
            ctx.fillRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(canvas.width/2 + Math.random() * 10, canvas.height/2 + Math.random() * 10, 20, 60);
        }
        animationFrameId = requestAnimationFrame(main_loop);

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [screenSize])

    return (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
            <canvas ref={canvasRef}></canvas>
        </Box>);
}