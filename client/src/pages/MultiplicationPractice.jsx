import React, { useEffect, useRef, useState } from "react";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";
import { useNavigate } from "react-router-dom";
import {
  MUL_STATE_KEY,
  CAT_STORY_KEY,
  LEVELS,
  LEVEL_TEXT,
  makeQuestion,
  levelFromMultiplicationF,
  fetchMultiplicationF,
  fetchIncMultiplication
} from "./multiplicationLogic";
import { savePracticeState, clearPracticeState, getPracticeState } from "./practiceState";

export default function MultiplicationExampleBetter() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);
  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [story, setStory] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);

  function saveState(next = {}) {
    savePracticeState(MUL_STATE_KEY, { level, q, input, msg, noPointsThisQuestion, story }, next);
  }
  function clearState() {
    clearPracticeState(MUL_STATE_KEY);
  }

  useEffect(() => {
    const st = getPracticeState(MUL_STATE_KEY);
    if (st) {
      if (st?.level) setLevel(st.level);
      if (st?.q) setQ(st.q);
      if (typeof st?.input === "string") setInput(st.input);
      if (typeof st?.msg === "string") setMsg(st.msg);
      if (typeof st?.story === "string") setStory(st.story);
      if (typeof st?.noPointsThisQuestion === "boolean") setNoPointsThisQuestion(st.noPointsThisQuestion);
    }
    const s = sessionStorage.getItem(CAT_STORY_KEY);
    if (s) {
      setStory(s);
      sessionStorage.removeItem(CAT_STORY_KEY);
      const m = "📖 קיבלת סיפור. עכשיו אם תענה נכון — לא תקבל נקודות על השאלה הזו.";
      setMsg(m);
      setNoPointsThisQuestion(true);
      saveState({ story: s, msg: m, noPointsThisQuestion: true });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getPracticeState(MUL_STATE_KEY)) return;
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
    clearState();
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
    setNoPointsThisQuestion(true);
    saveState({ noPointsThisQuestion: true });
    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "*" } });
  }

  async function incMultiplicationScoreIfAllowed() {
    if (noPointsThisQuestion) return;
    const username = localStorage.getItem("username");
    if (!username) return;
    try {
      await fetchIncMultiplication(username);
    } catch { }
  }

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      const m = "הקלד מספר";
      setMsg(m);
      saveState({ msg: m });
      return;
    }
    if (val === q.ans) {
      const m = noPointsThisQuestion ? "✅ נכון (בלי נקודות כי ביקשת סיפור)" : "✅ נכון";
      setMsg(m);
      saveState({ msg: m });
      triggerCatFx();
      incMultiplicationScoreIfAllowed();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1000);
      return;
    }
    triggerBadCatFx();
    const m = "❌ לא נכון";
    setMsg(m);
    saveState({ msg: m });
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 420, margin: "40px auto", direction: "rtl", textAlign: "right", position: "relative" }}>
      <CatCongrats />
      <CatUncongrats />
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
        תרגול כפל
      </h2>
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
        onChange={e => {
          setInput(e.target.value);
          saveState({ input: e.target.value });
        }}
        placeholder="תשובה"
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={checkAnswer} class="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:opacity-90">בדוק</button>
        <button onClick={goStory} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px" }} title="מתי החתול יספר סיפור על התרגיל הזה">ספר סיפור 😺</button>
        <button onClick={() => goNextQuestion(level)} style={{ background: "#0f172a", color: "white", border: "1px solid #0f172a", borderRadius: 8, padding: "6px 10px" }} title="עובר לתרגיל הבא ומנקה את הקודם">תרגיל הבא ➜</button>
      </div>
      {msg ? (
        <div className="mt-3 font-extrabold text-slate-800 dark:text-slate-200 transition-colors">
          {msg}
        </div>
      ) : null}
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-slate-900">{LEVEL_TEXT[level]?.title ?? "הסבר לרמה"}</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{LEVELS[level]?.label}</span>
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