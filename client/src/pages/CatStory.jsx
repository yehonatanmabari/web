import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import catReadGif from "../assets/cat-read.gif";
import { CAT_STORY_KB } from "../data/catStoryKB";
import { generateCatStory } from "../features/catStory/generateCatStory";

// ✅ Import your local fallback stories from /data
// Make sure this file exists: src/data/catLocalStories.js
// and exports: export const CAT_LOCAL_STORIES = [ ... ];
import { CAT_LOCAL_STORIES } from "../data/catLocalStories";

/**
 * Convert any value to a number safely.
 * If the value is not a valid number, return a fallback (default 1).
 */
function safeNum(x, fallback = 1) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Detect Vertex/Gemini "429 Resource exhausted" (rate limit / quota / temporary overload).
 * We check common fields + message text.
 */
function is429(err) {
  const msg = (err?.message || "").toLowerCase();
  const code = err?.code || err?.status || err?.response?.status;
  return code === 429 || msg.includes("429") || msg.includes("resource exhausted");
}

/**
 * Pick a local story in a ROUND-ROBIN order:
 * 0 -> 1 -> 2 -> ... -> back to 0
 *
 * We store the current index in sessionStorage so the next time
 * the user generates a story, it will use the next one.
 */
function pickLocalStoryByOrder(payload) {
  const key = "cat_story_index_v1";

  // Read previous index from sessionStorage (if any)
  const raw = sessionStorage.getItem(key);
  const idx = Number.isFinite(Number(raw)) ? Number(raw) : 0;

  // Choose the story function (or string) by index
  const i = idx % CAT_LOCAL_STORIES.length;
  const entry = CAT_LOCAL_STORIES[i];

  // Advance index for next time
  sessionStorage.setItem(key, String((idx + 1) % CAT_LOCAL_STORIES.length));

  // Support two formats:
  // 1) entry is a function: (payload) => "story text"
  // 2) entry is a string: "story text"
  if (typeof entry === "function") return entry(payload);
  return String(entry);
}

function computeAnswer(a, b, op) {
  console.log({ a, b, op });
  switch (op) {
    case "+":
        return a + b;
    case "*":
        return a * b;
    case "-":
        return a - b;
    case "/":
        return b !== 0 ? a / b : null;
    case "%":
        return b !== 0 ? a % b : null;
    default:
      return a + b; // safe fallback so demo never dies
  }
}

/**
 * Build a local fallback story + answer from the incoming state.
 * This is used when RAG/AI fails (429, offline, any error).
 *
 * Assumption: You demo only addition (+).
 * If something else arrives, we still produce a safe addition fallback.
 */
function buildLocalFallback(state) {
  const a = safeNum(state?.a, 1);
  const b = safeNum(state?.b, 1);
  const op = state?.op || "+";

  const answer = computeAnswer(a, b, op);

  
  // Get the next local story in order
  const storyText = pickLocalStoryByOrder({ a, b, answer, op, state });

  return { storyText, answer };
}

export default function CatStory() {
  // Gemini API key (client-side). If missing, RAG will fail and we fallback to local.
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // React Router state: expects { a, b, op: "+", ... } from the exercise page
  const { state } = useLocation();
  const navigate = useNavigate();

  // Optional UI state (you can show status for debugging)
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  // Prevent running twice (helps in some dev scenarios / re-renders)
  const didRunRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (didRunRef.current) return;
      didRunRef.current = true;

      setErr("");

      try {
        setStatus("Generating story (RAG) ...");

        /**
         * 1) TRY RAG FIRST:
         * generateCatStory will call Gemini/Vertex and use CAT_STORY_KB as the knowledge base.
         */
        const storyText = await generateCatStory({
          apiKey: API_KEY,
          state,
          kbLines: CAT_STORY_KB,
        });

        /**
         * Save result so the previous page can read it and show the story.
         * Then go back to the exercise page.
         */
        sessionStorage.setItem("cat_story_text", storyText);
        sessionStorage.setItem("cat_story_return", "1");
        navigate(-1);
      } catch (e) {
        console.error(e);

        /**
         * 2) IF RAG FAILS (429, offline, any error):
         * Use a local story fallback (round-robin) so the demo NEVER breaks.
         */
        const { storyText, answer } = buildLocalFallback(state);

        sessionStorage.setItem("cat_story_text", storyText);
        sessionStorage.setItem("cat_story_answer", String(answer));
        sessionStorage.setItem("cat_story_return", "1");

        /**
         * For a smooth presentation:
         * - You can hide errors completely (setErr(""))
         * - Or show a friendly message
         */
        setErr(is429(e) ? "AI is busy right now — switched to local story." : (e?.message || "Unknown error"));

        setStatus("fallback ✅");
        navigate(-1);
      }
    })();
  }, [API_KEY, navigate, state]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginTop: 0 }}>מתי החתול מכין סיפור... 🐱📚</h2>

      <img
        src={catReadGif}
        alt="מתי החתול קורא"
        style={{
          width: 220,
          maxWidth: "90%",
          margin: "12px auto",
          display: "block",
          borderRadius: 16,
        }}
      />

      {/* Uncomment if you want to see status while testing:
      <div style={{ fontSize: 12, color: "#64748b" }}>{status}</div>
      */}

      {err ? <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre> : null}

      <p style={{ marginTop: 10, color: "#475569" }}>
        עוד רגע מחזיר אותך לתרגיל...
      </p>
    </div>
  );
}
