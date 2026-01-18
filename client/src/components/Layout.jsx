import React from "react";
import { useNavigate } from "react-router-dom";
import Tab from "./Tab";
import logo from "../assets/logo.svg";
import { logoutUser, getMode, setMode } from "../features/auth/authStore";

export default function Layout({ authed, setAuthed, children }) {
  const navigate = useNavigate();

  // ✅ מצב תצוגה: child / parent
  const mode = getMode();
  const isParent = authed && mode === "parent";

  function logout() {
    logoutUser();          // מוחק גם mode (כמו שסידרנו ב-authStore)
    setAuthed(false);      // עדכון מיידי ל-UI
    navigate("/login", { replace: true });
  }

  function switchToChild() {
    setMode("child");
    navigate("/start", { replace: true });
  }

  function switchToParent() {
    setMode("parent");
    navigate("/parent", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-emerald-200 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6">
        <header className="mb-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-sm">
                  <img src={logo} alt="Mati the Cat logo" className="h-9 w-9" />
                </div>

                <div className="leading-tight">
                  <div className="text-lg font-black text-slate-900">
                    מתי החתול
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                      חשבון בקלות
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-600">
                    {!authed
                      ? "קודם נכנסים / נרשמים — ואז מתחילים לתרגל 😺"
                      : isParent
                      ? "מצב הורה: צפייה בדוח בלבד 👨‍👩‍👧"
                      : "לומדים בכיף 🐾"}
                  </div>
                </div>
              </div>

              {authed && (
                <div className="flex items-center gap-2">
                  {/* ✅ החלפת מצב (אופציונלי אבל שימושי) */}
                  {isParent ? (
                    <button
                      onClick={switchToChild}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                      title="מעבר למצב ילד"
                    >
                      <span className="text-base">🧒</span>
                      מצב ילד
                    </button>
                  ) : (
                    <button
                      onClick={switchToParent}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                      title="מעבר למצב הורה"
                    >
                      <span className="text-base">👨‍👩‍👧</span>
                      מצב הורה
                    </button>
                  )}

                  <button
                    onClick={logout}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
                    title="ניתוק"
                  >
                    <span className="text-base">🚪</span>
                    ניתוק
                  </button>
                </div>
              )}
            </div>

            {!authed ? (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/login" emoji="🔐">כניסה</Tab>
                <Tab to="/register" emoji="📝">הרשמה</Tab>
                <Tab to="/parent-login" emoji="👨‍👩‍👧">כניסת הורה</Tab>
                <Tab to="/about" emoji="ℹ️">אודות</Tab>
              </nav>
            ) : isParent ? (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/parent" emoji="📋">דוח הורה</Tab>
                <Tab to="/about" emoji="ℹ️">אודות</Tab>
              </nav>
            ) : (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/start" emoji="🏠">בית</Tab>
                <Tab to="/addition" emoji="➕">חיבור</Tab>
                <Tab to="/subtraction" emoji="➖">חיסור</Tab>
                <Tab to="/multiplication" emoji="✖️">כפל</Tab>
                <Tab to="/division" emoji="➗">חילוק</Tab>
                <Tab to="/percent" emoji="📊">אחוזים</Tab>
                <Tab to="/about" emoji="ℹ️">אודות</Tab>
              </nav>
            )}
          </div>
        </header>

        <main className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          {children}
        </main>

        <footer className="mt-6 text-center text-xs font-semibold text-slate-600">
          טיפ: אם טעית — זה בסדר! חתולים לומדים לאט ובטוח 😺
        </footer>
      </div>
    </div>
  );
}
