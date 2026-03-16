require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const anomalyRoutes = require("./routes/anomalyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug route
app.get("/", (req, res) => {
  res.json({ message: "Server is running ðŸš€" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/anomaly", anomalyRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected âœ…");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000 ðŸš€");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
