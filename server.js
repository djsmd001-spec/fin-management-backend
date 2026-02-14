require("./cron/penaltyCron")();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FIN Backend Running 🚀");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/deposits", require("./routes/depositRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/emi", require("./routes/emiRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/emi", require("./routes/emiRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
