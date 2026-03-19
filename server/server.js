require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const anomalyRoutes = require("./routes/anomalyRoutes");

const app = express();

// Middleware
app.use(require('./middleware/securityHeaders'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Debug route
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/anomaly", anomalyRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");

    // Auto midnight clock reset - resets clocked-in to pending every day at midnight
const cron = require("node-cron");
    cron.schedule("0 0 * * *", async () => {
      try {
        const Attendance = require("./models/Attendance");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const result = await Attendance.updateMany(
          { date: today, status: "clocked-in" },
          { status: "pending", updatedAt: new Date() }
        );
        console.log(`🕐 Midnight reset: Updated ${result.modifiedCount} clocked-in records for ${today}`);
      } catch (error) {
        console.error('Midnight reset failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000 🚀");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
