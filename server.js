const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
// const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bodyParser = require("body-parser");

// require("./middlewares/authenticate");

require("dotenv").config();

// const csrfProtection = csrf({ cookie: true });

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

app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));

//port
const port = process.env.PORT || 8000;

//listening to our server
app.listen(port, () => console.log(`Server is running on port ${port}`));
