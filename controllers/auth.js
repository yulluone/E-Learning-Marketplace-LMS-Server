const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

exports.register = async (req, res) => {
  User.register(
    { username: req.body.username, email: req.body.email },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err.name);
        switch (err.name) {
          case "MissingPasswordError":
            return res.status(400).send("Password required");
            break;
          case "MissingUsernameError":
            return res.status(400).send("Email Required");
            break;
          case "UserExistsError":
            return res.status(400).send("Email already taken");
            break;
          default:
            return res.status(400).send("Your account could not be saved.");
        }
      } else {
        // console.log(user);
        res.send("Registration Succesful");
      }
    }
  );
};

exports.login = async (req, res) => {
  await passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        console.log(err, info);
        return res.status(500).send("server error");
      }
      if (!user) {
        console.log("Username or Password incorrect");
        return res.status(401).send("Username or Password Incorrect");
      } else {
        const payloadObj = {
          userId: user._id,
          username: user.username,
        };

        const token = jwt.sign(
          payloadObj,
          process.env.JWT_SECRET,
          { expiresIn: "7d" },
          { algorithm: "RS256" }
        );
        user.hash = undefined;
        user.salt = undefined;
        res.json({ user, token, message: "Auth Success" });
        // res.send("Auth Succcess");
      }
    }
  )(req, res);
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "SignOut Success!" });
  } catch (err) {
    console.log(err);
  }
};

// exports.currentUser = async (req, res) => {
//   const options = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET,
//     algorithms: ["RS256"],
//   };

//   try {
//     await passport.authenticate("jwt", options, (req, res, next) => {
//       console.log(res)
//       res.send("sucess")
//       next()
//     } )(req, res)
//   } catch (err) {
//     console.log(err);
//   }
// };
