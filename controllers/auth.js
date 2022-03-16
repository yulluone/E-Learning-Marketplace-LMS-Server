const express = require("express"),
  User = require("../models/user"),
  passportLocalMongoose = require("passport-local-mongoose"),
  { hashPassword, comparePassword } = require("../utils/auth");

exports.register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, password } = req.body;
    // validation
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    // console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    //check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("User not Found");

    //check password
    const match = await comparePassword(password, user.password);
    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //returnuser and token to client, exclide hashed password
    user.password = undefined;
    // send token in cookie with http only flag(so its not accesible using js)
    res.cookie("token", token, {
      httpOnly: true,
      // secure:true, //only works on https
    });
    // send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try Again");
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "SignOut Success!" });
  } catch (err) {
    console.log(err);
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await User.finfByid(req.user._id).select("-password").exec();
    console.log("CURRENT USER", user);
    return res.json(user);
  } catch (err) {
    console.log(err);
  }
};
