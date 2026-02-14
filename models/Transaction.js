const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["deposit", "penalty"],
      required: true
    },

    amount: Number,

    note: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
