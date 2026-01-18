// src/pages/ParentLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkLogin } from "../services/authService";
import { loginParent } from "../features/auth/authStore"; // ✅ חדש

export default function ParentLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const { res, data } = await checkLogin(username, password);
      if (!res?.ok || !data?.ok) {
        setErr("שם משתמש או סיסמה שגויים");
        return;
      }

      // ✅ זה מה שחסר: מכניס למצב הורה + שומר מי הילד + dispatch event
    // ✅ כדי ש-ProtectedRoute יעבור:
        localStorage.setItem("isLoggedIn", "1");
        localStorage.setItem("username", username);

// ✅ מצב הורה (מגדיר mode=parent + notifyAuthChanged)
        loginParent(username);

      nav("/parent", { replace: true });
      nav("/parent", { replace: true });
    } catch (e2) {
      setErr(e2?.message === "Failed to fetch" ? "השרת לא זמין או בעיית רשת" : (e2?.message || "שגיאה"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-extrabold text-slate-900">כניסת הורה</div>
        <p className="mt-1 text-slate-600">הזדהות עם שם המשתמש והסיסמה של הילד</p>

        {err && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-bold text-slate-700">שם משתמש</span>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-bold text-slate-700">סיסמה</span>
            <input
              type="password"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            disabled={loading}
            className="mt-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "בודק..." : "כניסה לדוח"}
          </button>
        </form>
      </div>
    </div>
  );
}
