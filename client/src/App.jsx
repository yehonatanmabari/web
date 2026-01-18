import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";
import { AUTH_EVENT, isLoggedIn, getMode } from "./features/auth/authStore";

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());
  const [mode, setMode] = useState(() => getMode()); // "child" | "parent"

  useEffect(() => {
    function onAuthChanged() {
      const a = isLoggedIn();
      setAuthed(a);

      // אם לא מחובר — אין משמעות למצב הורה
      setMode(a ? getMode() : "child");
    }

    window.addEventListener(AUTH_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_EVENT, onAuthChanged);
  }, []);

  return (
    <Layout authed={authed} setAuthed={setAuthed} mode={mode}>
      <AppRoutes authed={authed} mode={mode} />
    </Layout>
  );
}
