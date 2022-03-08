const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    //first make sure that we are receiving data from front-end
    //console.log(req.body);
    //destructure values so its easy to use
    const { name, email, password } = req.body;
    //validation
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be minimum 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is already taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // view saved user
    console.log("saved user", user);

    //send response
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
    // send user as json reaponse
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
