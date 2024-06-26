import { Grid, Stack, Button, Typography, TextField, Avatar, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef, useEffect } from "react";
import { ProfileImage } from "./ProfileImage";
import { registerSchema } from "../form";
import { Debugger } from "./Debugger";



export const AccountInfo = () => {
    const {firstName, lastName, username, email, picturePath} = useSelector((state) => state.user)
    const initialValues = {
        firstName,
        lastName,
        username,
        email,
        picture:""
    };
    // const initialValues = {
    //     firstName: 'Andrew',
    //     lastName: 'Widjaja',
    //     username: 'awid',
    //     email: 'awidjaj1@terpmail.umd.edu',
    //     picture: "",
    //     picturePath: 'random.png'
    // }
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
                                p="1rem"
                                sx={{"&:hover": {cursor: "pointer", borderColor: "secondary.main"},
                                    "border": "1px dashed",
                                    "borderColor": "black",
                                    "borderRadius": 1,
                                }}
                                onFocus={null}
                                onBlur={null}
                            >
                                {/* <Debugger/> */}
                                <input {...getInputProps()} />
                                <Avatar 
                                    sx={{
                                        margin: "auto",
                                        width: "50%",
                                        pt: "50%",
                                        bgcolor: "secondary.light"
                                    }}
                                >
                                    <ProfileImage src={values.picture && !errors.picture? upload:`server/${picturePath}`}/>
                                </Avatar>
                            </Box>
                        )}

                    </Dropzone>
                </form>
            )}

        </Formik>
    );
};