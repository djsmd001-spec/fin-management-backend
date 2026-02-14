const express = require("express");
const router = express.Router();

const {
  getDashboardOverview,
  getDashboardStats,
  getProfit,
  getAllUsers
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

/* ===================================================
   🔥 LIVE ADMIN DASHBOARD OVERVIEW
=================================================== */

router.get(
  "/dashboard-overview",
  protect,
  adminOnly,
  getDashboardOverview
);

/* ===================================================
   EXISTING ROUTES
=================================================== */

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/profit", protect, adminOnly, getProfit);
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
