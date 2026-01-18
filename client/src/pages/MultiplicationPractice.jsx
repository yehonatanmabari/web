// src/pages/PracticeMultiplication.jsx
import React, { useEffect, useRef, useState } from "react";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";

/**
 * ✅ Works on Vercel + local:
 * - Vercel: set VITE_API_BASE in Project Env Vars (e.g. https://your-api.vercel.app)
 * - Local: if not set, falls back to http://localhost:3000
 */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const MUL_STATE_KEY = "multiplication_practice_state_v1";

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

/** ✅ LEVEL_TEXT שלך בדיוק */
const LEVEL_TEXT = {
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

/** ✅ LEVELS שלך בדיוק */
const LEVELS = {
  beginners: { label: "מתחילים", min: 0, max: 5 },
  advanced: { label: "מתקדמים", min: 0, max: 10 },
  champs: { label: "אלופים", min: 0, max: 12 },
};

function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey] ?? LEVELS.beginners;

  // בכפל, נוח לתת טווחים קטנים יותר כדי שיצא "לוח כפל"
  const a = randInt(min, max);
  const b = randInt(min, max);

  return { a, b, ans: a * b };
}

function levelFromMultiplicationF(multiplication_f) {
  const n = Number(multiplication_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "beginners";
  if (n === 2) return "advanced";
  return "champs";
}

async function fetchMultiplicationF(username) {
  // ✅ assumption: GET /user/multiplication-f?username=...
  try {
    const data = await apiFetch(`/user/multiplication-f?username=${encodeURIComponent(username)}`);
    if (!data?.ok) return null;
    const n = Number(data.multiplication_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** ---------- Component ---------- */
export default function PracticeMultiplication() {
  const timerRef = useRef(null);

  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [story, setStory] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);

  function savePracticeState(next = {}) {
    sessionStorage.setItem(
      MUL_STATE_KEY,
      JSON.stringify({ level, q, input, msg, noPointsThisQuestion, story, ...next })
    );
  }

  function clearPracticeState() {
    sessionStorage.removeItem(MUL_STATE_KEY);
  }

  /** On mount: restore state */
  useEffect(() => {
    const saved = sessionStorage.getItem(MUL_STATE_KEY);
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
      if (sessionStorage.getItem(MUL_STATE_KEY)) return;

      const username = localStorage.getItem("username");
      if (!username) return;

      const f = await fetchMultiplicationF(username);
      const newLevel = levelFromMultiplicationF(f);

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
      `בתרגיל הזה יש לנו ${q.a} כפול ${q.b}.\n` +
      `זה אומר: ${q.a} ועוד ${q.a} ועוד... (${q.b} פעמים).\n` +
      `התוצאה היא ${q.ans}.\n` +
      `יאללה תנסה לענות לבד!`;

    setNoPointsThisQuestion(true);
    setStory(s);
    setMsg("📖 קיבלת סיפור. עכשיו אם תענה נכון — לא תקבל נקודות על השאלה הזו.");
    savePracticeState({ noPointsThisQuestion: true, story: s, msg: "📖 קיבלת סיפור..." });
  }

  async function incMultiplicationScoreIfAllowed() {
    if (noPointsThisQuestion) return;
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      // ✅ expected: POST /score/multiplication  body: { username }
      await apiFetch("/score/multiplication", {
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
      incMultiplicationScoreIfAllowed();

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

      <h2>תרגול כפל</h2>

      <div className="mt-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="text-xs font-bold text-slate-600">הרמה שלך:</div>
        <div className="text-sm font-extrabold text-slate-900">
          {level === "beginners" ? "מתחילים 😺" : level === "advanced" ? "מתקדמים 🐾" : "אלופים 🐯"}
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, margin: "16px 0" }}>
        = {q.b} × {q.a}
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

      {msg ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#0f172a" }}>{msg}</div>
      ) : null}

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
