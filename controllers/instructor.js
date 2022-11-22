const User = require("../models/user");
const Wallet = require("../models/wallet");
const Course = require("../models/course");

exports.makeInstructor = async (req, res) => {
  try {
    Wallet.create({
      _id: req.user.userId,
      mpesaNumber: req.body.mpesaNumber,
      mpesaName: req.body.mpesaName,
    });

    await User.findByIdAndUpdate(
      req.user.userId,

      {
        $addToSet: { role: "Instructor" },
      },

      { new: true },
      (err, user) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json({
            message:
              "Payment Details Updated Succesfully. You are now an instructor",
            user,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.user.userId).select("-password").exec();

    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.instructorCourses = async (req, res) => {
  try {
    console.log(req.user);
    const courses = await Course.find({ "instructor._id": req.user.userId })
      .sort({ createdAt: -1 })
      .exec();

    res.json(courses);
  } catch (err) {
    console.log(err);
  }
};
