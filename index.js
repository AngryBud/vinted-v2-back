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

app.use(express.json());
app.use(formidableMiddleware());
app.use(morgan("dev"));
app.use(userRoutes);
app.use(offerRoutes);
// app.use(cors());


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
//console.log(process.env.MONGODB_URI);
// mongoose.connect("mongodb://localhost:3000/vinted", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });


app.get("/", (req,res) => {res.status(200).json("Bienvenue sur l'api vinted");});

app.all("*", (req,res) => {res.status(404).json("Page not found");});

app.listen(process.env.PORT, () => {console.log("Server started");});