// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose");

// const userSchema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
// });

// userSchema.plugin(passportLocalMongoose, {
//     usernameField: "email"   
// });

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {   // Add this if you want users to have a display name
        type: String,
        required: true
    }
});

// Use email as the login field
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);
