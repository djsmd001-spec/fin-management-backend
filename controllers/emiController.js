const EMI = require("../models/EMI");
const Loan = require("../models/Loan");
const Notification = require("../models/Notification");
const PDFDocument = require("pdfkit");


// ================= USER EMI LIST + AUTO PENALTY =================
exports.getMyEMI = async (req, res) => {
  try {
    const emis = await EMI.find({
      user: req.user.id
    }).sort({ emiNumber: 1 });

    const today = new Date();

    for (let emi of emis) {
      if (emi.status === "unpaid" && today > emi.dueDate) {
        const diffDays = Math.floor(
          (today - emi.dueDate) / (1000 * 60 * 60 * 24)
        );

        emi.penalty = diffDays > 0 ? diffDays * 50 : 0;
        await emi.save();
      }
    }

    res.json(emis);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= EMI SUMMARY =================
exports.getEmiSummary = async (req, res) => {
  try {
    const emis = await EMI.find({ user: req.user.id });

    const totalEmi = emis.length;

    const paidEmi = emis.filter(
      e => e.status === "paid"
    ).length;

    const remainingAmount = emis
      .filter(e => e.status !== "paid")
      .reduce((sum, e) => sum + e.amount + (e.penalty || 0), 0);

    res.json({
      totalEmi,
      paidEmi,
      remainingAmount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= USER REQUEST EMI PAYMENT =================
exports.requestEmiPayment = async (req, res) => {
  try {
    const { transactionId, paymentMode } = req.body;

    if (!transactionId || !paymentMode) {
      return res.status(400).json({
        message: "Transaction ID & Payment Mode required"
      });
    }

    const emi = await EMI.findById(req.params.id);

    if (!emi)
      return res.status(404).json({ message: "EMI not found" });

    if (emi.status === "paid")
      return res.status(400).json({ message: "Already paid" });

    emi.status = "pending";
    emi.transactionId = transactionId;
    emi.paymentMode = paymentMode;

    await emi.save();

    res.json({ message: "Payment Request Sent To Admin" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN APPROVE EMI =================
exports.approveEmi = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);

    if (!emi)
      return res.status(404).json({ message: "EMI not found" });

    emi.status = "paid";
    await emi.save();

    const loan = await Loan.findById(emi.loan);

    if (loan) {
      loan.totalAmount -= (emi.amount + (emi.penalty || 0));
      if (loan.totalAmount < 0) loan.totalAmount = 0;

      const unpaid = await EMI.find({
        loan: loan._id,
        status: { $ne: "paid" }
      });

      if (unpaid.length === 0) {
        loan.status = "completed";
      }

      await loan.save();
    }

    await Notification.create({
      user: emi.user,
      message: `EMI #${emi.emiNumber} approved`
    });

    res.json({ message: "EMI Approved" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= ADMIN REJECT EMI =================
exports.rejectEmi = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);

    if (!emi)
      return res.status(404).json({ message: "EMI not found" });

    emi.status = "unpaid";
    emi.transactionId = "";
    emi.paymentMode = "";

    await emi.save();

    await Notification.create({
      user: emi.user,
      message: `EMI #${emi.emiNumber} rejected`
    });

    res.json({ message: "EMI Rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= EMI RECEIPT PDF =================
exports.downloadEmiReceipt = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id)
      .populate("user")
      .populate("loan");

    if (!emi)
      return res.status(404).json({ message: "EMI not found" });

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=EMI-Receipt-${emi._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("EMI Payment Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`User: ${emi.user.name}`);
    doc.text(`Loan ID: ${emi.loan._id}`);
    doc.text(`EMI Number: ${emi.emiNumber}`);
    doc.text(`Amount: ₹${emi.amount}`);
    doc.text(`Penalty: ₹${emi.penalty || 0}`);
    doc.text(`Transaction ID: ${emi.transactionId || "-"}`);
    doc.text(`Payment Mode: ${emi.paymentMode || "-"}`);
    doc.text(`Status: ${emi.status}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN GET PENDING EMI =================
exports.getPendingEmi = async (req, res) => {
  try {
    const emis = await EMI.find({
      status: "pending"
    })
      .populate("user", "name email")
      .populate("loan", "amount");

    res.json(emis);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= EMI RECEIPT DOWNLOAD =================
exports.downloadEmiReceipt = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id)
      .populate("user", "name email")
      .populate("loan");

    if (!emi) {
      return res.status(404).json({ message: "EMI not found" });
    }

    if (emi.status !== "paid") {
      return res.status(400).json({
        message: "Receipt available only for paid EMI"
      });
    }

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=emi_receipt_${emi._id}.pdf`
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("EMI Payment Receipt", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(12).text(`Customer Name: ${emi.user.name}`);
    doc.text(`Email: ${emi.user.email}`);
    doc.text(`Loan ID: ${emi.loan._id}`);
    doc.text(`EMI Number: ${emi.emiNumber}`);
    doc.text(`Amount Paid: ₹${emi.amount}`);
    doc.text(`Penalty: ₹${emi.penalty || 0}`);
    doc.text(`Total Paid: ₹${emi.amount + (emi.penalty || 0)}`);
    doc.text(`Transaction ID: ${emi.transactionId}`);
    doc.text(`Payment Mode: ${emi.paymentMode}`);
    doc.text(`Payment Date: ${emi.updatedAt.toDateString()}`);

    doc.moveDown();
    doc.text("Thank you for your payment.");

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= EMI RECEIPT DATA =================
exports.getEmiReceiptData = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id)
      .populate("user", "name email")
      .populate("loan");

    if (!emi)
      return res.status(404).json({ message: "EMI not found" });

    if (emi.status !== "paid")
      return res.status(400).json({ message: "EMI not paid yet" });

    // Security: user sirf apna receipt download kare
    if (emi.user._id.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized access" });

    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    res.json({
      receiptNo: emi._id.toString().slice(-6),
      date: formatDate(emi.updatedAt),
      transactionId: emi.transactionId,
      name: emi.user.name,
      email: emi.user.email,
      loanId: emi.loan._id,
      emiNo: emi.emiNumber,
      emiAmount: emi.amount,
      lateFee: emi.penalty || 0,
      total: emi.amount + (emi.penalty || 0),
      paymentMode: emi.paymentMode
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
