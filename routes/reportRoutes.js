const express = require("express");
const router = express.Router();
const { generateReport } = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/monthly", protect, adminOnly, generateReport);

module.exports = router;
