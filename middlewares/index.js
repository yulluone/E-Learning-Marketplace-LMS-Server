const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.requireSignIn = expressJwt({
  getToken: (req, res) => req.headers.authorization,
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).exec();
    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
