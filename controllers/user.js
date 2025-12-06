const User= require("../models/user");


module.exports.SignUp = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wonderlust!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};


module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup");
};

module.exports.renderLoginForm=(req,res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
