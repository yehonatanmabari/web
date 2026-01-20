const mongoose = require("mongoose");

const WEEK_LEN = 7;
const weekDefault = (val = 0) => Array.from({ length: WEEK_LEN }, () => val);

const weekField = (name, def = 0) => ({
  type: [Number],
  default: () => weekDefault(def),
  validate: {
    validator: (arr) => Array.isArray(arr) && arr.length === WEEK_LEN,
    message: `${name} must have exactly ${WEEK_LEN} numbers`,
  },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ✅ weekly arrays (7 days)
  addition: weekField("addition", 0),
  subtraction: weekField("subtraction", 0),
  multiplication: weekField("multiplication", 0),
  division: weekField("division", 0),
  percent: weekField("percent", 0),

  // ✅ level fields (keep as Number)
  addition_f: { type: Number, default: 1 },
  subtraction_f: { type: Number, default: 1 },
  multiplication_f: { type: Number, default: 1 },
  division_f: { type: Number, default: 1 },
  percent_f: { type: Number, default: 1 },

  age: { type: Number, required: true, min: 1, max: 12 },
});

module.exports = mongoose.model("User", UserSchema);

