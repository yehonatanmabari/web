const API_BASE = "http://localhost:3000";

export async function checkLogin(username, password) {
  const res = await fetch(`${API_BASE}/check-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function registerUser(username, password, age) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, age }),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}
