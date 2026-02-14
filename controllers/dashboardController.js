const Deposit = require("../models/Deposit");
const Loan = require("../models/Loan");
const EMI = require("../models/EMI");

// ================= USER LOAN DASHBOARD =================
exports.getUserLoanOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Savings
    const deposits = await Deposit.find({ user: userId });
    const totalSavings = deposits.reduce(
      (sum, d) => sum + d.amount,
      0
    );

    // Eligible Loan = 70% of savings
    const eligibleLoan = totalSavings * 0.7;

    // Active Loan
    const activeLoan = await Loan.findOne({
      user: userId,
      status: "approved"
    });

    // Pending Loans
    const pendingLoans = await Loan.countDocuments({
      user: userId,
      status: "pending"
    });

    // Next EMI
    const nextEMI = await EMI.findOne({
      user: userId,
      paid: false
    }).sort({ dueDate: 1 });

    // Outstanding
    let outstanding = 0;

    if (activeLoan) {
      const paidEMIs = await EMI.find({
        loan: activeLoan._id,
        paid: true
      });

      const paidAmount = paidEMIs.reduce(
        (sum, emi) => sum + emi.amount,
        0
      );

      outstanding = activeLoan.totalAmount - paidAmount;
    }

    res.json({
      totalSavings,
      eligibleLoan,
      activeLoan: activeLoan ? true : false,
      pendingLoans,
      nextEMIDate: nextEMI ? nextEMI.dueDate : null,
      outstanding
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
