const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.register = async (req, res) => {
  User.register(
    { name: req.body.name, username: req.body.username, email: req.body.email },
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
        res.status(500).json({ ok: false, message: "Server error." });
      }
      if (!user) {
        console.log("Username or Password incorrect");
        res.json({ ok: false, message: "Username or Password incorrect" });
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
        res.json({ ok: true, user, token, message: "Auth Success" });
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
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .exec();
    return res.json({user, ok: true});
  } catch (err) {
    console.log(err);
  }
};
