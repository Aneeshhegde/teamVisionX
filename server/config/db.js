const mongoose = require("mongoose");
const seedDefaultData = require("./seed");

let mongoServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && !uri.includes("<username>")) {
    try {
      console.log(`Connecting to MongoDB at ${uri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log("✅ MongoDB Connected");
      await seedDefaultData();
      return;
    } catch (error) {
      console.warn("⚠️  Direct MongoDB connection failed:", error.message);
      console.log("🔄 Falling back to in-memory MongoDB for development...");
    }
  }

  // Fallback to MongoMemoryServer for seamless local development
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongoServerInstance = await MongoMemoryServer.create();
    const memoryUri = mongoServerInstance.getUri();

    await mongoose.connect(memoryUri);
    console.log("✅ MongoDB In-Memory Database Connected successfully (Development mode)");
    await seedDefaultData();
  } catch (error) {
    console.error("❌ Database Connection Failed entirely:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;