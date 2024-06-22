import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        picturePath: {
            type: String,
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