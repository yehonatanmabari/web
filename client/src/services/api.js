export const API_BASE = "http://localhost:3000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const msg = data?.error || `HTTP_${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
