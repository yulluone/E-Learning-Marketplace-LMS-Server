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

authRouter.post("/forgot-password", AuthController.forgotPassword)

authRouter.post("/password-reset", AuthController.passwordReset)

authRouter.get("/courses", AuthController.getAllCourses)

authRouter.get("/course/:slug", AuthController.getCourse)

module.exports = authRouter;
