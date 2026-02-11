// Logic and config for percent practice
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const PCT_STATE_KEY = "percent_practice_state_v1";

export const LEVELS = {
  easy: { label: "מתחילים (קל מאוד)", minBase: 10, maxBase: 200 },
  medium: { label: "מתקדמים (קל)", minBase: 10, maxBase: 400 },
  hard: { label: "אלופים (עדיין לילדים)", minBase: 10, maxBase: 600 },
};

export const LEVEL_TEXT = {
  easy: {
    title: "אחוזים למתחילים 😺",
    body:
      "אחוזים זה 'כמה מתוך 100'.\n" +
      "חישובים סופר קלים:\n" +
      "50% = חצי, 25% = רבע, 10% = לחלק ב־10.\n" +
      "דוגמה: 25% מ־80 = 20.\n" +
      "טיפ של מתי: קודם עושים 10/25/50 ואז ממשיכים 🐾",
  },
  medium: {
    title: "אחוזים מתקדמים 🐾",
    body:
      "עכשיו מוסיפים עוד אחוזים קלים.\n" +
      "5% זה חצי של 10%.\n" +
      "20% זה כפול מ־10%.\n" +
      "דוגמה: 15% מ־200 = 10% (20) + 5% (10) = 30.\n" +
      "טיפ של מתי: תחשוב בחתיכות קטנות 😺",
  },
  hard: {
    title: "אחוזים לאלופים 🐯",
    body:
      "פה עושים אחוזים קצת יותר 'חכמים', אבל עדיין פשוטים.\n" +
      "1% = לחלק ב־100.\n" +
      "2% = פעמיים 1%.\n" +
      "4% = כפול 2%.\n" +
      "דוגמה: 4% מ־200 = 8.\n" +
      "טיפ של מתי: תמיד אפשר לפרק אחוזים לחלקים 🧱",
  },
};

const PCTS_BY_LEVEL = {
  easy: [10, 25, 50],
  medium: [5, 10, 15, 20, 25, 50],
  hard: [1, 2, 4, 5, 10, 15, 20, 25, 50],
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeBaseForPct(levelKey, pct) {
  const L = LEVELS[levelKey] ?? LEVELS.easy;
  let step = 10;
  if (pct === 50) step = 2;
  else if (pct === 25) step = 4;
  else if (pct === 10 || pct === 20) step = 10;
  else if (pct === 5 || pct === 15) step = 20;
  else if (pct === 1 || pct === 2 || pct === 4) step = 100;
  const minK = Math.ceil(L.minBase / step);
  const maxK = Math.floor(L.maxBase / step);
  const k1 = Math.max(1, minK);
  const k2 = Math.max(k1, maxK);
  return randInt(k1, k2) * step;
}

export function makeQuestion(levelKey) {
  const pct = pick(PCTS_BY_LEVEL[levelKey] ?? PCTS_BY_LEVEL.easy);
  const base = makeBaseForPct(levelKey, pct);
  const ans = (base * pct) / 100;
  return { pct, base, ans };
}

export function levelFromPercentF(percent_f) {
  const n = Number(percent_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function fetchPercentF(username) {
  try {
    const data = await apiFetch(`/user/percent-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.percent_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function fetchIncPercent(username) {
  try {
    await apiFetch("/score/percent", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {}
}