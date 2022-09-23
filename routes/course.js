const express = require("express");

const courseRouter = require("./instructor");

//middleware
const { requireSignIn } = require("../middlewares");

//controllers
const uploadImage = require("../controllers/course");

router.post("/course/upload-image", uploadImage);

module.exports = courseRouter;
