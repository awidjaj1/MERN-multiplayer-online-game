import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import fs from "fs";

export const login = async (req, res) => {
    try{
        const {email_username, password} = req.body;
        // find the user document with the matching unique email
        const [user1, user2] = await Promise.all([User.findOne({email: email_username}), User.findOne({username: email_username})]);
        // set status code to 401: lack valid authentication cred for the target rescource
        if (!user1 && !user2) return res.status(401).json({error: "User does not exist."});

        const realUser = user1? user1: user2;
        // compare the login pass with the stored salted+hashed pass
        // note that the salt is included in plaintext in the hash
        const isMatch = await bcrypt.compare(password, realUser.password);
        if (!isMatch) return res.status(401).json({error: "Invalid credentials. "});
        
        // send a token (contains header, payload, and sig) that claims 
        // whoever has the token is whoever is defined by user._id
        // we don't need to share the secret key as only the server will
        // need to verify the signatures
        const token = jwt.sign({id: realUser._id}, process.env.JWT_SECRET);
        
        // store all the promises as one promise and await
        const friends = await Promise.all(
            realUser.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({_id, username, picturePath, level}) => {
                // destructure and return only what client needs
                return {_id, username, picturePath, level};
            }
        );
        

        // this is what we store in local storage
        const formattedUser = (
            ({
                _id,
                firstName,
                lastName,
                username,
                email,
                picturePath,
                inventory,
                equipped,
                level
            }) => ({
                _id,
                firstName,
                lastName,
                username,
                email,
                picturePath,
                friends: formattedFriends,
                inventory,
                equipped,
                level
            }))(realUser);
        // console.log(token);
        // console.log(formattedUser);
        return res.status(200).json({token, user: formattedUser});

    } catch(err){
        return res.status(500).json({error: err.message})
    }
}


//TODO: validate that multer upload middleware is actually passed through
// otherwise, users can make an api call without an image but with req.fileExt set?, 
// not really a big issue as it will just make it so user doesnt have a pfp
export const register = async (req, res) => {
    try{
        if(!req.fileExt || ![".jpg", ".png", ".jpeg"].includes(req.fileExt)){
            throw new Error("Profile picture issue");
        }

        //frontend should pass the following args in the post req body
        const{
            firstName,
            lastName,
            username,
            email,
            password,
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            _id: req.userId,
            firstName,
            lastName,
            username,
            email,
            password: passwordHash,
            picturePath: req.dbPicturePath,
        });
        
        const savedUser = await newUser.save();
        
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
        return res.status(201).json({user: savedUser});
    } catch(err){
        // set status code to 500: server has encountered an error
        // delete the picture since we failed to make an account 
        fs.unlink(req.curPicturePath, (err) => {
            if(err) return console.log(err);
            console.log(`${req.curPicturePath} was deleted`);
        });
        return res.status(500).json({error: err.message});
    }
}