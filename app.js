require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const validator = require("validator");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin:Password-2022@appcluster.soq0x6e.mongodb.net/mobileDB");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: "E-mail is required",
        validate: {validator: validator.isEmail, message: "Invalid E-mail"}
    },
    password: String
});

userSchema.plugin(passportLocalMongoose);

const messageSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: "E-mail is required",
        validate: {validator: validator.isEmail, message: "Invalid E-mail"}
    },
    message: String
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    if(req.isAuthenticated()){
        res.render("home", {logLink: "logout", regLog: "Logout", refLink: "buy", butCon: "Buy"});
    } else {
        res.render("home", {logLink: "login", regLog: "Register/Login", refLink: "login", butCon: "Login to Buy"});
    }

});

app.get("/login", (req, res)=>{
    res.render("login", {logLink: "login", regLog: "Register/Login"});
});
app.post("/login", (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/");
            });
        }
    });
})

app.get("/register", (req, res)=>{
    res.render("register", {logLink: "login", regLog: "Register/Login"});
});
app.post("/register", (req,res)=>{
    User.register({username: req.body.username}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/");
            });
        }
    });
});

app.get("/contact", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("contact", {logLink: "logout", regLog: "Logout"});
    } else {
        res.render("contact", {logLink: "logout", regLog: "Register/Login"});
    }
});
app.post("/contact", (req,res)=>{
    const message = new Message({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    });
    message.save();
    res.redirect("/");
});
app.get("/buy", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("buy", {logLink: "logout", regLog: "Logout"});
    } else {
        res.redirect("/login");
    }
});
app.post("/buy", (req, res)=>{
    res.render("success", {logLink: "logout", regLog: "Logout"});
});

app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
