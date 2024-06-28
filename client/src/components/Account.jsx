import { Grid, Stack, Button, Typography, TextField, Avatar, Box, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef, useEffect } from "react";
import { ProfileImage } from "./ProfileImage";
import { Debugger } from "./Debugger";
import { accountSettingsSchema } from "../form";
import { useDispatch } from "react-redux";
import { updateUser } from "../state";

const ConfirmPassword = ({handleBlur, handleChange, values, touched, errors, setFieldValue, setFieldTouched}) => {
    useEffect(() => {
        return () => {
            setFieldValue("confirmPassword", "");
            setFieldTouched("confirmPassword", false);
        }
    }, [])
    return (
        <>
            <Grid item xs={6}>
                <Typography>
                    Confirm Password: 
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <TextField
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.confirmPassword}
                    type="password"
                    name="confirmPassword"
                    error={Boolean(touched.confirmPassword) && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    fullWidth
                />
            </Grid>
        </>
    );
};


export const AccountInfo = () => {
    const user = useSelector((state) => state.user)
    const {_id, firstName, lastName, username, email, picturePath} = user;
    const [upload, setUpload] = useState(null);
    //since pfp normally have same name (if theyre the same type), we need to req uncached when we update
    const [uncachedPicturePath, setUncachedPicturePath] = useState(picturePath);
    const firstRender = useRef(true);
    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false;
            return;
        }
        setUncachedPicturePath(`${picturePath}?ts=${new Date().getTime()}`);
        setUpload(null); //to stop flickering when change pfp
    }, [user]);

    const token = useSelector((state) => state.token);
    const dispatch = useDispatch();
    const initialValues = {
        firstName,
        lastName,
        username,
        email,
        picture:"",
        password:"",
        confirmPassword: "",
    };
    // const initialValues = {
    //     firstName: 'Andrew',
    //     lastName: 'Widjaja',
    //     username: 'awid',
    //     email: 'awidjaj1@terpmail.umd.edu',
    //     picture: "",
    //     password: "",
    //     confirmPassword: "",
    // }
    // const picturePath = "random.png"
    const handleFormSubmit = async (values, onSubmitProps) => {
        const formData = new FormData();

        for(let value in values){
            if(values[value] !== initialValues[value]){
                formData.append(value, values[value]);
            }
        }

        const updatedUserResponse = await fetch(`users/${_id}/settings`,
            {
                headers: {Authorization: `Bearer ${token}`},
                method: "PATCH",
                // using formData automatically sets header to multipart form
                body: formData,
            }
        );
        const updatedUser = await updatedUserResponse.json();
        if (updatedUser.error){
            window.alert(`There was an error updating your account. Error: ${updatedUser.error}`);
        } else {
            dispatch(
                updateUser({user: updatedUser.user})
            );
            onSubmitProps.resetForm();
            // console.log(updatedUser);
        }
        



    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
            validationSchema={accountSettingsSchema}
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
                setFieldTouched
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
                                    <ProfileImage src={upload && !errors.picture? upload:`server/${uncachedPicturePath}`}/>
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
                            <Typography>
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
                            <Typography>
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
                            <Typography>
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
                            <Typography>
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
                            <Typography>
                                Password: 
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.password}
                                placeholder="Update password?"
                                type="password"
                                name="password"
                                error={Boolean(touched.password) && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                                fullWidth
                            />
                        </Grid>
                        {values.password &&
                            <ConfirmPassword 
                                handleBlur={handleBlur} 
                                handleChange={handleChange} 
                                values={values} 
                                errors={errors} 
                                touched={touched}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                            />
                        }
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