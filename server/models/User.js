const mongoose = require("mongoose");

// Schema 
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  addition: { type: Number, default: 1 },
  addition_f: { type: Number, default: 1 },

  subtraction: { type: Number, default: 1 },
  subtraction_f: { type: Number, default: 1 },

  multiplication: { type: Number, default: 1 },
  multiplication_f: { type: Number, default: 1 },

  division: { type: Number, default: 1 },
  division_f: { type: Number, default: 1 },

  percent: { type: Number, default: 1 },
  percent_f: { type: Number, default: 1 },

  age: { type: Number, required: true, min: 1, max: 12 },

});

// Export the model
module.exports = mongoose.model("User", UserSchema);
