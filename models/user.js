const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      //removes white spaces at the begining and end incase user clicks by mistake
      trim: true,
      //a user will not be created if field is not provided
      required: true,
    },

    username: {
      type: String,
      //removes white spaces at the begining and end incase user clicks by mistake
      trim: true,
      //a user will not be created if field is not provided
      required: true,
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      required: true,
      //no two users can have the same email
      unique: true,
    },
    password: {},
    picture: {
      type: String,
      default: "/avatar.png",
    },
    role: {
      type: [String],
      //default role
      default: ["Subscriber"],
      //only these roles can be saved in the DB
      enum: ["Subscriber", "Instrutor", "Admin"],
    },
    //for building market place and implementing payment system
    stripe_account_id: "",
    stripe_sellers: {}, //w
    stripeSession: {},
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],

    shortCode: {
      type: String,
    },
  },

  { timestamps: true }
);

// plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

//export as a model
module.exports = mongoose.model("User", userSchema);
