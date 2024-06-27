import * as yup from "yup";

export const loginSchema = yup.object().shape({
    email_username: yup.string().required("required").max(50, "use less than 50 chars"),
    password: yup.string().required("required").max(50, "use less than 50 chars"),
});

export const registerSchema = yup.object().shape({
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
                return file.size <= 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg");
            }),

});

export const accountSettingsSchema = registerSchema.shape({
    password: yup.string().notRequired().max(50, "use less than 50 chars"),
    confirmPassword: yup.string().when("password", {
        is: (password) => password && password.length > 0,
        then: () => yup.string().required("required").oneOf([yup.ref('password')], 'passwords must match')
    }),
    picture: yup.mixed()
        .notRequired()
        .test("file", "Submit a png, jpg, or jpeg under 1MB", 
            (file) => {
                return !file || (file.size <= 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg"));
            }),
});