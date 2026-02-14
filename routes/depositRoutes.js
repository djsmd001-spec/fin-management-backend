const express = require("express");
const router = express.Router();

const {
  requestDeposit,
  getMyDeposits,
  getPendingDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit
} = require("../controllers/depositController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER
router.post("/request", protect, requestDeposit);
router.get("/my", protect, getMyDeposits);

// ADMIN
router.get("/pending", protect, adminOnly, getPendingDeposits);
router.get("/all", protect, adminOnly, getAllDeposits);
router.put("/approve/:id", protect, adminOnly, approveDeposit);
router.put("/reject/:id", protect, adminOnly, rejectDeposit);

module.exports = router;
