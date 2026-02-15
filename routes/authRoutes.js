const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  adminResetPassword
} = require("../controllers/authController");

// 🔐 Import Middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ================= AUTH ROUTES =================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// User Forgot Password (Token Based)
router.post("/forgot-password", forgotPassword);

// User Reset Password via Token
router.post("/reset-password/:token", resetPassword);

// ================= ADMIN RESET (SECURE) =================
// Only logged-in admin can reset any user password
router.post(
  "/admin-reset-password",
  protect,       // Verify JWT
  adminOnly,     // Check role === admin
  adminResetPassword
);

module.exports = router;
