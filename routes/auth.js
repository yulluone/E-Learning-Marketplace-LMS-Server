const express = require("express");
const { requireSignIn } = require("../middlewares");
const authRouter = express.Router();
// controllers
const AuthController = require("../controllers/auth");

authRouter.post("/login", AuthController.login);

authRouter.post("/register", AuthController.register);

authRouter.get("/logout", AuthController.logout);

authRouter.get("/current-user", requireSignIn, AuthController.currentUser);

authRouter.post("/forgot-password", AuthController.forgotPassword);

authRouter.post("/password-reset", AuthController.passwordReset);

authRouter.get("/courses", AuthController.getAllCourses);

authRouter.get("/course/:slug", requireSignIn, AuthController.getCourse);

authRouter.post(
  "/check-enrollment/:courseId",
  requireSignIn,
  AuthController.getCourse
);

authRouter.post(
  "/free-enrollment/:slug",
  requireSignIn,
  AuthController.freeEnrollemnt
);

authRouter.post(
  "/paid-enrollment/:slug",
  requireSignIn,
  AuthController.paidEnrollemnt
);

authRouter.post(
  "/mpesa/transaction/callback/:slug/:userId",
  AuthController.mpesaCallback
);

authRouter.post("/mark-completed", requireSignIn, AuthController.markCompleted);

authRouter.post(
  "/completed-lessons",
  requireSignIn,
  AuthController.completedLessons
);

module.exports = authRouter;
