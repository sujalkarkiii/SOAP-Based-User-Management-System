const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], trim: true, unique: true, lowercase: true },
    age:   { type: Number, required: [true, "Age is required"], min: [1, "Age must be at least 1"] },
    role:  { type: String, default: "user", enum: ["user", "admin", "moderator"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);