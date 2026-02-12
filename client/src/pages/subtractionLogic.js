// Logic and config for subtraction practice
import { randInt, apiFetch } from "./practiceHelpers";

export const SUB_STATE_KEY = "subtraction_practice_state_v1";
export const CAT_STORY_KEY = "cat_story_text";

export const LEVELS = {
  easy: { label: "מתחילים (0–10)", min: 0, max: 10 },
  medium: { label: "מתקדמים (0–50)", min: 0, max: 50 },
  hard: { label: "אלופים (0–200)", min: 0, max: 200 },
};

export const LEVEL_TEXT = {
  easy: {
    title: "רמה קלה 😺",
    body:
      "פה החתול לומד חיסור רגוע וברור.\n" +
      "מתחילים מהמספר הגדול.\n" +
      "את המספר השני הופכים לצעדים אחורה.\n" +
      "סופרים לאט לאחור.\n" +
      "דוגמה: 5 − 2 → 4, 3.\n" +
      "טיפ של חתול: אם מחסרים 0 — הכל נשאר אותו דבר 😸",
  },
  medium: {
    title: "רמה בינונית 🐾",
    body:
      "כאן החתול משתמש בטריק חכם של חיסור.\n" +
      "במקום לספור הרבה צעדים אחורה,\n" +
      "מגיעים למספר עגול קודם.\n" +
      "ואז מחסרים את מה שנשאר.\n" +
      "דוגמה: 34 − 6 → 30 ואז 28.\n" +
      "טיפ של חתול: מספרים עגולים עושים חיסור קל 🐾",
  },
  hard: {
    title: "רמה קשה 🐯",
    body:
      "זו רמה לחתולים שכבר שולטים בחיסור.\n" +
      "כדי לא להתבלבל, מפרקים את המספר שמחסרים.\n" +
      "קודם מחסרים עשרות.\n" +
      "אחר כך מחסרים יחידות.\n" +
      "בסוף בודקים שהכל הגיוני.\n" +
      "דוגמה: 146 − 37 → 116 ואז 109.\n" +
      "טיפ של חתול: לפרק זה סוד החישוב החכם 🧠",
  },
};

export function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey] ?? LEVELS.easy;
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a];
  return { a, b, ans: a - b };
}

export function levelFromSubtractionF(subtraction_f) {
  const n = Number(subtraction_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

export async function fetchSubtractionF(username) {
  try {
    const data = await apiFetch(`/user/subtraction-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.subtraction_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function fetchIncSubtraction(username) {
  try {
      await apiFetch("/score/subtraction", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
  });
  } catch {}
}