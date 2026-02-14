const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

module.exports = router;
