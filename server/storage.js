import multer from "multer";
import mongoose from "mongoose";

//storage for upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        const userId = new mongoose.Types.ObjectId();
        req.userId = userId;
        cb(null, "pfp_" + userId.toHexString());
    }
});
export const upload = multer({storage: storage});