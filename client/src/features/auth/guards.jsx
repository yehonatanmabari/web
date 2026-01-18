// src/features/auth/guards.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ authed, children }) {
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export function PublicOnlyRoute({ authed, children }) {
  if (authed) return <Navigate to="/start" replace />;
  return children;
}


