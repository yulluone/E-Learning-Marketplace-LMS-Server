const express = require("express");

const router = express.Router();

const User = require("../models/user");
const Wallet = require("../models/wallet");

//middleware
const { requireSignIn } = require("../middlewares");

//controllers
const InstructorController = require("../controllers/instructor");

router.post(
  "/make-instructor",
  requireSignIn,
  InstructorController.makeInstructor
);

router.get(
  "/current-instructor",
  requireSignIn,
  InstructorController.currentInstructor
);

module.exports = router;
