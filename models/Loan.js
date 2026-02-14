const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
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

    interestRate: {
      type: Number,
      default: 6
    },

    duration: {
      type: Number,   // months (1,2,3,6,8,12)
      required: true
    },

    totalInterest: Number,
    totalAmount: Number,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    approvalDate: Date,
    disbursementDate: Date,
    adminRemarks: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
