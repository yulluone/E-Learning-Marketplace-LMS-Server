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
        //   authenticate("username", "password", (err, result) => {
        //     if (err) {
        //       console.log(err);
        //       res.status(400).send("could not validate.");
        //     } else {
        //       console.log("Authentication Successful");
        //     }
        //   });
        // } catch (err) {
        //   console.log(err);
        // }
      }
    }
  );
};

exports.login = async = (req, res) => {
  
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.log(info);
        res.status(401).send("Error");
      }

      if (user) {
        return res.json(user).status(202).send("Authentication success");
      }
    });
  } catch (err) {
    console.log(err);
  }
};
