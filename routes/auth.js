const express = require("express");
const authRouter = express.Router();
// controllers
const AuthController = require("../controllers/auth");

authRouter.post("/login", AuthController.login);
authRouter.post("/register", AuthController.register);
authRouter.get("/logout", AuthController.logout);

module.exports = authRouter;
