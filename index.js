require("dotenv").config();
const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
// const cors = require("cors");
const app = express();
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(express());
app.use(formidableMiddleware());
app.use(morgan("dev"));
app.use(userRoutes);
app.use(offerRoutes);


// var corsOptions = {
//   origin: 'http://localhost:3000/',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors(corsOptions));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
//console.log(process.env.MONGODB_URI);
// mongoose.connect("mongodb://localhost:3000/vinted", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });



app.get("/", (req,res) => {
              
              res.status(200).json("Bienvenue sur l'api vinted");});

app.all("*", (req,res) => {res.status(404).json("Page not found");});

app.listen(process.env.PORT, () => {console.log("Server started");});