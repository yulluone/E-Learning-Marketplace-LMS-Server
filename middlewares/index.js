const expressJwt = require("express-jwt");
const User = require("../models/user");
const unirest = require("unirest");

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
exports.getSafAuthToken = async (req, res, next) => {
  try {
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + date.getMonth() + 11).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    //generate base64 password
    const password = Buffer.from(
      `${process.env.SAF_BUSINESS_SHORT_CODE}+${process.env.SAF_PASS_KEY}+${timestamp}`
    ).toString("base64");
    console.log("password", password);

    //generate auth token
    const auth = new Buffer.from(
      `${process.env.SAF_CONSUMER_KEY}:${process.env.SAF_CONSUMER_SECRET}`
      // "duxYp3TuxAClnHfohwtfXZyrLT87XliG:qXbGBvs3PPnTC0P4"
    ).toString("base64");
    console.log(`BASIC => ${auth}`);

    //Get access token from safaricom

    const getToken = await unirest
      .get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      )
      .headers({
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      })
      .send();
    console.log("GETTOKEN =>", getToken.body.access_token);
    const token = getToken.body.access_token;
    next(token, timestamp, password);

    console.log("TIMESTAMP =>", timestamp);
  } catch (err) {
    console.log(err);
    return res.send("error getting token");
  }
};
