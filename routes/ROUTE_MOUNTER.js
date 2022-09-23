const authRouter = require("./auth");
const router = require("./instructor");
const express = require("express");

module.exports = app = express();
app.use("/auth", authRouter);
app.use("/instructor", router);
