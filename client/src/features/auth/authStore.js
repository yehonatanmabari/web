// src/features/auth/authStore.js

export const AUTH_EVENT = "auth-changed";

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// ==================================================
// MODE (מי רואה מה: child / parent)
// ==================================================
export function getMode() {
  return localStorage.getItem("mode") || "child";
}

export function setMode(mode) {
  localStorage.setItem("mode", mode); // "child" | "parent"
  notifyAuthChanged();
}

// ==================================================
// CHILD AUTH (המערכת הקיימת שלך)
// ==================================================
export function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "1";
}

export function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("age");
  localStorage.removeItem("mode"); // ✅ חשוב: לא להיתקע במצב parent/child
  notifyAuthChanged();
}

// ==================================================
// PARENT AUTH (חדש - לא מתנגש בילד)
// ==================================================
export function isParentLoggedIn() {
  return localStorage.getItem("parent_isLoggedIn") === "1";
}

export function loginParent(childUsername) {
  localStorage.setItem("parent_isLoggedIn", "1");
  localStorage.setItem("parent_childUsername", childUsername);
  localStorage.setItem("mode", "parent"); // ✅ כניסת הורה מפעילה מצב הורה
  notifyAuthChanged();
}

export function logoutParent() {
  localStorage.removeItem("parent_isLoggedIn");
  localStorage.removeItem("parent_childUsername");
  localStorage.removeItem("mode"); // ✅ חוזרים לברירת מחדל
  notifyAuthChanged();
}

export function getParentChildUsername() {
  return localStorage.getItem("parent_childUsername") || "";
}
