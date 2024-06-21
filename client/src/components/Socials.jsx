import { Card, Stack, Tooltip, IconButton } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export const Socials = () => {
    return (
        <Card 
            variant="outlined" 
            sx={{
                    display: 'flex',
                    justifyContent: "center",
                    borderRadius: "1rem"
                }}
        >
            <Stack 
                direction="row" 
                justifyContent="space-between" 
                padding={1} 
                width={"100%"}
            >
                <Tooltip title="Email me at awidjaj1@terpmail.umd.edu">
                    <IconButton href='mailto:awidjaj1@terpmail.umd.edu' alt='awidjaj1@terpmail.umd.edu'>
                        <EmailIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Check out my other projects on GitHub">
                    <IconButton href='https://github.com/awidjaj1' target='_blank'>
                        <GitHubIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Connect with me on LinkedIn">
                    <IconButton href='https://www.linkedin.com/in/andrew-widjaja-41b39b245/' target='_blank'>
                        <LinkedInIcon/>
                    </IconButton>
                </Tooltip>
            </Stack>
        </Card>
    )
}