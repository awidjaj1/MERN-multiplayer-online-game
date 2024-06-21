import { Box, Grid, Stack, Typography } from "@mui/material"
import { Socials } from "../../components/Socials"
import { Form } from "../../components/Form"

export const LoginPage = () => {

    return (
        <Box> 
            <Box width={{xs:"90%", md:"15%"}} m="1rem auto">
                <Socials/>
            </Box>
            <Box textAlign={"center"}>
                <Box
                    component="img"
                    sx={{
                        content: {
                            xs: `url(assets/title_small.png)`,
                            md: `url(assets/title.png)`,
                        }
                    }}
                    alt="Title"
                />
            </Box>
            <Box width={{xs:"90%", md:"50%"}} m="1rem auto">
                <Form />
            </Box>
            <Box textAlign={"center"}>
                <img src="assets/walking_duck.gif" alt="duckgif" style={{width: "25%", objectFit: "cover"}} />
            </Box>
        </Box>
    )
}