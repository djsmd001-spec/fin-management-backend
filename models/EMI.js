const mongoose = require("mongoose");

const emiSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    emiNumber: Number,
    amount: Number,
    dueDate: Date,

    penalty: {
      type: Number,
      default: 0
    },

    transactionId: {
      type: String,
      default: ""
    },

    paymentMode: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["unpaid", "pending", "paid"],
      default: "unpaid"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EMI", emiSchema);
