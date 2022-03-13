const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");


const requireSignIn = (async = jwt({
  getToken: (req, res) => {
    // console.log(req);
    req.token;
  },
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256 "],
}));

module.exports = requireSignIn;
