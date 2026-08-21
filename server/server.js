const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Backend is Running 🚀");
});

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on http://127.0.0.1:${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});