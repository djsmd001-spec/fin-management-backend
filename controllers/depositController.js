const Deposit = require("../models/Deposit");
const Transaction = require("../models/Transaction");

// ================= USER REQUEST =================
exports.requestDeposit = async (req, res) => {
  try {
    const { amount, paymentMode, transactionId, paymentDate } = req.body;

    if (!amount || !paymentMode || !transactionId || !paymentDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔥 PENALTY CALCULATION
    const payDate = new Date(paymentDate);
    const day = payDate.getDate();

    let penalty = 0;
    if (day > 5) {
      penalty = (day - 5) * 50;
    }

    const deposit = await Deposit.create({
      user: req.user.id,
      amount: Number(amount),
      paymentMode,
      transactionId,
      paymentDate: payDate,
      penalty,
      status: "pending"
    });

    res.status(201).json({ message: "Deposit Request Sent", deposit });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= USER HISTORY =================
exports.getMyDeposits = async (req, res) => {
  const deposits = await Deposit.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(deposits);
};


// ================= ADMIN PENDING =================
exports.getPendingDeposits = async (req, res) => {
  const deposits = await Deposit.find({ status: "pending" })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(deposits);
};


// ================= ADMIN APPROVE =================
exports.approveDeposit = async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);

  if (!deposit)
    return res.status(404).json({ message: "Deposit not found" });

  deposit.status = "approved";
  await deposit.save();

  // 🔥 Create Deposit Transaction
  await Transaction.create({
    user: deposit.user,
    type: "deposit",
    amount: deposit.amount,
    note: "Deposit Approved"
  });

  // 🔥 Create Penalty Transaction if exists
  if (deposit.penalty > 0) {
    await Transaction.create({
      user: deposit.user,
      type: "penalty",
      amount: deposit.penalty,
      note: "Late Deposit Penalty"
    });
  }

  res.json({ message: "Deposit Approved & Transactions Created" });
};


// ================= ADMIN REJECT =================
exports.rejectDeposit = async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);

  if (!deposit)
    return res.status(404).json({ message: "Deposit not found" });

  deposit.status = "rejected";
  await deposit.save();

  res.json({ message: "Deposit Rejected" });
};

// ================= ADMIN ALL HISTORY =================
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
