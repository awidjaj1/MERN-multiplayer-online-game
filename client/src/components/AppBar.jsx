import { Avatar, IconButton, Stack } from "@mui/material"
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { useSelector } from "react-redux";

export const HomeAppBar = () => {
    // const {picturePath} = useSelector((state) => state.user);
    const picturePath = "yo";

    return (
        <Stack direction="row" justifyContent={"space-between"} bgcolor={"primary.main"} alignItems={"center"} p="0 1rem">
            <Stack direction="row" justifyContent={"space-between"} spacing={"0.5rem"} alignItems={"center"}>
                <ForestOutlinedIcon fontSize={"large"}/>
                <img src="/assets/title_icon.png" />
                <LandscapeIcon sx={{fontSize: 50}}/>
            </Stack>
            <IconButton>
                <Avatar 
                    sx={{
                        bgcolor: "secondary.light"
                    }}
                >
                    <img src={`/server/${picturePath}`} alt="pfp" style={{width: "100%", objectFit: "cover"}} />
                </Avatar>
            </IconButton>            
        </Stack>
    );
};