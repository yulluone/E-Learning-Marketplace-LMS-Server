const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const completedSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },

    course: {
      type: ObjectId,
      ref: "Course",
    },
    lessons: [],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Completed", completedSchema);
