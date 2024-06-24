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
        stats: {
            type: Map,
            default: {}
        }
    }
)

export default ItemSchema;