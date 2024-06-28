import jwt from 'jsonwebtoken';

// middleware to authorize a user to make certain api calls
export const verifyToken = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        // console.log(token);
        // status code 403: refuse to authorize the client
        if(!token) return res.status(403).json({error: "Access Denied"});
        if(token.startsWith("Bearer ")) token = token.slice(7, token.length).trimLeft();
        // console.log(token);

        // if verify works (i.e. token was not tampered with), it returns the payload 
        // else it throws an error
        // console.log(token);
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // set the userId in the req object, which can be used by following middleware to ensure
        // that the client making an api call is allowed to do so
        // console.log(verified);

        const {userId} = req.params;
        if (userId !== verified.id) return res.status(403).json({error: "Invalid token for user"});
        return next();
    } catch(err){
        return res.status(500).json({error: err.message});
    }
}