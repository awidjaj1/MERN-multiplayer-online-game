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
            // array of friend ids
            default: []
        },
        inventory: {
            type: Array,
            // array of item ids
            // to retrieve items from db, just iterate of inventory ids
            default: []
        },
        equipped: {
            type: Array,
            //array of item ids
            default: []
        }
    }
)