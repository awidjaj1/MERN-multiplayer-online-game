import { User } from "../models/User";

export const patchSettings = async (req, res) => {
    try{
        const {userId} = req.params;
        const updates = req.body;

        //make sure if client sent null, then multer didn't upload
        //and if client sent a picture path, then multer did upload and with the same path
        if(updates.picturePath != req.dbPicturePath){
            throw new Error("Invalid picture path");
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true});
        if(updates.picturePath){
            fs.rename(req.curPicturePath, req.dbPicturePath, (err) => {
                //this shouldn't ever error, but if it did it would just result in the user having no pfp
                //which they could change in settings
                if(err){
                    console.log(err);
                    //dont bleed memory
                    fs.unlink(req.curPicturePath, (err) => {
                        if(err) return console.log(err);
                        console.log(`${req.curPicturePath} was deleted`);
                    });
                }
                console.log(`Renamed ${req.curPicturePath} to ${req.dbPicturePath}`);
            });
        }
        return res.status(200).json(updatedUser);
    } catch(err){
        fs.unlink(req.curPicturePath, (err) => {
            if(err) return console.log(err);
            console.log(`${req.curPicturePath} was deleted`);
        });
        return res.status(409).json({error: err.message});
    }

};