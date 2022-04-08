// importing User Schema
const User = require("../models/user");
const passport = require("passport");

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
        // try {
        //   const authenticate = User.authenticate();
        //  authenticate(
        //     { username: req.body.username },
        //     { password: req.body.password },
        //     (err, result) => {
        //       if (err) {
        //         console.log(err);
        //         res.status(400).send("could not validate.");
        //       }
        //       if (user) {
        //         console.log("Authentication Successful");
        //       }
        //     }
        //   );
        // } catch (err) {
        //   console.log(err);
        // }
      }
    }
  );
};

exports.login = async (req, res, next) => {
  await passport.authenticate(
    { username: req.body.username },
    { password: req.body.password },
    function (user, info, err) {
      if (err) {
        console.log(err);
        console.log(info);
        res.json(err);
        next();
      }
      if (user) {
        console.log("login success");
        res.json(user);
        next();
      }
    }
  );
};
