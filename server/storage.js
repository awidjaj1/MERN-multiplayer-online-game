import multer from "multer";

//storage for upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        cb(null, req.picturePath);
    }
});
export const upload = multer({storage: storage});