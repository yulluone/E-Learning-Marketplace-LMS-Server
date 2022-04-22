const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");

exports.register = async (req, res) => {
  User.register(
    { name: req.body.name, username: req.body.username, email: req.body.email },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err.name);
        switch (err.name) {
          case "MissingPasswordError":
            return res.status(400).send("Password required");
            break;
          case "MissingUsernameError":
            return res.status(400).send("Email Required");
            break;
          case "UserExistsError":
            return res.status(400).send("Email already taken");
            break;
          default:
            return res.status(400).send("Your account could not be saved.");
        }
      } else {
        // console.log(user);
        res.send("Registration Succesful");
      }
    }
  );
};

exports.login = async (req, res) => {
  await passport.authenticate(
    "local",
    { session: false },
    (err, user, info) => {
      if (err) {
        console.log(err, info);
        res.status(500).json({ ok: false, message: "Server error." });
      }
      if (!user) {
        console.log("Username or Password incorrect");
        res.json({ ok: false, message: "Username or Password incorrect" });
      } else {
        const payloadObj = {
          userId: user._id,
          username: user.username,
        };

        const token = jwt.sign(payloadObj, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        user.hash = undefined;
        user.salt = undefined;
        res.json({ ok: true, user, token, message: "Auth Success" });
      }
    }
  )(req, res);
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
    const user = await User.findById(req.user.userId)
      .select("-password")
      .exec();
    return res.json({ user, ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const shortCode = nanoid(6).toUpperCase();
  if (!req.body.success) {
    try {
      let user = await User.findOneAndUpdate(
        { email },
        { shortCode: shortCode }
      );

      if (!user)
        return res
          .status(200)
          .json({ message: "No user with such an email found." });

      let testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        name: "email.com",
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      let info = await transporter.sendMail({
        from: `${process.env.USER}`,
        to: `${email}`,
        subject: "Password Reset",
        text: "use code to reset your email",
        html: `<h2>${shortCode}</h2>`,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("info", testAccount.user, testAccount.pass);

      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.json(info);
    } catch (err) {
      console.log(err);
    }
  } else {
    if (!req.body.codeValid) {
      try {
        let code = req.body.code;
        let data = await User.findOne({ email });
        if (data.shortCode === code) {
          res.status(200).json({
            codeValid: true,
            message: "short code validated, enter new password",
          });
        } else {
          res.json({ codeValid: false, message: "Enter Correct Code" });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      let code = req.body.code;
      // let email = req.body.email
      let  data  = await User.findOne({ email: req.body.email});
      if (data.shortCode === code) {
        try {
          User.findByUsername(req.body.email).then((sanitizedUser) => {
            if (sanitizedUser) {
              sanitizedUser.setPassword(req.body.newPassword, () => {
                sanitizedUser.save();
                res.status(200).json({ message: "password reset successful" });
              });
            } else {
              res.status(500).json({ message: "This user does not exist" });
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
};

exports.passwordReset = async = (req, res) => {
  const code = req.body.code;
};
