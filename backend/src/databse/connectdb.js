const mongoose = require("mongoose");

// FIX: Typo "Cpnnected" → "Connected"
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Atlas successfully");
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1); // FIX: Exit on DB failure so the app doesn't silently run without DB
  }
}

module.exports = connectDB;