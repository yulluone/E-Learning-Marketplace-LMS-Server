const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");

const requireSignIn = (req, res) => {
  console.log(req.body);
  //  expressJwt({
  //   getToken: (req, res) => {
  //     console.log(req.data);
  //     // req.token;
  //   },
  //   secret: process.env.JWT_SECRET,
  //   algorithms: ["HS256 "],
  // });
};

module.exports = requireSignIn;
