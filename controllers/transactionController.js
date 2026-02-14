const Transaction = require("../models/Transaction");

// USER - Get My Transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADMIN - Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
