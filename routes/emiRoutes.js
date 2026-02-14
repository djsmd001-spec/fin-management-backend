const express = require("express");
const router = express.Router();

const {
  getMyEMI,
  getEmiSummary,
  requestEmiPayment,
  approveEmi,
  rejectEmi,
  getPendingEmi,
  downloadEmiReceipt
} = require("../controllers/emiController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getEmiReceiptData } = require("../controllers/emiController");



// ================= USER =================
router.get("/my", protect, getMyEMI);
router.get("/summary", protect, getEmiSummary);
router.put("/pay/:id", protect, requestEmiPayment);
router.get("/receipt/:id", protect, downloadEmiReceipt);
router.get("/receipt-data/:id", protect, getEmiReceiptData);


// ================= ADMIN =================
router.get("/pending", protect, adminOnly, getPendingEmi);   // 🔥 THIS FIXES 404
router.put("/approve/:id", protect, adminOnly, approveEmi);
router.put("/reject/:id", protect, adminOnly, rejectEmi);

module.exports = router;
