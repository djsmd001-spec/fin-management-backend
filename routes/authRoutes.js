const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// 🔥 Secure Token Based Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/admin-reset-password", adminResetPassword);

module.exports = router;
