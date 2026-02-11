// Logic and config for addition practice
import { randInt, apiFetch } from "./practiceHelpers";

export const ADD_STATE_KEY = "addition_practice_state_v1";
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
      "פה אנחנו עושים חיבור כמו שהחתול אוהב: רגוע וברור.\n" +
      "מתחילים מהמספר הראשון.\n" +
      "את המספר השני הופכים לצעדים קדימה וסופרים לאט.\n" +
      "דוגמה: 3 + 2 → 4, 5.\n" +
      "טיפ של חתול: אם יש 0 — לא מוסיפים כלום 😸",
  },
  medium: {
    title: "רמה בינונית 🐾",
    body:
      "כאן החתול כבר משתמש בטריק קטן וחכם.\n" +
      "במקום לספור הרבה צעדים, מגיעים למספר עגול.\n" +
      "קודם משלימים לעשר או לעשרות.\n" +
      "ואז מוסיפים את מה שנשאר.\n" +
      "דוגמה: 28 + 7 → 30 ואז 35.\n" +
      "טיפ של חתול: מספרים עגולים הם הכי נוחים 🐾",
  },
  hard: {
    title: "רמה קשה 🐯",
    body:
      "זו רמה לחתולים רציניים במיוחד.\n" +
      "כדי לא להתבלבל, מפרקים את המספרים לחלקים.\n" +
      "קודם מחברים עשרות או מאות.\n" +
      "אחר כך מחברים יחידות.\n" +
      "בסוף מחברים את הכל יחד.\n" +
      "דוגמה: 146 + 37 → 176 ואז 183.\n" +
      "טיפ של חתול: לפרק לחלקים זה כמו לגו 🧱",
  },
};

export function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey] ?? LEVELS.easy;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { a, b, ans: a + b };
}

export function levelFromAdditionF(addition_f) {
  const n = Number(addition_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

export async function fetchAdditionF(username) {
  try {
    const data = await apiFetch(`/user/addition-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.addition_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function fetchIncAddition(username) {
  try {
      await apiFetch("/score/addition", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
  });
  } catch {}
}