const User = require("../models/user");
const Course = require("../models/course");
const Transaction = require("../models/transaction");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");
const Wallet = require("../models/wallet");
const axios = require("axios");
const Completed = require("../models/completed");

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
        console.log("Username or Password incorrect?");
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
      let data = await User.findOne({ email: req.body.email });
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

exports.getAllCourses = async (req, res) => {
  try {
    const all = await Course.find({ published: true })
      // .populate("instructor")
      .exec();
    res.json(all);
  } catch (err) {
    console.log(err);
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec();

    if (req.user && req.user.userId) {
      const user = await User.findById(req.user.userId).exec();
      let ids = [];
      let length = user && user.courses.length;
      // console.log("length", length);
      for (let i = 0; i < length; i++) {
        ids.push(user.courses[i].toString());
      }
      // console.log("course", course);

      let enrollmentStatus = ids.includes(course._id.toString());
      // console.log("status", status);

      if (enrollmentStatus) {
        return res.json({
          enrolled: enrollmentStatus,
          course,
        });
      }
    }

    for (let i = 0; i < course.lessons.length; i++) {
      if (!course.lessons[i].free_preview) {
        course.lessons[i].video = {};
      }
    }
    return res.json({
      enrolled: false,
      course,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    // console.log(req.body.courseId);
    const courseId = req.params.courseId;
    const user = await User.findById(req.user.userId).exec();
    let ids = [];
    let length = user && user.courses.length;
    for (let i = 0; i < length; i++) {
      ids.push(user.courses[i].toString());
    }
    const course = await Course.findById({ courseId }).exec();
    // console.log("course", course);

    let status = ids.includes(course._id.toString());
    console.log("status", status);

    res.json({
      enrolled: status,
      course,
    });
  } catch (err) {
    console.log(err);
  }
};

//enrollment

exports.freeEnrollemnt = async (req, res) => {
  try {
    if (!req.user) return res.status(400).send("Unauthorized");
    const slug = req.params.slug;

    // check if course is free
    const course = await Course.findOne({ slug }).exec();
    if (course.paid) return;

    const result = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { courses: course._id } },
      { new: true }
    ).exec();

    return res.json({
      message: "Congrats! You have succesfull enrolled on this course.",
      course,
    });
  } catch (err) {
    console.log(err);
  }
};

const unirest = require("unirest");
const MpesaPushSTK = require("../utils/MpesaPushSTK");
const { default: completed } = require("../models/completed");

exports.paidEnrollemnt = async (req, res) => {
  const courseSlug = req.params.slug;
  const userId = req.user.userId;
  const { mpesaNumber, price } = req.body;
  const transaction = await MpesaPushSTK(
    mpesaNumber,
    price,
    courseSlug,
    userId
  );
  console.log("transaction", transaction.raw_body);

  if (JSON.parse(transaction.raw_body).MerchantRequestID) {
    res
      .status(200)
      .send(
        "A push notification has been sent to your phone. Please	enter your pin to complete payment"
      );
  } else {
    res.status(504).send("Payment attempt failed");
  }
};

exports.mpesaCallback = async (req, res) => {
  const { CallbackMetadata } = req.body.Body.stkCallback;
  console.log(CallbackMetadata);

  const { slug, userId } = req.params;
  // console.log("mpesaCallback", CallbackMetadata);
  if (!CallbackMetadata) {
    res.send("ok");
    console.log("user did not complete payment");
    return;
  }
  try {
    const amount = CallbackMetadata.Item.find(
      (item) => item.Name === "Amount"
    ).Value;
    const transactionId = CallbackMetadata.Item.find(
      (item) => item.Name === "MpesaReceiptNumber"
    ).Value;
    const transactionDate = CallbackMetadata.Item.find(
      (item) => item.Name === "TransactionDate"
    ).Value;
    const mpesaNumber = CallbackMetadata.Item.find(
      (item) => item.Name === "PhoneNumber"
    ).Value;

    console.log(amount, transactionId, transactionDate, mpesaNumber);
    //find course paid for

    const course = await Course.findOne({ slug })
      .populate("instructor", "_id name")
      .exec();

    //add 70% to instructor wallet
    const updateBalance = await Wallet.findOneAndUpdate(
      { _id: course.instructor._id },
      {
        $inc: { balance: parseInt(amount) * 0.7 },
      }
    );
    console.log("updateBalance", updateBalance);

    //find user and add course id to courses array
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { courses: course._id } },
      { new: true }
    ).exec();
    console.log("user courses updated");

    //add transaction to db
    const transaction = await new Transaction({
      amount,
      transactionId,
      transactionDate,
      mpesaNumber,
      userId,
      instructorId: course.instructor._id,
    }).save();
    console.log("transaction recorded", transaction);

    res.send("ok");
  } catch (err) {
    console.log(err);
  }
};

//lesson completion
exports.markCompleted = async (req, res) => {
  if (!req.user) return res.status(400).send("Unauthorized");
  try {
    const { lessonId, courseId, lessonComplete } = req.body;
    const { userId } = req.user.userId;
    //check if document exists
    const exixts = await Completed.findOne({
      user: userId,
      course: courseId,
    }).exec();
    if (exixts) {
      //update
      const updated = await Completed.findOneAndUpdate(
        { user: userId, course: courseId },
        { $addToSet: { lessons: lessonId } },
        { new: true }
      ).exec();

      updated && res.json(updated.lessons);
    } else {
      //create new
      const completed = await new Completed({
        user: userId,
        course: courseId,
        lessons: [lessonId],
      }).save();

      completed && res.json(completed.lessons);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.completedLessons = async (req, res) => {
  if (!req.user) return res.status(400).send("Unauthorized");

  try {
    const { courseId } = req.body;
    const { userId } = req.user.userId;
    const list = await Completed.findOne({
      user: userId,
      course: courseId,
    }).exec();

    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

exports.markIncomplete = async (req, res) => {
  if (!req.user) return res.status(400).send("Unauthorized");

  try {
    const { lessonId, courseId } = req.body;
    const { userId } = req.user.userId;

    const updated = await Completed.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $pull: { lessons: lessonId },
      },
      { new: true }
    ).exec();
    updated && res.json(updated.lessons);
  } catch (err) {
    console.log(err);
  }
};

exports.balance = async (req, res) => {
  const { userId } = req.user;
  try {
    if (!userId) return res.status(400).send("Unauthorized");

    const wallet = await Wallet.findOne({ _id: userId }).exec();
    // console.log(wallet);
    res.json(wallet.balance);
  } catch (err) {
    console.log(err);
  }
};

//user courses
exports.userCourses = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findOne({ _id: userId }).select("courses").exec();
    //we find the id based what is in user.courses //note: enrolledcourses for paid and free=$in: user.courses
    const courses = await Course.find({ _id: { $in: user.courses } })
      .populate("instructor", "_id name")
      .exec();

    // console.log(courses);
    res.json(courses);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error fetching courses");
  }
};
