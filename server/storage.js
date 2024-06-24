import multer from "multer";
import mongoose from "mongoose";
import path from "path";

//storage for upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        const userId = new mongoose.Types.ObjectId();
        const filename = "pfp_" + userId.toHexString() + path.extname(file.originalname);
        const picturePath = "public/assets/" + filename;
        req.userId = userId;
        req.picturePath = picturePath;
        cb(null, filename);
    }
});
export const upload = multer({storage: storage});