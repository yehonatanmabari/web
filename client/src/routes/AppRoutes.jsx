import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage.jsx";
import Register from "../pages/Register.jsx";
import About from "../pages/About.jsx";
import Start from "../pages/Start.jsx";

import AdditionPractice from "../pages/AdditionPractice.jsx";
import SubtractionPractice from "../pages/SubtractionPractice.jsx";
import MultiplicationPractice from "../pages/MultiplicationPractice.jsx";
import DivisionPractice from "../pages/DivisionPractice.jsx";
import PracticePercent from "../pages/PracticePercent.jsx";
import CatStory from "../pages/CatStory.jsx";

import ParentLogin from "../pages/ParentLogin.jsx";
import ParentReport from "../pages/ParentReport.jsx";

import { ProtectedRoute, PublicOnlyRoute } from "../features/auth/guards";

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-extrabold text-rose-600">אופס! 🐾</div>
        <p className="mt-2 text-slate-700">הדף לא נמצא. בדוק את הכתובת או חזור לתפריט למעלה.</p>
      </div>
    </div>
  );
}

export default function AppRoutes({ authed, mode }) {
  const isParent = authed && mode === "parent";

  return (
    <Routes>
      {/* ✅ כניסה ראשית: הורה -> /parent, ילד -> /start */}
      <Route
        path="/"
        element={<Navigate to={!authed ? "/login" : isParent ? "/parent" : "/start"} replace />}
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute authed={authed}>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute authed={authed}>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* ✅ כניסת הורה (פתוח גם כשלא מחובר) */}
      <Route path="/parent-login" element={<ParentLogin />} />

      {/* ✅ מסך הורה (דורש authed=true כמו אצלך) */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute authed={authed}>
            <ParentReport />
          </ProtectedRoute>
        }
      />

      <Route path="/about" element={<About />} />

      <Route
        path="/start"
        element={
          <ProtectedRoute authed={authed}>
            {isParent ? <Navigate to="/parent" replace /> : <Start />}
          </ProtectedRoute>
        }
      />

      {/* ✅ תרגולים: אם מצב הורה -> חסימה */}
      <Route
        path="/addition"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <AdditionPractice />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/subtraction"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <SubtractionPractice />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/multiplication"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <MultiplicationPractice />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/division"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <DivisionPractice />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/percent"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <PracticePercent />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/cat-story"
        element={
          isParent ? (
            <Navigate to="/parent" replace />
          ) : (
            <ProtectedRoute authed={authed}>
              <CatStory />
            </ProtectedRoute>
          )
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
