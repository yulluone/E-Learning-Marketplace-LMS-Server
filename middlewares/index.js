const expressJwt = require("express-jwt");

exports.requireSignIn = expressJwt({
  getToken: (req, res) => req.headers.authorization,
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
