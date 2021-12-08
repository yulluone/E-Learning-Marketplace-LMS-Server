const express = require("express");
const authRouter = express.Router();
const  register  = require("../controllers/auth");

authRouter.route("/register").post(register);

module.exports = authRouter;