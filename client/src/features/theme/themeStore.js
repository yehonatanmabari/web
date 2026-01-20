export const THEME_EVENT = "theme_changed";
const THEME_KEY = "theme_v1"; // "light" | "dark"

export function getTheme() {
  const t = localStorage.getItem(THEME_KEY);
  return t === "dark" ? "dark" : "light";
}

export function setTheme(next) {
  const value = next === "dark" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, value);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function applyThemeToDom(theme = getTheme()) {
  const root = document.documentElement; // <html>
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}