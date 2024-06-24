import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            max: 50,
        },
        lastName: {
            type: String,
            required: true,
            max: 50,
        },
        username: {
            type: String,
            required: true,
            max: 15,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true
        },
        password: {
            type: String,
            required: true,
            max: 50,
        },
        picturePath: {
            type: String,
            required: true,
            max: 50,
            default: "",
        },
        friends: {
            type: Array,
            required: true,
            // array of friend ids
            default: []
        },
        inventory: {
            type: Array,
            required: true,
            // array of item ids
            // to retrieve items from db, just iterate of inventory ids
            default: []
        },
        equipped: {
            type: Array,
            required: true,
            //array of item ids
            default: []
        },
        level: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        }
    }
);

export default UserSchema;