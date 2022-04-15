const User = require("../models/user");
const jwt = require("jsonwebtoken");
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
      }
    }
  );
};

exports.login = async (req, res) => {
  await passport.authenticate(
    "local",
    { session: false },
    (err, user, info) => {
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

        const token = jwt.sign(payloadObj, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
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

exports.currentUser = async (req, res) => {
  console.log(req.cookies);
  // const token = req.headers.token;
  // const jwtPayload = jwt.verify(
  //   token,
  //   process.env.JWT_SECRET,
  //   (err, jwtPayload) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(401).jason(err);
  //     }
  //     if (jwtPayload) {
  //       return jwtPayload;
  //     }
  //   }
  // );

  // if (jwtPayload) {
  //   console.log(jwtPayload);
  //   User.findOne({ username: jwtPayload.username }, (err, user) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(401).json(err);
  //     }
  //     if (!user) {
  //       res.status(401).send("error.");
  //     } else {
  //       console.log("Succesfully authenticated to this route");
  //       res.status(200).json(user);
  //     }
  //   });
  // }
};
