const express = require("express");
//const formidableMiddleware = require("express-formidable");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
//const mongoose = require("mongoose");
const validateToken = require("../middlewares/validateToken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

router.post("/offer/publish",validateToken, async(req,res) =>{
    try{
        const {title,description, price, brand, size, condition, color,city} = req.fields;
        if (title.length > 50)
            return res.status(400).json("Title is too long");
        else if (description.length > 500)
            return res.status(400).json("Description is too long");
        else if (Number(price) > 100000)
            return res.status(400).json("Price too high");
        //const ownerExist = await User.findOne({token: req.headers.authorization.replace("Bearer ", "")})
        const newOffer = new Offer ({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                {BRAND: brand},
                {SIZE: size},
                {CONDITION: condition},
                {COLOR: color},
                {CITY: city}
            ],
            owner: req.user//ownerExist,
        });
        //if (req.fields.picture){
        const picToUpload = req.files.picture.path;
        const result = await cloudinary.uploader.upload(picToUpload, {public_id: `${req.fields.title} - ${newOffer._id}`,folder: "vinted/offers"});
        newOffer.product_image = result;//{secure_url: result.secure_url};// changer avec result;
        //}
        await newOffer.save();
        return res.status(200).json({message: 'Offer successfully created !'}, newOffer);
    }catch(error){
        res.status(400).json(error.message);
    }
});

router.put("/offer/modify",validateToken, async(req,res) =>{
    let tabOfModif = Object.keys(req.fields);
    try{
        for(let i = 1; i < tabOfModif.length ; i++){     
            let key = tabOfModif[i];
            let modif = await Offer.findByIdAndUpdate(req.fields.id, {[key]: req.fields[key]})
            await modif.save();
        }
        return res.status(200).json("Modify content with success");
    }catch(error){
        res.status(400).json(error.message);
    }
});

router.delete("/offer/delete",validateToken, async(req,res) =>{
    try{
        const offerToDelete = await Offer.findByIdAndDelete(req.fields.id);
        return res.status(200).json("Product deleted with success");
    }catch(error){
        res.status(400).json(error.message);
    }
});

router.get("/offers", async(req,res)=>{
    try{
        //const {title, priceMin, priceMax, sort, page, limt} = req.query
        let filters = {};
        if (req.query.title){
            filters.product_name = new RegExp(req.query.title, "i");
        }
        if (req.query.priceMin){
            filters.product_price = {
                $gte: req.query.priceMin};
        }
        if (req.query.priceMax){
            if (filters.product_price){
                filters.product_price.$lte = req.query.priceMax;
            }
            else{
                filters.product_price = {
                $lte: req.query.priceMax};
            }
        }
        let sorted = {};
        if (req.query.sort){
            if (req.query.sort === "price-desc")
                sorted = {product_price: -1};
            else if (req.query.sort === "price-asc")
                sorted = {product_price: 1};
        }
        let pages;
        if (!req.query.page)
            pages = 1;
        else if (Number(req.query.page < 1))
            pages = 1;
        else 
            pages = Number(req.query.page);
        
        let limited;
        if (req.query.limit)
            limited = Number(req.query.limit);
        else
            limited = 3;

        const filtered = await Offer.find(filters)//.populate("owner")
        .sort(sorted)
        .skip((pages - 1) * limited)
        .limit(limited);
        const count = await Offer.countDocuments(filters);
    
        return res.json({count: count,offers: filtered,});
        }catch (error) {
            res.status(400).json({ message: error.message });
        }
});

router.get("/offer/:id", async(req,res) =>{
    try{
        const offers = await Offer.findById(req.params.id).populate("owner");//,select: "account",})
        return res.json(offers);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
})

module.exports = router;