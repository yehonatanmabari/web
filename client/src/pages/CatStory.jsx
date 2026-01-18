import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import catReadGif from "../assets/cat-read.gif";
import { CAT_STORY_KB } from "../data/catStoryKB";
import { generateCatStory } from "../features/catStory/generateCatStory";

export default function CatStory() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const { state } = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const didRunRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (didRunRef.current) return;
      didRunRef.current = true;

      setErr("");
      try {
        setStatus("Generating story...");

        const storyText = await generateCatStory({
          apiKey: API_KEY,
          state,
          kbLines: CAT_STORY_KB,
        });

        sessionStorage.setItem("cat_story_text", storyText);
        sessionStorage.setItem("cat_story_return", "1");
        navigate(-1);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
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

      {/* <div style={{ fontSize: 12, color: "#64748b" }}>{status}</div> */}

      {err ? <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre> : null}

      <p style={{ marginTop: 10, color: "#475569" }}>
        עוד רגע מחזיר אותך לתרגיל...
      </p>
    </div>
  );
}
