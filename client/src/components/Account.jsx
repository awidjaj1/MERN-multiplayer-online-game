import { Grid, Stack, Button, Typography, TextField, Avatar, Box, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef, useEffect } from "react";
import { ProfileImage } from "./ProfileImage";
import { registerSchema } from "../form";
import { Debugger } from "./Debugger";



export const AccountInfo = () => {
    // const {firstName, lastName, username, email, picturePath} = useSelector((state) => state.user)
    // const initialValues = {
    //     firstName,
    //     lastName,
    //     username,
    //     email,
    //     picture:""
    // };
    const initialValues = {
        firstName: 'Andrew',
        lastName: 'Widjaja',
        username: 'awid',
        email: 'awidjaj1@terpmail.umd.edu',
        picture: "",
        password: "",
    }
    const picturePath = "random.png"
    const [upload, setUpload] = useState(null);
    const handleFormSubmit = () => {

    }
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
            validationSchema={registerSchema}
        >
            {({
                values,
                errors,
                touched,
                dirty,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm
            }) => (
                <form onSubmit={handleSubmit}>
                    <Dropzone
                        acceptedFiles=".jpg,.jpeg,.png"
                        multiple={false}
                        onDrop={(acceptedFiles) => {
                            URL.revokeObjectURL(upload);
                            setUpload(URL.createObjectURL(acceptedFiles[0]));
                            setFieldValue("picture", acceptedFiles[0]);
                        }}
                    >
                        {({getRootProps, getInputProps}) => (
                            <Box
                                {...getRootProps()}
                                sx={{"&:hover": {cursor: "pointer", borderColor: "secondary.main"},
                                    border: "1px dashed",
                                    borderColor: "black",
                                    borderRadius: "1rem",
                                    width: "50%",
                                    aspectRatio: "1/1",
                                }}
                                onFocus={null}
                                onBlur={null}
                                m="2rem auto"
                                p="1rem"
                            >
                                {/* <Debugger/> */}
                                <input {...getInputProps()} />
                                <Avatar 
                                    sx={{
                                        margin: "auto",
                                        width: "100%",
                                        pt: "100%",
                                        bgcolor: "secondary.light"
                                    }}
                                >
                                    <ProfileImage src={values.picture && !errors.picture? upload:`server/${picturePath}`}/>
                                </Avatar>
                            </Box>
                        )}

                    </Dropzone>
                    <Grid
                        rowGap={2} 
                        container 
                        columns={{xs: 6, md: 12}} 
                        alignItems={"center"} 
                        justifyContent={"center"} 
                        bgcolor={"primary.light"} 
                        p="1rem" 
                        borderRadius={"1rem"}
                        boxShadow={2}
                        m="0.5rem auto"
                    >
                        <Grid item xs={6}>
                            <Typography fullWidth>
                                First Name: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.firstName}
                                name="firstName"
                                error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                                helperText={touched.firstName && errors.firstName}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fullWidth>
                                Last Name: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.lastName}
                                name="lastName"
                                error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                                helperText={touched.lastName && errors.lastName}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fullWidth>
                                Username: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.username}
                                name="username"
                                error={Boolean(touched.username) && Boolean(errors.username)}
                                helperText={touched.username && errors.username}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fullWidth>
                                Email: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                name="email"
                                error={Boolean(touched.email) && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fullWidth>
                                Password: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.password}
                                type="password"
                                name="password"
                                error={Boolean(touched.password) && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Button variant="contained" type="submit" fullWidth sx={{borderRadius: 2}} disabled={!dirty}>
                        <Typography fontFamily={"Play"} fontSize={"large"}>
                            SAVE CHANGES
                        </Typography>
                    </Button>
                </form>
            )}

        </Formik>
    );
};