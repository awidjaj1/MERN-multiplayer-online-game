import { Box } from "@mui/material";
import { HomeAppBar } from "../../components/AppBar";
import { AccountInfo } from "../../components/Account";

export const SettingsPage = () => {
    return (
        <Box>
            <HomeAppBar />
            <Box width={{xs:"60%", md:"40%"}} m="1rem auto">
                <AccountInfo />
            </Box>
        </Box>
    );
}