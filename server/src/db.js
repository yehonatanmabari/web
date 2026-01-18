// src/db.js
const mongoose = require("mongoose");

async function connectDb() {
  const MONGO_URI = process.env.MONGO_URI;

  // Mongoose connection logs
  mongoose.connection.on("connected", () => console.log("✅ mongoose connected"));
  mongoose.connection.on("error", (e) => console.log("❌ mongoose error:", e.message));
  mongoose.connection.on("disconnected", () => console.log("⚠️ mongoose disconnected"));

  if (!MONGO_URI) {
    console.log("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to Mongo Atlas ✅");
}

module.exports = { connectDb, mongoose };
