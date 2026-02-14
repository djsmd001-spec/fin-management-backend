const cron = require("node-cron");
const EMI = require("../models/EMI");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

module.exports = () => {
  // Runs daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running Penalty Cron Job...");

    const overdueEMIs = await EMI.find({
      paid: false,
      dueDate: { $lt: new Date() }
    });

    for (let emi of overdueEMIs) {
      const today = new Date();

      const daysLate = Math.ceil(
        (today - emi.dueDate) / (1000 * 60 * 60 * 24)
      );

      const newPenalty = daysLate * 50;

      if (newPenalty > emi.penalty) {
        const diff = newPenalty - emi.penalty;

        emi.penalty = newPenalty;
        await emi.save();

        // Create penalty transaction
        await Transaction.create({
          user: emi.user,
          type: "penalty",
          amount: diff,
          referenceId: emi._id
        });

        // Create notification
        await Notification.create({
          user: emi.user,
          message: `Penalty added ₹${diff} for EMI #${emi.emiNumber}`
        });
      }
    }
  });
};
