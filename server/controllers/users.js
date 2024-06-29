import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import fs from "fs";

export const patchSettings = async (req, res) => {
    try{
        if(req.fileExt && ![".jpg", ".png", ".jpeg"].includes(req.fileExt)){
            throw new Error("Invalid file format");
        }

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

        //returns user before the update
        const oldUser = await User.findByIdAndUpdate(userId, updates);
        if(!oldUser) return res.status(401).json({error: "User does not exist."})
            
        //if changed the user's picture path (by using different file format), delete old one
        if(req.dbPicturePath && oldUser.picturePath !== req.dbPicturePath){
            fs.unlink(oldUser.picturePath, (err) => {
                if(err) return console.log(err);
                console.log(`${oldUser.picturePath} was deleted`);
            }); 
        }

        if(req.curPicturePath){
            //rename the pending picture to the actual pfp
            fs.rename(req.curPicturePath, req.dbPicturePath, (err) => {
                //this shouldn't ever error, but if it did it would just result in the user having old pfp (or no pfp)
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
        const updatedUser = await User.findById(userId);
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