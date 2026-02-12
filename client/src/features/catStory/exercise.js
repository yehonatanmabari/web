export function normalizeExercise(raw) {
  const s = (raw || "").trim().replace(/\s+/g, "");
  return s.replace("×", "*").replace("÷", "/");
}

export function opName(op) {
  const O = normalizeExercise(op);
  if (O === "+") return "חיבור";
  if (O === "-") return "חיסור";
  if (O === "*") return "כפל";
  if (O === "/") return "חילוק";
  if (O === "%") return "אחוזים";
  return "פעולה";
}

/**
 * Build a question string + compute expected result.
 * Supports:
 * - arithmetic: { a, b, op: + - * / }
 * - percent:   { p, base, op: "%" } meaning: p% of base
 *
 * Returns:
 * { q, expected, allowedNums[], mode }
 */
export function buildQuestionAndAnswer(state) {
  const O = normalizeExercise(state?.op || "+");

  // Percent mode: p% of base
  if (O === "%") {
    const p = Number(state?.b);
    const base = Number(state?.a);
    if (!Number.isFinite(p) || !Number.isFinite(base)) return null;

    const expected = (base * p) / 100;
    if (!Number.isFinite(expected)) return null;

    const q = `${p}%of${base}`;
    return { q, expected, allowedNums: [p, base, expected], mode: "percent" };
  }

  // Arithmetic mode: a op b
  const a = Number(state?.a);
  const b = Number(state?.b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  let expected = null;
  switch (O) {
    case "+": expected = a + b; break;
    case "-": expected = a - b; break;
    case "*": expected = a * b; break;
    case "/":
      if (b === 0) return null;
      expected = a / b;
      break;
    default:
      return null;
  }

  if (!Number.isFinite(expected)) return null;

  const q = normalizeExercise(`${a}${O}${b}`);
  return { q, expected, allowedNums: [a, b, expected], mode: "arith" };
}

export function prettyExerciseForKids(q) {
  if (q.includes("%of")) {
    const mm = q.match(/^(-?\d+)%of(-?\d+)$/);
    if (mm) return `${mm[1]}% מתוך ${mm[2]}`;
  }
  return q;
}
