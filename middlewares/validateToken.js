const User = require("../models/User");

const validateToken = async(req, res, next) => {
    const token = req.headers.authorization;
    const user = await User.findOne({token: req.headers.authorization.replace("Bearer ", "")});
    if (!token)
        return res.status(401).json("Unauthorized");
    if (!user)
        return res.status(401).json("Unauthorized");
    else {
        req.user = user;//.account.username;
        next();
    }
}

module.exports = validateToken;