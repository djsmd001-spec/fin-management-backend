const PDFDocument = require("pdfkit");
const User = require("../models/User");
const Loan = require("../models/Loan");
const Deposit = require("../models/Deposit");
const Transaction = require("../models/Transaction");

exports.generateReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();

    const deposits = await Deposit.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const penalties = await Transaction.aggregate([
      { $match: { type: "penalty" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalDeposits = deposits[0]?.total || 0;
    const totalPenalty = penalties[0]?.total || 0;

    let totalInterest = 0;
    const loans = await Loan.find({ status: "approved" });

    loans.forEach((loan) => {
      totalInterest += loan.totalAmount - loan.amount;
    });

    const totalProfit = totalInterest + totalPenalty;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("FIN Monthly Financial Report", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(14).text(`Total Users: ${totalUsers}`);
    doc.text(`Total Loans: ${totalLoans}`);
    doc.text(`Total Deposits: ₹${totalDeposits}`);
    doc.text(`Total Penalty Collected: ₹${totalPenalty}`);
    doc.text(`Total Interest Earned: ₹${totalInterest}`);
    doc.text(`Total Profit: ₹${totalProfit}`);

    doc.moveDown();
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`);

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
