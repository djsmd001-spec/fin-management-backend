const User = require("../models/User");
const Loan = require("../models/Loan");
const Deposit = require("../models/Deposit");
const Transaction = require("../models/Transaction");
const EMI = require("../models/EMI");

/* ===================================================
   🔥 FINAL MERGED ADMIN DASHBOARD OVERVIEW
=================================================== */

exports.getDashboardOverview = async (req, res) => {
  try {

    /* ================= USERS ================= */
    const totalUsers = await User.countDocuments();

    /* ================= LOANS ================= */
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "approved" });
    const pendingLoans = await Loan.countDocuments({ status: "pending" });

    /* ================= TOTAL LOAN AMOUNT ================= */
    const loanAgg = await Loan.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalLoanAmount = loanAgg[0]?.total || 0;

    /* ================= TOTAL DEPOSITS ================= */
    const depositAgg = await Deposit.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalDeposits = depositAgg[0]?.total || 0;

    const pendingDeposits = await Deposit.countDocuments({ status: "pending" });

    /* ================= PROFIT CALCULATION ================= */

    const approvedLoans = await Loan.find({ status: "approved" });

    let totalInterest = 0;
    approvedLoans.forEach((loan) => {
      totalInterest += (loan.totalAmount || 0) - loan.amount;
    });

    const penaltyAgg = await Transaction.aggregate([
      { $match: { type: "penalty" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPenalty = penaltyAgg[0]?.total || 0;

    const totalProfit = totalInterest + totalPenalty;

    /* ================= CURRENT MONTH PROFIT ================= */

    const currentMonth = new Date().getMonth() + 1;

    const monthlyInterestAgg = await Loan.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalLoanAmount: { $sum: "$amount" },
          totalFinalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const monthlyPenaltyAgg = await Transaction.aggregate([
      { $match: { type: "penalty" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalPenalty: { $sum: "$amount" }
        }
      }
    ]);

    const interestData = monthlyInterestAgg.find(m => m._id === currentMonth);
    const penaltyData = monthlyPenaltyAgg.find(p => p._id === currentMonth);

    const monthlyInterest =
      (interestData?.totalFinalAmount || 0) -
      (interestData?.totalLoanAmount || 0);

    const monthlyPenalty = penaltyData?.totalPenalty || 0;

    const monthlyProfit = monthlyInterest + monthlyPenalty;

    /* ================= FUND AVAILABLE ================= */
    const totalFundAvailable = totalDeposits - totalLoanAmount;

    /* ================= PENDING EMIs ================= */
    const pendingEMIs = await EMI.countDocuments({ status: "unpaid" });

    /* ================= MONTHLY LOAN CHART ================= */
    const monthlyLoanAgg = await Loan.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          loans: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyStats = monthlyLoanAgg.map(item => ({
      month: `Month ${item._id}`,
      loans: item.loans
    }));

    /* ================= RECENT LOANS ================= */
    const recentLoansData = await Loan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .lean();

    const recentLoans = recentLoansData.map(l => ({
      user: l.user?.name || "Unknown",
      amount: l.amount,
      status: l.status
    }));

    /* ================= RECENT DEPOSITS ================= */
    const recentDepositsData = await Deposit.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .lean();

    const recentDeposits = recentDepositsData.map(d => ({
      user: d.user?.name || "Unknown",
      amount: d.amount,
      status: d.status
    }));

    /* ================= FINAL RESPONSE ================= */

    res.json({
      totalUsers,
      totalLoans,
      activeLoans,
      pendingLoans,
      totalDeposits,
      pendingDeposits,
      totalLoanAmount,
      totalFundAvailable,
      totalProfit,
      monthlyProfit,
      pendingEMIs,
      monthlyStats,
      recentLoans,
      recentDeposits
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ===================================================
   EXISTING FUNCTIONS (UNCHANGED)
=================================================== */

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();

    const totalDepositsAgg = await Deposit.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalTransactionsAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalUsers,
      totalLoans,
      totalDeposits: totalDepositsAgg[0]?.total || 0,
      totalTransactions: totalTransactionsAgg[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProfit = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "approved" });

    let totalInterest = 0;
    loans.forEach((loan) => {
      totalInterest += (loan.totalAmount || 0) - loan.amount;
    });

    const penaltyAgg = await Transaction.aggregate([
      { $match: { type: "penalty" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalPenalty = penaltyAgg[0]?.total || 0;

    res.json({
      totalInterest,
      totalPenalty,
      totalProfit: totalInterest + totalPenalty
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
