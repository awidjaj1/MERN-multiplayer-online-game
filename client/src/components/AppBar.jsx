import { Avatar, Icon, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from "@mui/material"
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from "react-router-dom";
import { setLogout } from "../state";
import { ProfileImage } from "./ProfileImage";

export const HomeAppBar = () => {
    // const picturePath = "yo";
    const user = useSelector((state) => state.user);
    const {picturePath} = user;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [anchor, setAnchor] = useState(null);
    const [uncachedPicturePath, setUncachedPicturePath] = useState(picturePath);

    // this might request an uncached picture that is different from the uncached picture in the settings page
    // since we are not using global state, but i think thats okay. Two requests on rare chances isn't that 
    // bad for performance. Otherwise i would have to refactor the redux state.
    const firstRender = useRef(true);
    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false;
            return;
        }
        setUncachedPicturePath(`${picturePath}?ts=${new Date().getTime()}`);
    }, [user]);

    const isOpen = Boolean(anchor);
    const handleOpen = (event) => {
        setAnchor(event.currentTarget);
    };
    const handleClose = () => {
        setAnchor(null);
    }


    return (
        <Stack 
            direction="row" 
            justifyContent={"space-between"} 
            bgcolor={"primary.main"} 
            alignItems={"center"} 
            p="0.2rem 1rem"
            sx={{
                boxShadow: 5
            }}
        >
            <Stack 
                direction="row" 
                justifyContent={"space-between"} 
                spacing={"0.5rem"} 
                alignItems={"center"}
                onClick={() => navigate("/home")}
                sx={{
                    "&:hover":{
                        cursor: "pointer"
                    }
                }}
            >
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
                    <ProfileImage src={`/server/${uncachedPicturePath}`} />
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
                        <AccountCircleIcon fontSize={"small"}/>
                    </ListItemIcon>
                    <ListItemText>
                        Account
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