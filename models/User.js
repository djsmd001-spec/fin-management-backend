const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    // 🔐 Token Based Reset
    resetToken: String,
    resetTokenExpiry: Date,
    lastForgotRequest: Date,

    // 🔥 Session control (auto logout after reset)
    passwordChangedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
