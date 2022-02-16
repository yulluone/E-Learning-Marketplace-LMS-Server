const authRouter = require("./auth");
const express = require("express");

module.exports = app = express();
app.use("/auth", authRouter);
