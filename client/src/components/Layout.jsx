import React from "react";
import { useNavigate } from "react-router-dom";
import Tab from "./Tab";
import logo from "../assets/logo.svg";
import { logoutUser, getMode, setMode } from "../features/auth/authStore";
import { toggleTheme } from "../features/theme/themeStore";

export default function Layout({ authed, setAuthed, theme, children }) {
  const navigate = useNavigate();

  // ✅ מצב תצוגה: child / parent
  const mode = getMode();
  const isParent = authed && mode === "parent";

  function logout() {
    logoutUser();
    setAuthed(false);
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
    <div
      className="
        min-h-screen
        bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50
        dark:from-slate-950 dark:via-slate-950 dark:to-slate-950
      "
    >
      {/* blobs */}
      <div className="pointer-events-none fixed inset-0 opacity-60 dark:opacity-35">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200 blur-3xl dark:bg-sky-900/40" />
        <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-emerald-200 blur-3xl dark:bg-emerald-900/40" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200 blur-3xl dark:bg-amber-900/40" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6">
        <header className="mb-5">
          <div
            className="
              flex flex-col gap-3 rounded-3xl border p-4 shadow-sm backdrop-blur
              border-white/60 bg-white/70
              dark:border-slate-800 dark:bg-slate-900/60
            "
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="
                    grid h-12 w-12 place-items-center rounded-2xl shadow-sm ring-1
                    bg-white/80 ring-slate-200
                    dark:bg-slate-950/40 dark:ring-slate-700
                  "
                >
                  <img src={logo} alt="Mati the Cat logo" className="h-9 w-9" />
                </div>

                <div className="leading-tight">
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                    מתי החתול
                    <span
                      className="
                        ml-2 rounded-full px-2 py-0.5 text-xs font-extrabold
                        bg-amber-100 text-amber-700
                        dark:bg-amber-500/15 dark:text-amber-200
                      "
                    >
                      חשבון בקלות
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {!authed
                      ? "קודם נכנסים / נרשמים — ואז מתחילים לתרגל 😺"
                      : isParent
                      ? "מצב הורה: צפייה בדוח בלבד 👨‍👩‍👧"
                      : "לומדים בכיף 🐾"}
                  </div>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2">
                {/* 🌙 Dark mode toggle (זמין תמיד) */}
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="
                    inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm ring-1
                    bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 active:scale-[0.98]
                    dark:bg-slate-950/40 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900/60
                  "
                  title="החלפת ערכת צבע"
                >
                  <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
                  {theme === "dark" ? "Dark" : "Light"}
                </button>

                {authed && (
                  <>
                    {/* ✅ החלפת מצב */}
                    {isParent ? (
                      <button
                        onClick={switchToChild}
                        type="button"
                        className="
                          inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm ring-1
                          bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 active:scale-[0.98]
                          dark:bg-slate-950/40 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900/60
                        "
                        title="מעבר למצב ילד"
                      >
                        <span className="text-base">🧒</span>
                        מצב ילד
                      </button>
                    ) : (
                      <button
                        onClick={switchToParent}
                        type="button"
                        className="
                          inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm ring-1
                          bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 active:scale-[0.98]
                          dark:bg-slate-950/40 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900/60
                        "
                        title="מעבר למצב הורה"
                      >
                        <span className="text-base">👨‍👩‍👧</span>
                        מצב הורה
                      </button>
                    )}

                    <button
                      onClick={logout}
                      type="button"
                      className="
                        inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm ring-1
                        bg-white text-slate-800 ring-slate-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]
                        dark:bg-slate-950/40 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-200
                      "
                      title="ניתוק"
                    >
                      <span className="text-base">🚪</span>
                      ניתוק
                    </button>
                  </>
                )}
              </div>
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

        <main
          className="
            rounded-3xl border p-4 shadow-sm backdrop-blur sm:p-6
            border-white/60 bg-white/80
            dark:border-slate-800 dark:bg-slate-900/60
          "
        >
          {children}
        </main>

        <footer className="mt-6 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
          טיפ: אם טעית — זה בסדר! חתולים לומדים לאט ובטוח 😺
        </footer>
      </div>
    </div>
  );
}
