const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User Registered Successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If this email exists, reset link generated."
      });
    }

    const today = new Date();

    // 🔥 Daily limit check
    if (
      user.lastForgotRequest &&
      user.lastForgotRequest.toDateString() === today.toDateString()
    ) {
      return res.status(429).json({
        message:
          "You already requested password reset today. Contact admin."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.lastForgotRequest = today;

    await user.save();

    res.json({
      message: "Reset link generated successfully",
      resetLink: `https://fin-management-frontend.vercel.app/reset-password/${token}`
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 🔐 Strong password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars with uppercase, lowercase & number"
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({
        message: "Invalid or Expired Token"
      });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // 🔥 Auto logout all sessions
    user.passwordChangedAt = Date.now();

    await user.save();

    res.json({ message: "Password Reset Successfully ✅" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADMIN RESET (BYPASS DAILY LIMIT) =================
exports.adminResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars with uppercase, lowercase & number"
      });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = Date.now();

    await user.save();

    res.json({ message: "Password reset by admin successfully ✅" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
