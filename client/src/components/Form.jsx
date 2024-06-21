import { Card, Grid, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";

const loginSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
});
const initialValuesLogin = {
    email: "",
    password: "",
};

export const Form = () => {
    return (
        <Formik
            onSubmit={() => {}}
            initialValues={initialValuesLogin}
            validationSchema={loginSchema}
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
                    <Grid container spacing={2} columns={{xs: 12}}>
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
                                autocomplete="new-password"
                            />
                        </Grid>
                    </Grid>
                </form>
            )}
        </Formik>
    )
}