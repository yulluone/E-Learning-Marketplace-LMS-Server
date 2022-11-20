const express = require("express");
const formidable = require("express-formidable");

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
const {
  uploadImage,
  removeImage,
  create,
  readCourse,
  videoUpload,
  removeVideo,
  addLesson,
  updateCourse,
  deleteLesson,
} = require("../controllers/course");

//routes
router.post("/make-instructor", requireSignIn, makeInstructor);

router.get("/current-instructor", requireSignIn, currentInstructor);

router.post("/course/upload-image", uploadImage);

router.post("/course/remove-image", removeImage);

router.post("/course", requireSignIn, isInstructor, create);

//instructor dashbord courses
router.get("/instructor-courses", requireSignIn, instructorCourses);

router.get("/course/:slug", readCourse);

//lesson video	upload
router.post(
  "/course/video-upload/:instructorId",
  requireSignIn,
  formidable(),
  videoUpload
);

//remove video
router.post("/course/video-remove/:instructorId", requireSignIn, removeVideo);

//add lesson

router.post(
  "/course/lesson-add/:courseId/:instructorId",
  requireSignIn,
  addLesson
);

router.put("/course/edit/:slug", requireSignIn, isInstructor, updateCourse);

router.put("/course/delete/:slug/:lessonId", requireSignIn, isInstructor, deleteLesson);

module.exports = router;
