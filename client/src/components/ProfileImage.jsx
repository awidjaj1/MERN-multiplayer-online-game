import { useState, useEffect } from "react";

export const ProfileImage = (props) => {
    const [imageOrientation, setImageOrientation] = useState("landscape");
    const isLandscape = imageOrientation === "landscape";

    useEffect(() => {
        const img = new Image();
        img.src = props.src;
        img.onload = () => {
            setImageOrientation((img.height/img.width) > 3/2? "portrait": "landscape")
        };
    }, [props.src]);

    return (
        <img 
            {...props}
            alt="pfp" 
            style={{
                ...(isLandscape? {width:"101%"}: {height:"101%"}), 
                objectFit: "cover", 
                position:"absolute", 
                top:"50%", 
                transform: "translate(0%, -50%)"
        }}/>
    );
};