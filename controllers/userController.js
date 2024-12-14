const User = require("../models/userModel");

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        next(err);
      }
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust! You are logged in!");
  let redirectUrl = res.locals.redirectUrl;
  if (redirectUrl) {
    return res.redirect(res.locals.redirectUrl);
  }
  res.redirect("/listings");
};

module.exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out.");
    res.redirect("/listings");
  });
};

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("./users/login.ejs");
};
