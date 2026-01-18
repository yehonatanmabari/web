const cron = require("node-cron");
const { archiveAndResetScores } = require("./weeklyResetScores");

const User = require("../models/User");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true }));

cron.schedule("0 0 * * *", async () => {
  await archiveAndResetScores();
});


// Log every request (server-side only) - hides password
app.use((req, res, next) => {
  const safe = { ...(req.body || {}) };
  if (safe.password) safe.password = "***";
  console.log(req.method, req.url, safe);
  next();
});

/**
 * Generic score increment route factory.
 */
function makeIncScoreRoute(field) {
  return async (req, res) => {
    try {
      const username = String(req.body?.username || "").trim();
      if (!username) {
        return res.status(400).json({ ok: false, error: "NO_USERNAME" });
      }

      const user = await User.findOneAndUpdate(
        { username },
        { $inc: { [field]: 1 } },
        { new: true, projection: { password: 0 } }
      );

      if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

      return res.json({ ok: true, [field]: user[field] });
    } catch (e) {
      console.log("ERR:", e);
      return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  };
}

/**
 * Generic factor getter route factory.
 */
function makeGetFactorRoute(field) {
  return async (req, res) => {
    try {
      const username = String(req.query.username || "").trim();
      if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

      const user = await User.findOne({ username }, { [field]: 1, _id: 0 });
      if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

      return res.json({ ok: true, [field]: Number(user[field] ?? 1) });
    } catch (e) {
      console.log("ERR:", e);
      return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  };
}

// ------------------------- AUTH -------------------------

app.post("/check-login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "חסר שם משתמש או סיסמה" });
    }

    const user = await User.findOne({ username }).select("password").lean();

    if (!user) return res.json({ ok: false, reason: "NO_USER" });
    if (user.password !== password) return res.json({ ok: false, reason: "BAD_PASS" });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, age } = req.body || {};

    if (!username || !password || age === undefined) {
      return res.status(400).json({ success: false, error: "חסר שם משתמש / סיסמה / גיל" });
    }

    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 12) {
      return res.status(400).json({ success: false, error: "גיל חייב להיות בין 1 ל-12" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ success: false, error: "שם משתמש כבר קיים" });
    }

    const user = await User.create({ username, password, age: ageNum });
    return res.json({ success: true, id: user._id });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ------------------------- USER STATS -------------------------

app.post("/user/stats", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

    const user = await User.findOne({ username }).select(
      "username addition subtraction multiplication division percent -_id"
    );

    if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

    res.json({ ok: true, user });
  } catch (err) {
    console.error("user/stats error:", err);
    res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// ------------------------- SCORE -------------------------

app.post("/score/addition", makeIncScoreRoute("addition"));
app.post("/score/subtraction", makeIncScoreRoute("subtraction"));
app.post("/score/multiplication", makeIncScoreRoute("multiplication"));
app.post("/score/division", makeIncScoreRoute("division"));
app.post("/score/percent", makeIncScoreRoute("percent"));

// ------------------------- FACTORS -------------------------

app.get("/user/addition-f", makeGetFactorRoute("addition_f"));
app.get("/user/subtraction-f", makeGetFactorRoute("subtraction_f"));
app.get("/user/multiplication-f", makeGetFactorRoute("multiplication_f"));
app.get("/user/division-f", makeGetFactorRoute("division_f"));
app.get("/user/percent-f", makeGetFactorRoute("percent_f"));

module.exports = app;
