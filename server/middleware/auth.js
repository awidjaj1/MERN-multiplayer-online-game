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
            firstName,
            lastName,
            username,
            email,
            password: passwordHash,
        });
        newUser.picturePath = "pfp_" + newUser._id;

        const savedUser = await newUser.save();

        req.picturePath = newUser.picturePath;
        res.status(201).json(savedUser);
        next();
    } catch(err){
        // set status code to 500: server has encountered an error
        return res.status(500).json({error: err.message});
    }
}