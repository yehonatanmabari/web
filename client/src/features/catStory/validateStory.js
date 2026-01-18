/**
 * Validate that the story:
 * 1) contains the exact mustLine: "q = expected"
 * 2) contains ONLY allowed numbers (no extra numbers)
 * 3) q format is either:
 *    - arith:   "A+B" / "A-B" / "A*B" / "A/B"
 *    - percent: "p%ofbase"
 */
export function isValidStory(story, q, expected, allowedNums) {
  if (!story) return false;

  const mustLine = `${q} = ${expected}`;
  if (!story.includes(mustLine)) return false;

  const nums = (story.match(/-?\d+(\.\d+)?/g) || []).map(Number);

  const arithOK = /^-?\d+([+\-*/])-?\d+$/.test(q);
  const percentOK = /^-?\d+%of-?\d+$/.test(q);
  if (!arithOK && !percentOK) return false;

  const allowed = new Set((allowedNums || []).map((x) => Number(x)));
  return nums.every((n) => allowed.has(n));
}
