import multer from "multer";
import mongoose from "mongoose";
import path from "path";

//storage for upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        const userId = req.params.userId? req.params.userId: new mongoose.Types.ObjectId();
        const ext = path.extname(file.originalname);
        const dbFilename = "pfp_" + userId + ext;
        const curFilename = "pending_" + dbFilename;
        const dbPicturePath = "public/assets/" + dbFilename;
        const curPicturePath = "public/assets/" + curFilename;
        req.userId = userId;
        req.fileExt = ext;
        req.dbPicturePath = dbPicturePath;
        req.curPicturePath = curPicturePath;
        cb(null, curFilename);
    }
});
export const upload = multer({storage: storage});