const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wealthx";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log("✅ MongoDB Connected:", uri);
  } catch (error) {
    console.log("⚠️ Standalone MongoDB not detected, starting in-memory MongoDB for development...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log("✅ In-Memory MongoDB Connected:", memoryUri);
    } catch (memErr) {
      console.error("❌ Database connection failed:", memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;