// Logic and config for multiplication practice
import { randInt, apiFetch } from "./practiceHelpers";

export const MUL_STATE_KEY = "multiplication_practice_state_v1";
export const CAT_STORY_KEY = "cat_story_text";

export const LEVELS = {
  beginners: { label: "מתחילים", min: 0, max: 5 },
  advanced: { label: "מתקדמים", min: 0, max: 10 },
  champs: { label: "אלופים", min: 0, max: 12 },
};

export const LEVEL_TEXT = {
  beginners: {
    title: "מתחילים 😺",
    body:
      "מתי החתול מסביר שכפל זה חיבור שחוזר על עצמו.\n" +
      "בוחרים מספר אחד.\n" +
      "מחברים אותו שוב ושוב.\n" +
      "דוגמה: 3 × 2 זה כמו 3 + 3.\n" +
      "אפשר לצייר עיגולים או להשתמש באצבעות.\n" +
      "טיפ של מתי: לאט וברור זה הכי טוב 😸",
  },
  advanced: {
    title: "מתקדמים 🐾",
    body:
      "מתי החתול כבר יודע לחשב מהר יותר.\n" +
      "משתמשים בלוח הכפל.\n" +
      "זוכרים תרגילים מוכרים.\n" +
      "אם קשה — מפרקים לחלקים.\n" +
      "דוגמה: 6 × 7 → קודם 6 × 5 ואז 6 × 2.\n" +
      "מחברים את התוצאות.\n" +
      "טיפ של מתי: לפרק עושה את זה קל 🐾",
  },
  champs: {
    title: "אלופים 🐯",
    body:
      "זו רמה של אלופים אמיתיים.\n" +
      "מתי החתול כבר מכיר את לוח הכפל טוב.\n" +
      "אפשר להשתמש בטריקים חכמים.\n" +
      "בודקים אם התשובה הגיונית.\n" +
      "דוגמה: 9 × 12 → 10 × 12 ואז מורידים 12.\n" +
      "מהיר וחכם.\n" +
      "טיפ של מתי: לחשוב רגע חוסך טעויות 🧠",
  },
};

export function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey] ?? LEVELS.beginners;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { a, b, ans: a * b };
}

export function levelFromMultiplicationF(multiplication_f) {
  const n = Number(multiplication_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "beginners";
  if (n === 2) return "advanced";
  return "champs";
}

export async function fetchMultiplicationF(username) {
  try {
    const data = await apiFetch(`/user/multiplication-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.multiplication_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function fetchIncMultiplication(username) {
  try {
      await apiFetch("/score/multiplication", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
  });
  } catch {}
}