const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  adminResetPassword   // 🔥 ADD THIS LINE
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔥 Admin Bypass Reset
router.post("/admin-reset-password", adminResetPassword);

module.exports = router;
