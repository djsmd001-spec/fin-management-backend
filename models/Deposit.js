const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentMode: {
      type: String,
      required: true
    },

    transactionId: {
      type: String,
      required: true
    },

    paymentDate: {
      type: Date,
      required: true
    },

    penalty: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deposit", depositSchema);
