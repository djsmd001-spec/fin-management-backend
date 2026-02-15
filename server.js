// Load environment variables FIRST
require("dotenv").config();

// Start cron jobs
require("./cron/penaltyCron")();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const nodemailer = require("nodemailer");

const app = express();

// Connect Database
connectDB();

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fin-management-frontend.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).send("FIN Backend Running 🚀");
});

// ================= TEST MAIL ROUTE =================
app.get("/api/test-mail", async (req, res) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "gorakhekhande2001@gmail.com",
      subject: "Railway Test Mail 🚀",
      text: "Gorakh, Gmail successfully working on Railway!"
    });

    res.json({
      success: true,
      message: "Email Sent Successfully ✅"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/deposits", require("./routes/depositRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/emi", require("./routes/emiRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server Error" });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
