const express = require("express");
const requireSignIn = require("../middlewares");
const authRouter = express.Router();
// controllers
const AuthController = require("../controllers/auth");
// const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");

authRouter.post("/login", AuthController.login);

authRouter.post("/register", AuthController.register);

authRouter.get("/logout", AuthController.logout);

authRouter.get(
  "/current-user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(jwt_payload);
    res.status(200).json({
      success: true,
      msg: "You are successfully authenticated to this route!",
    });
    
  }
);

module.exports = authRouter;
