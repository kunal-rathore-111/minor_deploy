

// db functions
const userService = require("../services/userService");

// tokenCreation
const { createToken } = require("../utils/jwt");

//signIn
const signin = async (req, res) => {

    const userId = await userService.isUserExists(req.body);

    // jwt generation
    const token = createToken(userId);
    
    // Set cookie with proper options for cross-origin
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/'
    };
    
    res.cookie("token", token, cookieOptions);
    res.json({ message: "Sign-in successfull" });

    // after signIn redirect to the home from fronted not here
}

const respondTokenExists = (req, res) => {
    const userId = req.userId
    res.json({ message: "Token exists", userId: userId }) // need to change to true or may be route will be removed later 
}

module.exports = { signin, respondTokenExists };