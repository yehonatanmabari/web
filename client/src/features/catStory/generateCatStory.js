import { GoogleGenAI } from "@google/genai";
import { chunkText, cosineSim } from "./rag";
import { buildQuestionAndAnswer, opName, prettyExerciseForKids } from "./exercise";
import { isValidStory } from "./validateStory";
import { buildPrompt } from "./promptBuilder";

export async function generateCatStory({ apiKey, state, kbLines }) {
  if (!apiKey) {
    throw new Error("חסר VITE_GEMINI_API_KEY ב-.env/.env.local ואז צריך restart ל-vite");
  }

  const ai = new GoogleGenAI({ apiKey });

  const docs = chunkText(kbLines.join("\n"), 220, 40);

  // 1) Index KB embeddings
  const emb = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: docs,
  });
  const vecs = emb.embeddings.map((e) => e.values);

  // 2) Build exercise q/expected
  const qa = buildQuestionAndAnswer(state);
  if (!qa) throw new Error("התרגיל לא תקין (בדוק את הנתונים שנשלחו לדף הסיפור).");

  const { q, expected, allowedNums } = qa;

  // 3) Embed question
  const qEmb = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: q,
  });

  const qVec = qEmb.embeddings?.[0]?.values;
  if (!qVec) throw new Error("Question embedding missing");

  // 4) Retrieve context
  const scored = docs
    .map((text, i) => ({ text, score: cosineSim(qVec, vecs[i]) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 4);

  const context = scored.map((s, idx) => `Source ${idx + 1}: ${s.text}`).join("\n\n");

  const mustLine = `${q} = ${expected}`;
  const exerciseForKids = prettyExerciseForKids(q);
  const onlyNumsText = allowedNums.join(", ");
  const opLabel = opName(state?.op);

  async function generateOnce(strict) {
    const prompt = buildPrompt({
      mustLine,
      onlyNumsText,
      opLabel,
      context,
      exerciseForKids,
      strict,
    });

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      // generationConfig: { temperature: 0, topP: 0.1 },
    });

    return res?.text || "";
  }

  // 5) Generate + validate
  let storyText = await generateOnce(false);
  if (!isValidStory(storyText, q, expected, allowedNums)) {
    storyText = await generateOnce(true);
  }

  // 6) Final fallback
  if (!isValidStory(storyText, q, expected, allowedNums)) {
    const lines = (storyText || "").split("\n").filter(Boolean);
    const fixed = [
      lines[0] || "מתי החתול לומד חשבון עם צעצועים.",
      mustLine,
      lines[2] || "הוא סופר לאט ובודק שלא מתבלבל.",
    ].slice(0, 4);
    storyText = fixed.join("\n");
  }

  return storyText;
}
