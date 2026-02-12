import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import catWelcomeGif from "../assets/CatWelcome.gif";
import { registerUser } from "../services/authService";
import { notifyAuthChanged } from "../features/auth/authStore";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const timerRef = useRef(null);

  // ✅ If already logged in -> go to Start
  useEffect(() => {
    if (showGif) return;
    if (localStorage.getItem("isLoggedIn") === "1") {
      navigate("/start", { replace: true });
    }
  }, [navigate, showGif]);

  // cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const u = username.trim();
    const p = password.trim();
    const a = String(age).trim();

    if (u === "" || p === "" || a === "") {
      setMsg("הכנס שם משתמש, סיסמה וגיל");
      return;
    }

    const ageNum = Number(a);
    if (!Number.isInteger(ageNum) || ageNum < 6 || ageNum > 12) {
      setMsg("גיל חייב להיות בין 6 ל-12");
      return;
    }

    setLoading(true);
    setMsg("נרשם...");

    try {
      const { res, data } = await registerUser(u, p, ageNum);

      // תואם לקוד השרת שלך: success
      if (!res.ok || !data?.success) {
        setMsg(data?.error || "הרשמה נכשלה");
        return;
      }

      setMsg("נרשמת בהצלחה ✅");
      setShowGif(true);

      timerRef.current = setTimeout(() => {
        localStorage.setItem("isLoggedIn", "1");
        localStorage.setItem("username", u);
        localStorage.setItem("age", String(ageNum));

        // ✅ Tell App.jsx to refresh "authed"
        notifyAuthChanged();


        // ✅ Go to Start after register
        navigate("/start", { replace: true });
      }, 800);

      return;
    } catch {
      setMsg("השרת לא זמין");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "Arial" }}>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
        הרשמה</h2>

      <form onSubmit={onSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="שם משתמש"
          style={{ padding: "10px", width: "100%", marginBottom: 10 }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          type="password"
          style={{ padding: "10px", width: "100%", marginBottom: 10 }}
        />

        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="גיל (6-12)"
          type="number"
          min="6"
          max="12"
          style={{ padding: "10px", width: "100%", marginBottom: 10 }}
        />

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }} class="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:opacity-90">
          {loading ? "נרשם..." : "הירשם"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>{msg}</p>

      {showGif && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 22,
              padding: 18,
              textAlign: "center",
              width: 320,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <img
              src={catWelcomeGif}
              alt="Cat Welcome"
              width={240}
              height={240}
              style={{ borderRadius: 18, display: "block", margin: "0 auto" }}
            />
            <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
              נרשמת בהצלחה! 🐱✨
            </div>
            <div style={{ color: "#555", marginTop: 4 }}>עוד רגע מתחילים…</div>
          </div>
        </div>
      )}
    </div>
  );
}




