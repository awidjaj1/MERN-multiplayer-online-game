import { Button, Grid, TextField, Typography, Avatar, Box, Stack, Card } from "@mui/material";
import { Formik } from "formik";
import { useState } from "react";
import Dropzone from "react-dropzone";
import EditIcon from '@mui/icons-material/Edit';
import PhotoIcon from '@mui/icons-material/Photo';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import * as yup from "yup";
import Photo from "@mui/icons-material/Photo";

const loginSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
});

const registerSchema = yup.object().shape({
    firstName: yup.string().required("required"),
    lastName: yup.string().required("required"),
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
    confirmPassword: yup.string().required("required").oneOf([yup.ref('password')], 'passwords must match'),
    picture: yup.mixed()
        .required("Require a profile picture")
        .test("file", "Submit a png, jpg, or jpeg under 5MB", 
            (file) => {
                const preview = document.getElementById("preview");
                if(file.size <= 1024 * 1024 * 5 && 
                    (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg")
                ){
                    if(preview.src)
                        //clean up past blobs
                        URL.revokeObjectURL(preview.src);
                    preview.src = URL.createObjectURL(file);
                    preview.removeAttribute("hidden");
                    return true;
                }
                preview.setAttribute("hidden", "");
                return false;
            })

});


const initialValuesLogin = {
    email: "",
    password: "",
};

const initialValuesRegister = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    picture: "",
};

export const Form = () => {
    const [pageType, setPageType] = useState("register");
    const isRegister = pageType === "register";

    return (
        <Formik
            onSubmit={() => {}}
            initialValues={isRegister? initialValuesRegister: initialValuesLogin}
            validationSchema={isRegister? registerSchema: loginSchema}
        >
            {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm
            }) => (
                <form onSubmit={handleSubmit}>
                    <Avatar 
                        sx={{
                            margin: "1rem auto",
                            width: 50,
                            height: 50,
                            bgcolor: "secondary.main"
                        }}
                    >
                        <LockOpenIcon/>
                    </Avatar>
                    <Grid container spacing={2} columns={{xs: 12}}>
                        {isRegister &&
                        <>
                            <Grid item xs={6}>
                                <TextField 
                                    label="First Name"
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
                                <TextField 
                                    label="Last Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    name="lastName"
                                    error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                                    helperText={touched.lastName && errors.lastName}
                                    fullWidth
                                />
                            </Grid>
                        </>
                        }
                        <Grid item xs={12}>
                            <TextField 
                                label="Email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                name="email"
                                error={Boolean(touched.email) && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Password"
                                type="password"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.password}
                                name="password"
                                error={Boolean(touched.password) && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                                fullWidth
                            />
                        </Grid>
                        {isRegister &&
                        <>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Confirm Password"
                                    type="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.confirmPassword}
                                    name="confirmPassword"
                                    error={Boolean(touched.confirmPassword) && Boolean(errors.confirmPassword)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Dropzone
                                    acceptedFiles=".jpg,.jpeg,.png"
                                    multiple={false}
                                    onDrop={(acceptedFiles) => {
                                        setFieldValue("picture", acceptedFiles[0]);
                                    }}
                                >
                                    {({getRootProps, getInputProps}) => (
                                        <Box
                                            {...getRootProps()}
                                            p="1rem"
                                            sx={{"&:hover": {cursor: "pointer"},
                                            "border": "1px dashed",
                                            "borderColor": "black",
                                            "borderRadius": 1
                                            }}
                                        >
                                            <input {...getInputProps()}/>
                                            {!values.picture? (
                                                <Stack direction="row" justifyContent={"space-between"}>
                                                    {(touched.picture && errors.picture)? 
                                                        <Typography color={"error.main"}>
                                                            {errors.picture}
                                                        </Typography>: 
                                                        <Typography color={"text.secondary"}>
                                                            Add Profile Picture Here
                                                        </Typography>
                                                    }
                                                    <PhotoIcon />
                                                </Stack>
                                            ): (
                                                <Stack direction="row" justifyContent={"space-between"}>
                                                    {errors.picture? 
                                                        <Typography color={"error.main"}>
                                                            {errors.picture}
                                                        </Typography>: 
                                                        <Typography color={"text.primary"} mb={"1rem"}>
                                                            {values.picture.name}
                                                        </Typography>
                                                    } 
                                                    <EditIcon />
                                                </Stack>
                                            )}
                                            <Avatar 
                                                sx={{
                                                    margin: "auto",
                                                    width: "70%",
                                                    height: "70%",
                                                    bgcolor: "secondary.light"
                                                }}
                                            >
                                                <img id="preview" hidden style={{width: "100%", objectFit: "cover"}}/>
                                            </Avatar>
                                        </Box>
                                    )}
                                </Dropzone>
                            </Grid>
                        </>
                        }
                        <Grid item xs={12}>
                            <Button variant="contained" type="submit" fullWidth m="1rem auto">
                                <Typography fontFamily={"Play"} fontSize={"1.5rem"}>
                                    {isRegister? "REGISTER": "LOGIN"}
                                </Typography>
                            </Button>
                            <Typography fontFamily={"Play"} m="1rem auto">
                                {isRegister? "Already have an account? Login here.":
                                             "Don't have an account? Sign Up here."}
                            </Typography>
                        </Grid>
                    
                    </Grid>
                </form>
            )}
        </Formik>
    )
}