
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const Listing = require("../models/listing");
const listingController = require("../controllers/listing.js");
const categories = require("../utils/categories");

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else next();
};

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.post(
  "/",
  isLoggedIn,
upload.single("listing[image]"),
validateListing,
  wrapAsync(listingController.createListing)
);


router.get("/", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", {
    allListings: listings,
    categories,
    activeCategory: null,
    searchQuery: "",
  });
}));


router.get("/search", wrapAsync(async (req, res) => {
  const { q } = req.query;

  let listings;

  if (!q || q.trim() === "") {
    listings = await Listing.find({});
  } else {
    listings = await Listing.find({
      title: { $regex: q, $options: "i" }
    });
  }

  res.render("listings/index", {
    allListings: listings,
    categories,
    activeCategory: null,
    searchQuery: q || ""
  });
}));

router.get("/category/:cat", wrapAsync(async (req, res) => {
  const category = req.params.cat.trim(); 
  console.log("Category param:", category);

  
  const listings = await Listing.find({
    category: { $regex: `^${category}$`, $options: "i" }
  });

  console.log("Found listings:", listings.length, listings.map(l => l.title));

  res.render("listings/index", {
    allListings: listings,
    categories,
    activeCategory: category,
    searchQuery: ""
  });
}));


router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);


router.get("/:id", wrapAsync(listingController.showListing));

router.delete("/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);


module.exports = router;
