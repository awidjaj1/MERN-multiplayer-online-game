import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
};

// define a "slice" of application state for authentication
export const authSlice = createSlice({
    // defines prefix of action types
    name: "auth",
    initialState,
    // define your case reducer functions
    reducers: {
        // '/key' is prepended to action type
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
        },
    }
});

// export action creators/blueprints
export const {
    setLogin, 
    setLogout
} = authSlice.actions;

// export the reducer function which uses all the reducers we defined in the slice
export const authReducer = authSlice.reducer;