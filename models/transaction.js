const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    name: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    transactionId: {
      type: String,
    },

    mpesaNumber: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },
    transactionDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
