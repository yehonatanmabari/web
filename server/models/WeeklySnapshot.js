const mongoose = require("mongoose");

const WeeklySnapshotSchema = new mongoose.Schema(
  {
    snapshotAt: { type: Date, default: Date.now, index: true },
    weekKey: { type: String, index: true },
    username: { type: String, index: true },
    data: { type: Object, required: true }, // צילום מצב של המשתמש
  },
  { versionKey: false }
);

module.exports = mongoose.model(
  "WeeklySnapshot",
  WeeklySnapshotSchema,
  "weekly_snapshots"
);
