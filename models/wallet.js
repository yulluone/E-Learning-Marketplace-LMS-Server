const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema(
  {
    mpesaNumber: { type: Number, length: 12, required: true },
    mpesaName:{type: String, required: true,},
    balance: { type: Number, default: 0 },
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
