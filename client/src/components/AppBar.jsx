import { Avatar, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from "@mui/material"
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from "react-router-dom";
import { setLogout } from "../state";

export const HomeAppBar = () => {
    // const picturePath = "yo";
    const {picturePath} = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [anchor, setAnchor] = useState(null);
    const isOpen = Boolean(anchor);
    const handleOpen = (event) => {
        setAnchor(event.currentTarget);
    };
    const handleClose = () => {
        setAnchor(null);
    }


    return (
        <Stack direction="row" justifyContent={"space-between"} bgcolor={"primary.main"} alignItems={"center"} p="0.2rem 1rem">
            <Stack direction="row" justifyContent={"space-between"} spacing={"0.5rem"} alignItems={"center"}>
                <ForestOutlinedIcon fontSize={"large"}/>
                <img src="/assets/title_icon.png" alt="title icon"/>
                <LandscapeIcon sx={{fontSize: 50}}/>
            </Stack>
            <IconButton
                onClick={handleOpen}
            >
                <Avatar 
                    sx={{
                        bgcolor: "secondary.light",
                        width: 50,
                        height: 50
                    }}
                    
                >
                    <img src={`/server/${picturePath}`} alt="pfp" style={{width: "100%", objectFit: "cover"}} />
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchor}
                open={isOpen}
                onClose={handleClose}
                sx={{
                    "& .MuiTypography-root": {
                        fontFamily: "Play",
                    },
                }}
            >
                <MenuItem
                    onClick={() => navigate("/settings")}
                >
                    <ListItemIcon>
                        <SettingsIcon fontSize={"small"}/>
                    </ListItemIcon>
                    <ListItemText>
                        Settings
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => dispatch(setLogout())}
                >
                    <ListItemIcon>
                        <LogoutIcon fontSize={"small"}/>
                    </ListItemIcon>
                    <ListItemText>
                        Logout
                    </ListItemText>
                </MenuItem>
            </Menu>            
        </Stack>
    );
};