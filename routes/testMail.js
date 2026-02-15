const express = require("express");
const router = express.Router();
const transporter = require("../config/email");

router.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "gorakhekhande2001@gmail.com",
      subject: "Railway Test Mail 🚀",
      text: "Gorakh, Gmail successfully working on Railway!"
    });

    res.json({ success: true, message: "Email Sent Successfully ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
