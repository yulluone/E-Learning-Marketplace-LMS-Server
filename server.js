const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const sessions = require("express-session");
const User = require("./models/user.js");

require("dotenv").config();

const csrfProtection = csrf({ cookie: true });

//create express app
const app = express();

//mongoose
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => console.log("**DB CONNECTED**"))
  .catch((err) => console.log("DB CONNECTION ERR => ", err));

//apply middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(require("./routes/ROUTE_MOUNTER"));
app.use(cookieParser());
//csrf
// app.use(csrfProtection);

app.use(passport.initialize());
// app.use(passport.session());

// passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));

// passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//endpoit
// app.get("/auth/csrf-token", (req, res) => {
//   res.json({
//     csrfToken: req.csrfToken(),
//   });
// });

// const oneDay = 1000 * 60 * 60 * 24;
// app.use(
//   sessions({
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized: true,
//     cookie: { maxAge: oneDay },
//     resave: false,
//   })
// );

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   const err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

//port
const port = process.env.PORT || 8000;

//listening to our server
app.listen(port, () => console.log(`Server is running on port ${port}`));
