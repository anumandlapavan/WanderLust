if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/userModel.js");

const listingRouter = require("./routes/listingRoute.js");
const reviewRouter = require("./routes/reviewRoute.js");
const userRouter = require("./routes/userRoute.js");
const listingController = require("./controllers/listingController.js");

let dbUrl = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.MONGO_SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongo session store", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews/", reviewRouter);
app.use("/", userRouter);

app.get("/",listingController.index);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found."));
});

app.listen(8080, () => {
  console.log("console is listening to port 8080");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong." } = err;
  console.log(err);
  res.status(statusCode).render("./listings/error.ejs", { err });
});

