import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";
import { AUTH_EVENT, isLoggedIn, getMode } from "./features/auth/authStore";
import {
  THEME_EVENT,
  getTheme,
  applyThemeToDom,
} from "./features/theme/themeStore";

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());
  const [mode, setMode] = useState(() => getMode()); // "child" | "parent"
  const [theme, setTheme] = useState(() => getTheme()); // "light" | "dark"

  useEffect(() => {
    // פעם אחת בהתחלה
    applyThemeToDom(getTheme());

    function onAuthChanged() {
      const a = isLoggedIn();
      setAuthed(a);
      setMode(a ? getMode() : "child");
    }

    function onThemeChanged() {
      const t = getTheme();
      setTheme(t);
      applyThemeToDom(t);
    }

    window.addEventListener(AUTH_EVENT, onAuthChanged);
    window.addEventListener(THEME_EVENT, onThemeChanged);

    return () => {
      window.removeEventListener(AUTH_EVENT, onAuthChanged);
      window.removeEventListener(THEME_EVENT, onThemeChanged);
    };
  }, []);

  return (
    <Layout authed={authed} setAuthed={setAuthed} mode={mode} theme={theme}>
      <AppRoutes authed={authed} mode={mode} />
    </Layout>
  );
}
