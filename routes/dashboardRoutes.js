const express = require("express");
const router = express.Router();

const { getUserLoanOverview } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/loan-overview", protect, getUserLoanOverview);

module.exports = router;
