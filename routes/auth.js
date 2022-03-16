const express = require("express");
const requireSignIn = require("../middlewares");
const authRouter = express.Router();
const passport = require("passport");
// controllers
const AuthController = require("../controllers/auth");
const UserAuth = require("../controllers/userAuth");
const User = require("../models/user");

// authRouter.get("/login", function (req, res) {
//   res.render("login", { user: req.user, message: req.flash("error") });
// });
// Router.post(
//   "/login",
//   User.authenticate("local", (err, user) => {
//     if (err) {
//       console.log(err);
//       res.status(400).send("login unsuccessful");
//     }
//     if (user) {
//       res.status(202).send("login success");
//     }
//   })
// );

// auth
authRouter.post("/login", UserAuth.login);
authRouter.post("/register", UserAuth.register);
authRouter.get("/logout", AuthController.logout);
authRouter.get("/current-user", requireSignIn, AuthController.currentUser);

module.exports = authRouter;
