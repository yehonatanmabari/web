// Logic and config for division practice
import { randInt, apiFetch } from "./practiceHelpers";

export const DIV_STATE_KEY = "division_practice_state_v1";
export const CAT_STORY_KEY = "cat_story_text";

export const LEVELS = {
  beginners: { label: "מתחילים", minDivisor: 2, maxDivisor: 5, maxAnswer: 10 },
  advanced: { label: "מתקדמים", minDivisor: 2, maxDivisor: 10, maxAnswer: 12 },
  champs: { label: "אלופים", minDivisor: 2, maxDivisor: 12, maxAnswer: 15 },
};

export const LEVEL_TEXT = {
  beginners: {
    title: "מתחילים 😺",
    body:
      "מתי החתול מסביר שחילוק זה 'לחלק שווה בשווה'.\n" +
      "לוקחים מספר גדול (עוגיות 🍪).\n" +
      "מחלקים לקבוצות שוות.\n" +
      "סופרים כמה יש בכל קבוצה.\n" +
      "דוגמה: 6 ÷ 2 → 3 לכל ילד.\n" +
      "טיפ של מתי: אפשר לצייר עיגולים ולעשות קבוצות 🟣🟣🟣",
  },
  advanced: {
    title: "מתקדמים 🐾",
    body:
      "מתי החתול כבר יודע שחילוק קשור ללוח הכפל.\n" +
      "שואלים: 'איזה מספר כפול המחלק נותן את המחולק?'\n" +
      "דוגמה: 24 ÷ 6 → מי כפול 6 נותן 24? → 4.\n" +
      "אם קשה — נסה כפולות עד שמגיעים למחולק.\n" +
      "טיפ של מתי: לחשוב על כפל עושה חילוק מהיר 🐾",
  },
  champs: {
    title: "אלופים 🐯",
    body:
      "רמה של אלופים אמיתיים.\n" +
      "מתי החתול משתמש בטריקים חכמים ופירוקים.\n" +
      "דוגמה: 96 ÷ 8 → 80 ÷ 8 = 10 וגם 16 ÷ 8 = 2 → ביחד 12.\n" +
      "בודקים עם כפל: 12 × 8 = 96 ✅\n" +
      "טיפ של מתי: בדיקה בכפל שומרת על 0 טעויות 🧠",
  },
};

export function makeQuestion(levelKey) {
  const L = LEVELS[levelKey] ?? LEVELS.beginners;
  const divisor = randInt(L.minDivisor, L.maxDivisor);
  const ans = randInt(1, L.maxAnswer);
  const dividend = divisor * ans;
  return { dividend, divisor, ans };
}

export function levelFromDivisionF(division_f) {
  const n = Number(division_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "beginners";
  if (n === 2) return "advanced";
  return "champs";
}

export async function fetchDivisionF(username) {
  try {
    const data = await apiFetch(`/user/division-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.division_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function fetchIncDivision(username, isCorrect) {
  try {
      await apiFetch("/score/division", {
        method: "POST",
        body: JSON.stringify({ username, isCorrect }),
        headers: { "Content-Type": "application/json" },
  });
  } catch {}
}