const express = require("express");
const requireSignIn = require("../middlewares");
const authRouter = express.Router();
const User = require("../models/user");
// controllers
const AuthController = require("../controllers/auth");
const UserAuth = require("../controllers/userAuth");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// authRouter.post("/login", UserAuth.login);
// authRouter.post("/register", (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   console.log(password);
//   User.register({ username }, password, (user, info, err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(user, info);
//     }
//   });
//   res.send("success");
// });

authRouter.post("/register", UserAuth.register);
authRouter.post("/login", async (req, res) => {
  await passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log(err, info);
      return res.status(500).send("server error");
    }
    if (!user) {
      console.log("Username or Password incorrect");
      return res.status(401).send("Username or Password Incorrect");
    } else {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      user.hash = undefined;
      user.salt = undefined;
      res.cookie("token", token, {
        httpOnly: true,
        //secure: true, //only works on https
      });
      res.json(user);
      res.send("Auth Succcess");
    }
  })(req, res);
});
authRouter.get("/logout", AuthController.logout);
authRouter.get("/current-user", requireSignIn, AuthController.currentUser);

module.exports = authRouter;
