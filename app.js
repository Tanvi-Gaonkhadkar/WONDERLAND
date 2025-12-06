
require('dotenv').config();
console.log("SECRET:", process.env.SECRET);

// app.js
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js"); // Ensure only one import path
const Review = require("./models/review.js");

// Routes
const userRouter = require("./routes/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");

// DB URL
const dbUrl = process.env.ATLASDB_URL;
 console.log("Registered Mongoose models:", mongoose.modelNames());
 console.log("App DB:", dbUrl);


// Session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.log("Mongo Session Store Error:", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, User.authenticate())
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// View engine & middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, "public")));

// Temporary route to create demo user
app.get("/demouser", async (req, res) => {
  const fakeUser = new User({ email: "student@gmail.com" });
  const registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});


// Connect to DB and start server
async function main() {
  try {
    await mongoose.connect(dbUrl);
mongoose.connect(process.env.ATLASDB_URL)
  .then(() => {
    console.log("Connected to DB:", mongoose.connection.name); // should be wonderlust
  });


const collections = await mongoose.connection.db.listCollections().toArray();
console.log("Collections:", collections.map(c => c.name));

const listings = await mongoose.connection.db.collection("listings").find({}).toArray();
console.log("Listings directly from DB:", listings.length);

    // Use routes AFTER DB connection
    app.use("/", userRouter);
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);

    // Category route debug
    app.get("/listings/category/:cat", async (req, res) => {
      const category = req.params.cat.trim();
      console.log("Category being searched:", category);

      const allListings = await Listing.find({ category: category });
      console.log("Listings found:", allListings.length);

      res.render("listings/index", {
        allListings,
        activeCategory: category,
        searchQuery: req.query.q || "",
      });
    });

    app.get("/test-login", (req, res) => {
      res.render("users/login");
    });

    app.get("/", (req, res) => {
      res.redirect("/listings");
    });

    // Error handler
    app.use((err, req, res, next) => {
      const { statusCode = 500 } = err;
      if (!err.message) err.message = "Oh no, something went wrong!";
      res.status(statusCode).render("listings/error", { err });
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log("DB connection error:", err);
  }
}
mongoose.connection.once('open', () => {
  console.log("Connected to DB:", mongoose.connection.name);
});


main();
