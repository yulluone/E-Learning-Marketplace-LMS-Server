const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minLength: 200,
    },
    video_link: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

const courseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: {},
      minLength: 200,
      reqires: true,
    },
    lessons: {},
    price: {
      type: Number,
      default: 9.99,
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      red: "User",
      required: true,
    },
    lessons: [lessonSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
