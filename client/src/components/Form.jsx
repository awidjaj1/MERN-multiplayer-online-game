import { Button, Grid, TextField, Typography, Avatar, Box, Stack } from "@mui/material";
import { Formik } from "formik";
import { useState } from "react";
import Dropzone from "react-dropzone";
import EditIcon from '@mui/icons-material/Edit';
import PhotoIcon from '@mui/icons-material/Photo';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../state";



const loginSchema = yup.object().shape({
    email_username: yup.string().required("required").max(50, "use less than 50 chars"),
    password: yup.string().required("required").max(50, "use less than 50 chars"),
});

const registerSchema = yup.object().shape({
    firstName: yup.string().required("required").max(50, "use less than 50 chars"),
    lastName: yup.string().required("required").max(50, "use less than 50 chars"),
    email: yup.string().email("invalid email").required("required").max(50, "use less than 50 chars"),
    username: yup.string().required("required").max(15, "use less than 15 chars").matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
    password: yup.string().required("required").max(50, "use less than 50 chars"),
    confirmPassword: yup.string().required("required").oneOf([yup.ref('password')], 'passwords must match'),
    picture: yup.mixed()
        .required("Require a profile picture")
        .test("file", "Submit a png, jpg, or jpeg under 1MB", 
            (file) => {
                const preview = document.getElementById("preview");
                if(file.size <= 1024 * 1024 && 
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
    email_username: "",
    password: "",
};

const initialValuesRegister = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    picture: "",
};

export const Form = () => {
    const [pageType, setPageType] = useState("login");
    const isRegister = pageType === "register";
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const register = async (values, onSubmitProps) => {
        const formData = new FormData();
        for (let value in values){
            formData.append(value, values[value]);
        }
        // console.log(values.picture);

        const savedUserResponse = await fetch("auth/register",
            {
                method: "POST",
                // using formData automatically sets header to multipart form
                body: formData,
            }
        );
        const savedUser = await savedUserResponse.json();

        if (savedUser.error){
            window.alert(`There was an error making your account. Possibly because your email or username is already in use. Error: ${savedUser.error}`);
        }else {
            onSubmitProps.resetForm();
            setPageType("login");
        }
    }

    const login = async (values, onSubmitProps) => {
        const loggedInResponse = await fetch("auth/login",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            }
        );
        const loggedIn = await loggedInResponse.json();
        if (loggedIn.error){
            window.alert(`There was an error logging in. Error: ${loggedIn.error}`);
        } else{
            onSubmitProps.resetForm();
            // console.log(loggedIn.user);
            // dispatch the redux login event
            dispatch(
                setLogin({
                    user: loggedIn.user,
                    token: loggedIn.token
                })
            );
            navigate("/home");
        }
    }

    const handleFormSubmit = async (values, onSubmitProps) => {
        if(isRegister){
            await register(values, onSubmitProps);
        } else{
            await login(values, onSubmitProps);
        }
    };

    return (
        <Formik
            enableReinitialize
            onSubmit={handleFormSubmit}
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
                        variant={isRegister? "rounded": ""}
                    >
                        {isRegister? <AppRegistrationIcon fontSize="large"/>: <LockOpenIcon fontSize="large"/>}
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
                            <Grid item xs={12}>
                                <TextField 
                                    label="Username"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.username}
                                    name="username"
                                    error={Boolean(touched.username) && Boolean(errors.username)}
                                    helperText={touched.username && errors.username}
                                    fullWidth
                                />
                            </Grid>
                        </>
                        }
                        <Grid item xs={12}>
                            <TextField 
                                label={isRegister? "Email": "Email/Username"}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={isRegister? values.email: values.email_username}
                                name={isRegister? "email": "email_username"}
                                error={isRegister? 
                                    (Boolean(touched.email) && Boolean(errors.email)):
                                    (Boolean(touched.email_username) && Boolean(errors.email_username))
                                }
                                helperText={isRegister? 
                                    (touched.email && errors.email):
                                    (touched.email_username && errors.email_username)
                                }
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
                                            sx={{"&:hover": {cursor: "pointer", borderColor: "secondary.main"},
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
                                                            {values.picture.name.length > 11? values.picture.name.slice(0,8) + "...": values.picture.name}
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
                                <Typography fontFamily={"Play"} fontSize={"large"}>
                                    {isRegister? "REGISTER": "LOGIN"}
                                </Typography>
                            </Button>
                            <Typography 
                                fontFamily={"Play"} 
                                m="1rem auto" 
                                onClick={() => {
                                    setPageType(isRegister? "login": "register");
                                    resetForm();
                                }}
                                sx={{
                                    textDecoration: "underline",
                                    "&:hover": {
                                        cursor: "pointer",
                                        color: "secondary.main"
                                    }
                                }}>
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