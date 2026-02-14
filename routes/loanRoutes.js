const express = require("express");
const router = express.Router();

const {
  requestLoan,
  getMyLoans,
  getPendingLoans,
  getAllLoans,
  approveLoan,
  rejectLoan
} = require("../controllers/loanController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER
router.post("/request", protect, requestLoan);
router.get("/my", protect, getMyLoans);

// ADMIN
router.get("/pending", protect, adminOnly, getPendingLoans);
router.get("/all", protect, adminOnly, getAllLoans);
router.put("/approve/:id", protect, adminOnly, approveLoan);
router.put("/reject/:id", protect, adminOnly, rejectLoan);

module.exports = router;
