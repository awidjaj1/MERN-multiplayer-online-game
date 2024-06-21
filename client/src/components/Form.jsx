import { Button, Grid, TextField, Typography, Avatar } from "@mui/material";
import { Formik } from "formik";
import { useState } from "react";
import Dropzone from "react-dropzone";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import * as yup from "yup";

const loginSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
});

const registerSchema = yup.object().shape({
    firstName: yup.string().required("required"),
    lastName: yup.string().required("required"),
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'passwords must match'),
    picture: yup.string().required("required"),
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
                        <LockOpenIcon />
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
                            <Grid item xs={12} border={"1px solid secondary.main"} borderRadius={"1rem"} p="1rem">
                                {/* <Dropzone
                                    acceptedFiles=".jpg,.jpeg,.png"
                                    multiple={false}
                                    onDrop={(acceptedFiles) => 
                                        setFieldValue("picture", acceptedFiles[0])
                                    }
                                >
                                    {({getRootProps, getInputProps}) => (
                                        <Box
                                            {...getRootProps()}
                                            border={"2px dashed"}
                                            p="1rem"
                                            sx={{"&:hover": {cursor: "pointer"}}}
                                        >
                                            <input {...getInputProps()}/>
                                            {!values.picture? (
                                                <p>Add Picture Here</p>
                                            ): (
                                                <FlexBetween>
                                                    <Typography>
                                                        {values.picture.name}
                                                    </Typography>
                                                    <EditOutlinedIcon />
                                                </FlexBetween>
                                            )}
                                        </Box>
                                    )}
                                </Dropzone> */}
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