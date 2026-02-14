const Loan = require("../models/Loan");
const EMI = require("../models/EMI");

// ================= USER REQUEST =================
exports.requestLoan = async (req, res) => {
  try {
    const { amount, duration } = req.body;

    if (!amount || !duration) {
      return res.status(400).json({
        message: "Amount and Duration required"
      });
    }

    const interest = (amount * 6 * duration) / 100;
    const totalAmount = Number(amount) + interest;

    const loan = await Loan.create({
      user: req.user.id,
      amount: Number(amount),
      duration: Number(duration),
      totalInterest: interest,
      totalAmount,
      status: "pending"
    });

    res.status(201).json(loan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= USER LOAN HISTORY =================
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(loans);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN PENDING =================
exports.getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(loans);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN ALL =================
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(loans);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN APPROVE =================
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan)
      return res.status(404).json({ message: "Loan not found" });

    if (loan.status === "approved")
      return res.json({ message: "Already approved" });

    loan.status = "approved";
    await loan.save();

    const emiAmount = loan.totalAmount / loan.duration;

    for (let i = 1; i <= loan.duration; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      await EMI.create({
        loan: loan._id,
        user: loan.user,
        emiNumber: i,
        amount: emiAmount,
        dueDate,
        status: "unpaid"
      });
    }

    res.json({ message: "Loan Approved & EMI Generated" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN REJECT =================
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan)
      return res.status(404).json({ message: "Loan not found" });

    loan.status = "rejected";
    await loan.save();

    res.json({ message: "Loan Rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
