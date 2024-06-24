import { Button, Stack, Typography } from "@mui/material";

export const ServerList = () => {

    return (
        <Stack
            justifyContent={"center"}
            m="1rem auto"
            p="1rem"
            spacing={"1rem"}
            sx={{
                "& > .MuiStack-root:nth-child(even)": {
                    bgcolor: "secondary.dark",
                },
                "& > .MuiStack-root:nth-child(odd)": {
                    bgcolor: "secondary.main",
                },
                "& button:disabled": {
                    bgcolor: "primary.light",
                },
                border: "1px dashed",
                borderRadius: "1rem"
            }}
        >
            <Stack 
                direction={"row"} 
                justifyContent={"space-between"} 
                alignItems={"center"} 
                borderRadius={2}
                p={1}
            >
                <Typography>US-EAST</Typography>
                <Button 
                    variant="contained" 
                    type="submit" 
                    m="1rem auto"
                >
                    <Typography fontFamily={"Play"} fontSize={"large"}>
                        PLAY!
                    </Typography>
                </Button>
            </Stack>
            <Stack 
                direction={"row"} 
                justifyContent={"space-between"} 
                alignItems={"center"} 
                borderRadius={2}
                p={1}
            >
                <Typography>TBA</Typography>
                <Button 
                    variant="contained" 
                    type="submit" 
                    m="1rem auto" 
                    disabled
                >
                    <Typography fontFamily={"Play"} fontSize={"large"}>
                        PLAY!
                    </Typography>
                </Button>
            </Stack>
            <Stack 
                direction={"row"} 
                justifyContent={"space-between"} 
                alignItems={"center"} 
                borderRadius={2}
                p={1}
            >
                <Typography>TBA</Typography>
                <Button 
                    variant="contained" 
                    type="submit" 
                    m="1rem auto" 
                    disabled
                >
                    <Typography fontFamily={"Play"} fontSize={"large"}>
                        PLAY!
                    </Typography>
                </Button>
            </Stack>
            <Stack 
                direction={"row"} 
                justifyContent={"space-between"} 
                alignItems={"center"} 
                borderRadius={2}
                p={1}
            >
                <Typography>TBA</Typography>
                <Button 
                    variant="contained" 
                    type="submit" 
                    m="1rem auto" 
                    disabled
                >
                    <Typography fontFamily={"Play"} fontSize={"large"}>
                        PLAY!
                    </Typography>
                </Button>
            </Stack>
        </Stack>
    );
};