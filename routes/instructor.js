const express = require("express");

const router = express.Router();

const User = require("../models/user");
const Wallet = require("../models/wallet");

//middleware
const { requireSignIn, isInstructor } = require("../middlewares");

//controllers
const {
  currentInstructor,
  makeInstructor,
  instructorCourses,
} = require("../controllers/instructor");
const { uploadImage, removeImage, create } = require("../controllers/course");

//routes
router.post("/make-instructor", requireSignIn, makeInstructor);

router.get("/current-instructor", requireSignIn, currentInstructor);

router.post("/course/upload-image", uploadImage);

router.post("/course/remove-image", removeImage);

router.post("/course", requireSignIn, isInstructor, create);

//instructor dashbord courses
router.get("/instructor-courses", requireSignIn, instructorCourses);

module.exports = router;
