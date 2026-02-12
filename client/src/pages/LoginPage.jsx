import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import catWelcomeGif from "../assets/CatWelcome.gif";
import { checkLogin } from "../services/authService";
import { notifyAuthChanged } from "../features/auth/authStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showGif, setShowGif] = useState(false);
  const timerRef = useRef(null);

  // ✅ If already logged in -> go to Start (not addition)
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

    if (username.trim() === "" || password.trim() === "") {
      setMsg("הכנס שם משתמש וסיסמה");
      return;
    }

    setLoading(true);
    setMsg("בודק...");

    try {
      const { res, data } = await checkLogin(username, password);

      if (!res.ok) {
        setMsg(data?.error || "שגיאה");
        return;
      }

      if (data.ok) {
        setMsg("התחברות הצליחה ✅");
        setShowGif(true);

        timerRef.current = setTimeout(() => {
          localStorage.setItem("isLoggedIn", "1");
          localStorage.setItem("username", username.trim());

          // ✅ Tell App.jsx to refresh "authed"
          notifyAuthChanged();
          


          // ✅ Go to Start after login
          navigate("/start", { replace: true });
        }, 800);

        return;
      }

      setMsg(data.reason === "NO_USER" ? "שם משתמש לא קיים ❌" : "סיסמה לא נכונה ❌");
    } catch {
      setMsg("השרת לא זמין");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "Arial" }}>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
        בדיקת התחברות
        </h2>

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

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }} class="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:opacity-90">
          {loading ? "בודק..." : "בדוק"}
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
              width: 340,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <img
              src={catWelcomeGif}
              alt="Cat Welcome"
              width={260}
              height={240}
              style={{ borderRadius: 18, display: "block", margin: "0 auto" }}
            />
            <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
              התחברת בהצלחה! 🐱✨
            </div>
            <div style={{ color: "#555", marginTop: 4 }}>עוד רגע מתחילים…</div>
          </div>
        </div>
      )}
    </div>
  );
}
