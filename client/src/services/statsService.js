import { apiFetch } from "./api";

export async function getUserStats(username, signal) {
  return apiFetch("/user/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
    signal,
  });
}