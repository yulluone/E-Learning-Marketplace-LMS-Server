const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    transactionId: {
      type: Number,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    phone: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },	
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
