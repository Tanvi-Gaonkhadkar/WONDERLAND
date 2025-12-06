
const Listing = require("../models/listing");
require("../cloudConfig");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings, activeCategory: null });

};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs"); // works fine since no dynamic variables
};

// Show single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author", select: "name" },
    })
    .populate("owner");
  //     console.log("🔍 LISTING SENT TO EJS:", listing);
  // console.log("Coordinates:", listing?.geometry);


  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  console.log(listing);

  res.render("listings/show.ejs", {
    listing,
    // mapToken: process.env.MAP_TOKEN   // 🔥 IMPORTANT LINE ADDED
  });
};

// Create new listing
// module.exports.createListing = async (req, res) => {
//   try {
//     if (!req.file) {
//       req.flash("error", "Please upload an image!");
//       return res.redirect("/listings/new");
//     }

//     const response = await geocodingClient
//       .forwardGeocode({
//         query: req.body.listing.location,
//         limit: 1,
//       })
//       .send();

//     const { path: url, filename } = req.file;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };

//     if (response.body.features.length > 0) {
//   newListing.geometry = response.body.features[0].geometry;
// } else {
//   console.log("No coordinates found for location:", req.body.listing.location);
//   // fallback coordinates for Delhi
//   newListing.geometry = {
//     type: "Point",
//     coordinates: [77.2167, 28.6667] // Delhi coordinates
//   };
// }


//     let savedListing=await newListing.save();
//     console.log(savedListing);

//     req.flash("success", "New Listing created!");
//     res.redirect("/listings");

//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong while creating listing!");
//     res.redirect("/listings/new");
//   }
// };

// module.exports.createListing = async (req, res, next) => {
//     let response = await geocodingClient
//         .forwardGeocode({
//             query: req.body.listing.location,
//             limit: 1,
//         })
//         .send();
//     response.body.features[0].geometry;
//     res.send();

//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };
//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
  try {
    // Geocoding
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    const geometry = response.body.features[0].geometry;

    // Image uploaded via multer-storage-cloudinary
    const url = req.file.path;
    const filename = req.file.filename;

    // Create new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = geometry; // save coordinates
    newListing.image = { url, filename };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/listings/new");
  }
};


// Render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  console.log("Clicked");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // Optional: create resized image URL for editing preview
  let originalImageUrl = listing.image?.url || "/images/default.jpg";

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (req.file) {
      listing.image.url = req.file.path;      // Cloudinary URL
      listing.image.filename = req.file.filename;
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong while updating listing!");
    res.redirect("/listings");
  }
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong while deleting listing!");
    res.redirect("/listings");
  }
};
