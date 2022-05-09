
const express = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/user/signup", async(req,res) =>{
    //console.log(req.fields);
    try{
        const picToUpload = req.files.avatar.path;
        const result = await cloudinary.uploader.upload(picToUpload, {folder: "vinted/users"});
        const alreadyMail = await User.findOne({email: req.fields.email});
        const alreadyUsername = await User.findOne({account: {username: req.fields.username}});
        if (alreadyMail)
            return res.status(400).json("This mail already exist");
        else if (req.fields.email.indexOf("@") === -1)
            return res.status(400).json("This mail is invalid");
        else if (alreadyUsername || req.fields.username === undefined)
            return res.status(400).json("This username already exist or is missing");
        else{
            const salt = uid2(32);
            const hash = SHA256(req.fields.password + salt).toString(encBase64);
            const token = uid2(32);
            const newAccount = new User ({
                email: req.fields.email,
                account: {
                    username: req.fields.username,
                    avatar: result.secure_url
                },
                newsletter: req.fields.newsletter,
                token: token,
                hash: hash,
                salt: salt
            })
            await newAccount.save();
            const ret = 
                {_id: newAccount._id,
                    token: newAccount.token,
                    account:{
                        username: newAccount.account.username,
                    statut: "Sign up successful"
                }}
            return res.status(200).json(ret);
        }
    }catch(error){
        res.status(400).json({error: {message: error.message}});
    }
})

router.post("/user/login/", async(req,res) => {
    try{
        const goodUser = await User.findOne({email: req.fields.email});
        if (!goodUser)
            return res.status(401).json("Unauthorized !");
        else{
            const decrypt = SHA256(req.fields.password + goodUser.salt).toString(encBase64);
            if (decrypt === goodUser.hash){
                const ret = 
                {_id: goodUser._id,
                    token: goodUser.token,
                    account:{
                        username: goodUser.account.username,
                    state: "Connect with success"
                }}
                return res.status(200).json(ret);
            }
            else{
                return res.status(401).json("Unauthorized !");
            }
        }
    }catch(error){
        res.status(400).json({error: {message: error.message}});
    }
})


module.exports = router;