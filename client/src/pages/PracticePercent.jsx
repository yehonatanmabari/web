// src/pages/PracticePercent.jsx
import React, { useEffect, useRef, useState } from "react";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";

/**
 * ✅ Works on Vercel + local:
 * - Vercel: set VITE_API_BASE in Project Env Vars (e.g. https://your-api.vercel.app)
 * - Local: if not set, falls back to http://localhost:3000
 */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const PCT_STATE_KEY = "percent_practice_state_v1";

/** ---------- Tiny helpers ---------- */
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

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** ✅ שלך בדיוק */
const LEVELS = {
  easy: { label: "מתחילים (קל מאוד)", minBase: 10, maxBase: 200 },
  medium: { label: "מתקדמים (קל)", minBase: 10, maxBase: 400 },
  hard: { label: "אלופים (עדיין לילדים)", minBase: 10, maxBase: 600 },
};

/** ✅ שלך בדיוק */
const LEVEL_TEXT = {
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

/** אחוזים “ידידותיים” לפי רמה */
const PCTS_BY_LEVEL = {
  easy: [10, 25, 50],
  medium: [5, 10, 15, 20, 25, 50],
  hard: [1, 2, 4, 5, 10, 15, 20, 25, 50],
};

/** בוחר בסיס שיוצא תוצאה שלמה לרוב האחוזים הנבחרים */
function makeBaseForPct(levelKey, pct) {
  const L = LEVELS[levelKey] ?? LEVELS.easy;

  // מכפילים שמתאימים כדי שהתוצאה תצא שלמה:
  // 50% -> בסיס זוגי
  // 25% -> כפולות של 4
  // 10%/20% -> כפולות של 10
  // 5%/15% -> כפולות של 20 (כי 5% = /20; 15% = 3*5%)
  // 1%/2%/4% -> כפולות של 100 (או 50/25 אבל פה נשמור פשוט)
  let step = 10;

  if (pct === 50) step = 2;
  else if (pct === 25) step = 4;
  else if (pct === 10 || pct === 20) step = 10;
  else if (pct === 5 || pct === 15) step = 20;
  else if (pct === 1 || pct === 2 || pct === 4) step = 100;

  const minK = Math.ceil(L.minBase / step);
  const maxK = Math.floor(L.maxBase / step);

  // אם הטווח קטן מדי (למשל step=100 ב-min=10), נתקן מינימום
  const k1 = Math.max(1, minK);
  const k2 = Math.max(k1, maxK);

  return randInt(k1, k2) * step;
}

function makeQuestion(levelKey) {
  const pct = pick(PCTS_BY_LEVEL[levelKey] ?? PCTS_BY_LEVEL.easy);
  const base = makeBaseForPct(levelKey, pct);
  const ans = (base * pct) / 100;
  return { pct, base, ans };
}

function levelFromPercentF(percent_f) {
  const n = Number(percent_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

async function fetchPercentF(username) {
  // ✅ assumption: GET /user/percent-f?username=...
  try {
    const data = await apiFetch(`/user/percent-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.percent_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** ---------- Component ---------- */
export default function PracticePercent() {
  const timerRef = useRef(null);

  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [story, setStory] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);

  function savePracticeState(next = {}) {
    sessionStorage.setItem(
      PCT_STATE_KEY,
      JSON.stringify({ level, q, input, msg, noPointsThisQuestion, story, ...next })
    );
  }

  function clearPracticeState() {
    sessionStorage.removeItem(PCT_STATE_KEY);
  }

  /** On mount: restore state */
  useEffect(() => {
    const saved = sessionStorage.getItem(PCT_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.story === "string") setStory(st.story);
        if (typeof st?.noPointsThisQuestion === "boolean") setNoPointsThisQuestion(st.noPointsThisQuestion);
      } catch {
        // ignore
      }
    }
  }, []);

  /** Auto-select level from DB ONLY if no saved state */
  useEffect(() => {
    (async () => {
      if (sessionStorage.getItem(PCT_STATE_KEY)) return;

      const username = localStorage.getItem("username");
      if (!username) return;

      const f = await fetchPercentF(username);
      const newLevel = levelFromPercentF(f);

      setLevel(newLevel);
      setQ(makeQuestion(newLevel));
      setInput("");
      setMsg("");
      setStory("");
      setNoPointsThisQuestion(false);
    })();
  }, []);

  function goNextQuestion(nextLevel = level) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearPracticeState();
    setMsg("");
    setInput("");
    setStory("");
    setNoPointsThisQuestion(false);
    setQ(makeQuestion(nextLevel));
  }

  function goStory() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const s =
      `מתי החתול אומר 😺:\n` +
      `בתרגיל הזה אנחנו מחשבים ${q.pct}% מתוך ${q.base}.\n` +
      `תחשוב: ${q.pct}% זה "כמה מתוך 100".\n` +
      `ואפשר לפרק לאחוזים קלים כמו 10/25/50 או 1/2/4.\n` +
      `התוצאה כאן היא ${q.ans}.\n` +
      `יאללה תנסה לענות לבד!`;

    setNoPointsThisQuestion(true);
    setStory(s);
    setMsg("📖 קיבלת סיפור. עכשיו אם תענה נכון — לא תקבל נקודות על השאלה הזו.");
    savePracticeState({ noPointsThisQuestion: true, story: s, msg: "📖 קיבלת סיפור..." });
  }

  async function incPercentScoreIfAllowed() {
    if (noPointsThisQuestion) return;
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      // ✅ expected: POST /score/percent  body: { username }
      await apiFetch("/score/percent", {
        method: "POST",
        body: JSON.stringify({ username }),
      });
    } catch {
      // ignore
    }
  }

  function checkAnswer() {
    const val = Number(input);

    if (input.trim() === "" || !Number.isFinite(val)) {
      const m = "הקלד מספר";
      setMsg(m);
      savePracticeState({ msg: m });
      return;
    }

    if (val === q.ans) {
      const m = noPointsThisQuestion ? "✅ נכון (בלי נקודות כי ביקשת סיפור)" : "✅ נכון";
      setMsg(m);
      savePracticeState({ msg: m });

      triggerCatFx();
      incPercentScoreIfAllowed();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1000);
      return;
    }

    triggerBadCatFx();
    const m = "❌ לא נכון";
    setMsg(m);
    savePracticeState({ msg: m });
  }

  /** Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        maxWidth: 420,
        margin: "40px auto",
        direction: "rtl",
        textAlign: "right",
        position: "relative",
      }}
    >
      <CatCongrats />
      <CatUncongrats />

      <h2>תרגול אחוזים</h2>

      <div className="mt-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="text-xs font-bold text-slate-600">הרמה שלך:</div>
        <div className="text-sm font-extrabold text-slate-900">
          {level === "easy" ? "מתחילים 😺" : level === "medium" ? "מתקדמים 🐾" : "אלופים 🐯"}
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, margin: "16px 0" }}>
        = {q.pct}% מ־{q.base}
      </div>

      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          savePracticeState({ input: e.target.value });
        }}
        placeholder="תשובה"
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={checkAnswer}>בדוק</button>

        <button
          onClick={goStory}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "6px 10px",
          }}
          title="מתי החתול יספר סיפור על התרגיל הזה"
        >
          ספר סיפור 😺
        </button>

        <button
          onClick={() => goNextQuestion(level)}
          style={{
            background: "#0f172a",
            color: "white",
            border: "1px solid #0f172a",
            borderRadius: 8,
            padding: "6px 10px",
          }}
          title="עובר לתרגיל הבא ומנקה את הקודם"
        >
          תרגיל הבא ➜
        </button>
      </div>

      {msg ? <div style={{ marginTop: 10, fontWeight: 800, color: "#0f172a" }}>{msg}</div> : null}

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-slate-900">{LEVEL_TEXT[level]?.title ?? "הסבר לרמה"}</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {LEVELS[level]?.label}
          </span>
        </div>

        <p className="mt-2 text-sm leading-7 text-slate-700 whitespace-pre-line">{LEVEL_TEXT[level]?.body ?? ""}</p>
      </div>

      {story ? (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm font-extrabold text-slate-900">הסיפור של מתי 😺</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{story}</pre>
        </div>
      ) : null}
    </div>
  );
}
