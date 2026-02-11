// Shared session state helpers

export function savePracticeState(key, state, next = {}) {
  sessionStorage.setItem(
    key,
    JSON.stringify({ ...state, ...next })
  );
}

export function clearPracticeState(key) {
  sessionStorage.removeItem(key);
}

export function getPracticeState(key) {
  const saved = sessionStorage.getItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}