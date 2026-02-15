const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  getDashboardOverview,
  getDashboardStats,
  getProfit
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

/* ================= DASHBOARD ================= */

router.get("/dashboard-overview", protect, adminOnly, getDashboardOverview);
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/profit", protect, adminOnly, getProfit);

/* ================= USERS MANAGEMENT ================= */

// 🔍 Get Users (Search + Pagination)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-password");

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🗑 Delete User
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✏ Update User
router.put("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true }
    ).select("-password");

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
