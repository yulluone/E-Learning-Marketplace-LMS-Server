const express = require("express");
const requireSignIn = require("../middlewares");
const authRouter = express.Router();
// controllers
const AuthController = require("../controllers/auth");
const UserAuth = require("../controllers/userAuth");

authRouter.post("/login", UserAuth.login);
authRouter.post("/register", UserAuth.register);
authRouter.get("/logout", AuthController.logout);
authRouter.get("/current-user", requireSignIn, AuthController.currentUser);

module.exports = authRouter;
