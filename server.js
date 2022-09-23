const express = require("express");
//create express app
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
let User = require("./models/user");

require("dotenv").config();

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
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(cookieParser());

// app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(require("./routes/ROUTE_MOUNTER"));

//passport
app.use(passport.initialize());
// app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate({ session: false })));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//port
const port = process.env.PORT || 8000;

//listening to our server
app.listen(port, () => console.log(`Server is running on port ${port}`));
