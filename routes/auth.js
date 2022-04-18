const express = require("express");
const {requireSignIn} = require("../middlewares");
const authRouter = express.Router();
// controllers
const AuthController = require("../controllers/auth");

authRouter.post("/login", AuthController.login);

authRouter.post("/register", AuthController.register);

authRouter.get("/logout", AuthController.logout);

authRouter.get(
  "/current-user", requireSignIn, AuthController.currentUser
);

module.exports = authRouter;
