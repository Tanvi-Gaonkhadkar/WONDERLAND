const express = require('express');
const app = express();
const session = require("express-session");
const flash = require("connect-flash");

const sessionOptions ={
    secret: "mysupersecretstring",
     resave: false, 
     saveUninitialized: true,

};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register", (req, res) => {
    let { name = "anonymous" } = req.query;
    req.session.name=name;
    req.flash("success","user registered successfully");
    res.redirect("/hello");
});

app.get("/hello", (req, res) => {
    
    res.render("page.ejs",{name:req.session.name,msg:req.flash("success")});
});

const PORT = process.env.PORT || 3000;  // fallback to 3000 for local dev
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

