// src/server.js
console.log("CWD =", process.cwd());
console.log("__dirname =", __dirname);

require("dotenv").config();
console.log("MONGO_URI =", process.env.MONGO_URI);
const app = require("./app");
const { connectDb } = require("./db");

const PORT = process.env.PORT || 3000;


(async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Mongo connect error ❌:", err.message);
    process.exit(1);
  }
})();
