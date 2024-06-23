import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        // find the user document with the matching unique email
        const user = await User.findOne({email: email});
        // set status code to 401: lack valid authentication cred for the target rescource
        if (!user) return res.status(401).json({msg: "User does not exist."});
        // compare the login pass with the stored salted+hashed pass
        // note that the salt is included in plaintext in the hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({msg: "Invalid credentials. "});
        
        // send a token (contains header, payload, and sig) that claims 
        // whoever has the token is whoever is defined by user._id
        // we don't need to share the secret key as only the server will
        // need to verify the signatures
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        
        // store all the promises as one promise and await
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                // destructure and return only what client needs
                return {_id, firstName, lastName, occupation, location, picturePath};
            }
        );
        

        // this is what we store in local storage
        const formattedUser = (
            ({
                _id, 
                firstName, 
                lastName, 
                email,
                picturePath,
                location,
                occupation,
                viewedProfile,
                impressions,
            }) => ({
                _id, 
                firstName, 
                lastName, 
                email,
                picturePath,
                friends: formattedFriends,
                location,
                occupation,
                viewedProfile,
                impressions
            }))(user);
        // console.log(token);
        // console.log(formattedUser);
        res.status(200).json({token, user: formattedUser});

    } catch(err){
        res.status(500).json({error: err.message})
    }
}


export const register = async (req, res) => {
    try{
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

        // TODO: add functionality of viewedProfile and impressions
        const newUser = new User({
            _id: req.userId,
            firstName,
            lastName,
            username,
            email,
            password: passwordHash,
            picturePath: "pfp_" + req.userId.toHexString()
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
        next();
    } catch(err){
        // set status code to 500: server has encountered an error
        return res.status(500).json({error: err.message});
    }
}