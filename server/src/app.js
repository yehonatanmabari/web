const cron = require("node-cron");
const { archiveAndResetScores } = require("./weeklyResetScores");
const { connectDb } = require("./db");

const User = require("../models/User");
const express = require("express");
const cors = require("cors");

const CMON = process.env.MONGO_URI || "NoMongo";

const LEVELS = ["easy", "medium", "hard"];


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API is up" });
});

/**
 * Run daily job at 00:00 Israel time (important on Vercel / UTC servers).
 */
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      await connectDb();
      await archiveAndResetScores();
    } catch (e) {
      console.log("CRON ERR:", e);
    }
  },
  { timezone: "Asia/Jerusalem" }
);

// Log every request (server-side only) - hides password
app.use((req, res, next) => {
  const safe = { ...(req.body || {}) };
  if (safe.password) safe.password = "***";
  console.log(req.method, req.url, safe);
  next();
});

/**
 * Returns 0..6 for Israel time, where 0=Sunday ... 6=Saturday.
 * We use Intl with timeZone so it does not depend on server timezone.
 */
function getIsraelDayIndex() {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
  }).format(new Date());

  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

/**
 * Safe getter for "today value" from a 7-length array field.
 * If something is missing/corrupt, we fall back to 0 (prevents NaN).
 */
function getTodayValue(user, field, dayIndex) {
  const arr = user?.[field];
  if (!Array.isArray(arr)) return 0;
  const v = Number(arr[dayIndex]);
  return Number.isFinite(v) ? v : 0;
}

function evaluateLevel(current_level, recent_answers) {
  if (!Array.isArray(recent_answers) || recent_answers.length < 10) {
    return { level: current_level, reset: false };
  }
  
  const correctCount = recent_answers.filter(x => x).length;
  const wrongCount = recent_answers.length - correctCount;
  const idx = LEVELS.indexOf(current_level);

  // Promotion if got 10 questions and at least 9 correct
  if (correctCount >= 9 && idx < LEVELS.length - 1) {
    return { level: LEVELS[idx + 1], reset: true };
  }

  // Demotion - if got 10 questions and at least 6 wrong
  if (wrongCount >= 6 && idx > 0) {
    return { level: LEVELS[idx - 1], reset: true };
  }

  // Otherwise, keep the same level
  return { level: current_level, reset: false };
}

function pushRecent(list, value) {
  const updated = [...(list || []), value];
  if (updated.length > 10) updated.shift();
  return updated;
}

/**
 * Generic score increment route factory for WEEK ARRAYS in DB,
 * BUT returns only TODAY's number to the client (not the array).
 *
 * DB update: increments `${field}.${dayIndex}`
 * Response: returns `{ field: <todayNumber>, dayIndex }`
 */
function makeIncScoreRoute(field) {
  return async (req, res) => {
    await connectDb();

    try {
      const username = String(req.body?.username || "").trim();
      if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

      const isCorrect = req.body?.isCorrect || null;

      const dayIndex = getIsraelDayIndex();
      const dayPath = `${field}.${dayIndex}`; // e.g. "addition.3"

      const user = await User.findOne(
        { username }
      );
      if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

      const recentKey = `${field}_recent`;
      const factorKey = `${field}_f`;

      // Just to make sure I'm not breaking anything
      if (!Array.isArray(user[field])) {
        user[field] = [0,0,0,0,0,0,0];
      }

      if (!Array.isArray(user[recentKey])) {
        user[recentKey] = [];
      }

      if (typeof user[factorKey] !== "number") {
        user[factorKey] = 1;
      }

      if (typeof(isCorrect) === "boolean" && user) {
        user[recentKey] = pushRecent(user[recentKey], isCorrect);
        const currentLevel = levelFromFactor(user[factorKey]);
        const levelRes = evaluateLevel(currentLevel, user[recentKey]);
        if (levelRes.level !== currentLevel) {
          user[factorKey] = factorFromLevel(levelRes.level);
        }
        if (levelRes.reset) {
          user[recentKey] = [];
        }
        if (isCorrect === true) {
          await User.findOneAndUpdate(
            { username },
            { $inc: { [dayPath]: 1 } },
            { new: true, projection: { password: 0 } }
          );
        }
      }

      await user.save();

      const todayValue = getTodayValue(user, field, dayIndex);

      // IMPORTANT: return number (today), not array
      return res.json({
        ok: true,
        dayIndex,
        [field]: todayValue,
      });
    } catch (e) {
      console.log("ERR:", e);
      return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  };
}

function levelFromFactor(f) {
  if (f <= 1) return "easy";
  if (f === 2) return "medium";
  return "hard";
}

function factorFromLevel(level) {
  if (level === "easy") return 1;
  if (level === "medium") return 2;
  return 3;
}

/**
 * Generic factor getter route factory.
 * (Your *_f fields are plain numbers, unchanged.)
 */
function makeGetFactorRoute(field) {
  return async (req, res) => {
    await connectDb();

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
  await connectDb();
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
    return res.status(500).json({ error: err.message + " " + CMON });
  }
});

app.post("/register", async (req, res) => {
  await connectDb();
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

    // Schema defaults create 7-length arrays automatically
    const user = await User.create({ username, password, age: ageNum });
    return res.json({ success: true, id: user._id });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ------------------------- USER STATS -------------------------

/**
 * Returns ONLY today's numbers (NOT arrays).
 * This prevents NaN in the UI and keeps the client simple.
 *
 * Response shape:
 * {
 *   ok: true,
 *   dayIndex: 0..6,
 *   user: {
 *     username,
 *     addition: <number>,
 *     subtraction: <number>,
 *     multiplication: <number>,
 *     division: <number>,
 *     percent: <number>
 *   }
 * }
 */
app.post("/user/stats", async (req, res) => {
  await connectDb();

  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

    // We still fetch arrays from DB, but we convert them to today's number in response.
    const userDoc = await User.findOne({ username }).select(
      "username addition subtraction multiplication division percent -_id"
    );

    if (!userDoc) return res.status(404).json({ ok: false, error: "NO_USER" });

    const dayIndex = getIsraelDayIndex();

    const user = {
      username: userDoc.username,
      addition: getTodayValue(userDoc, "addition", dayIndex),
      subtraction: getTodayValue(userDoc, "subtraction", dayIndex),
      multiplication: getTodayValue(userDoc, "multiplication", dayIndex),
      division: getTodayValue(userDoc, "division", dayIndex),
      percent: getTodayValue(userDoc, "percent", dayIndex),
    };

    return res.json({ ok: true, dayIndex, user });
  } catch (err) {
    console.error("user/stats error:", err);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

/**
 * OPTIONAL: If you ever need weekly graphs, use this endpoint.
 * It returns the arrays (7-length) as stored in the DB.
 */
app.post("/user/stats-week", async (req, res) => {
  await connectDb();

  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

    const user = await User.findOne({ username }).select(
      "username addition subtraction multiplication division percent -_id"
    );

    if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("user/stats-week error:", err);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// ------------------------- SCORE (TODAY ONLY IN RESPONSE) -------------------------

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
