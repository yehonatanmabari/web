const User = require("../models/User");
const WeeklySnapshot = require("../models/WeeklySnapshot");

// רק השדות בלי _f מתאפסים
const SCORE_FIELDS = ["addition", "subtraction", "multiplication", "division", "percent"];

function makeWeekKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

async function archiveAndResetScores() {
  const snapshotAt = new Date();
  const weekKey = makeWeekKey(snapshotAt);

  const users = await User.find({}).lean();

  if (users.length) {
    await WeeklySnapshot.insertMany(
      users.map((u) => ({
        snapshotAt,
        weekKey,
        username: u.username,
        data: u, // שומר הכל: כולל password + *_f + age
      })),
      { ordered: false }
    );
  }

  // 2) מאפסים רק ניקוד (לא נוגעים בסיסמה/גיל/רמות)
  const resetObj = Object.fromEntries(SCORE_FIELDS.map((f) => [f, 0]));
  await User.updateMany({}, { $set: resetObj });

  console.log(`✅ archive+reset done. archived=${users.length} weekKey=${weekKey}`);
}

module.exports = { archiveAndResetScores };
