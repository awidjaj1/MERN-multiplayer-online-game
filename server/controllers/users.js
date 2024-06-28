import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import fs from "fs";

export const patchSettings = async (req, res) => {
    try{
        const {userId} = req.params;
        const fields = ['firstName', 'lastName', 'username', 'email', 'password'];
        const updates = Object.fromEntries(Object.entries(req.body)
                            .filter(([key, val]) => fields.includes(key) && val));


        // might need to update picture path if format changes (i.e. png to jpg)        
        if(req.dbPicturePath){
            updates.picturePath = req.dbPicturePath
        }
        if(updates.password){
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(updates.password, salt);
            updates.password = passwordHash;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true});
        if(req.curPicturePath){
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
        return res.status(200).json({user: updatedUser});
    } catch(err){
        if(req.curPicturePath){
            fs.unlink(req.curPicturePath, (err) => {
                if(err) return console.log(err);
                console.log(`${req.curPicturePath} was deleted`);
            });
        }
        return res.status(409).json({error: err.message});
    }

};