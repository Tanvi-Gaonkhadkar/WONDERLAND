const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,


  },

  price: Number,
  location: String,
  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",

  },
  // geometry: {
  //   type: {

  //    type : String, // Don't do `< location , type? String >`
  //    enum: ['Point'], // "location.type" must be 'Point'
  //    required: true
  // },
  // coordinates: {
  //   type: [Number],
  //   required: true
  // }
  // },
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountain",
      "Castles",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Arctic",
      "Domes",
      "Boating"
    ]
  },

});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });

  }

})

const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema, "listings");

// This will bypass enum validation when fetching
Listing.schema.set("strict", false);

module.exports = Listing;

