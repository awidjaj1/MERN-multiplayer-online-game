import { Box, Typography } from "@mui/material"
import { Socials } from "../../components/Socials"
import { Form } from "../../components/Form"

export const LoginPage = () => {

    return (
        <Box>
            <Box width={{xs:"50%", md:"20%"}} m="1rem auto">
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
            <Box width={{xs:"90%", md:"50%"}} m="2rem auto" textAlign={"center"}>
                <Form />
            </Box>
        </Box>
    )
}