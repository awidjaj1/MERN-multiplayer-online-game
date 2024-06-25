import { Box, Card, Typography } from "@mui/material";
import { ServerList } from "../../components/ServerList";
import { useSelector } from "react-redux";
import { HomeAppBar } from "../../components/AppBar";


export const HomePage = () => {
    const {firstName, lastName, username} = useSelector((state) => state.user);
    // const firstName = "Andrew";
    // const username = "awid";
    // const lastName = "Widjaja";
    return (
        <Box> 
            <HomeAppBar />
            <Box width={{xs:"50%", md:"30%"}} m="auto" mt="3rem" textAlign={"center"}>
                <Typography>
                    Welcome back <Typography display={"inline"} color={"primary.dark"} sx={{textDecoration: 'underline'}}>
                                    {firstName} "{username}" {lastName}
                                 </Typography>,
                    <br />
                    Choose a server to begin your adventure!
                </Typography>
            </Box>
            <Box 
                textAlign={"center"} 
                m="2rem auto"
            >
                <Box
                    component="img"
                    sx={{
                        content: {
                            xs: `url(assets/server_small.png)`,
                            md: `url(assets/server.png)`,
                        }
                    }}
                    alt="Server"
                />
            </Box>
            <Box width={{xs:"60%", md:"40%"}} m="1rem auto">
                <ServerList />
            </Box>
        </Box>
    );
}