export function chunkText(text, size = 220, overlap = 40) {
  const clean = text.trim().replace(/\s+/g, " ");
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    chunks.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return chunks.filter(Boolean);
}

export function cosineSim(a, b) {
  const n = Math.min(a?.length || 0, b?.length || 0);
  if (!n) return -1;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}
