const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI environment variable is missing! Please configure it in Render environment settings.");
      return;
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
  }
};

module.exports = connectDB;