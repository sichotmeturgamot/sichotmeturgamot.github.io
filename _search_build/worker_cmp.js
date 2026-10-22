// שרת ניסוי — השוואה בין החיפוש הנוכחי (A) לחיפוש הדו־שלבי עם סינון ביטים (B). בלי Claude: רק דירוג לפי משמעות.
// דרוש: Binding מסוג Workers AI בשם AI. נקרא מ־compare.html.
const SITE = 'https://sichotmeturgamot.com/';
const ALLOWED = ['https://sichotmeturgamot.com', 'https://www.sichotmeturgamot.com', 'https://sichotmeturgamot.github.io', 'http://localhost:8765'];
const SCALE = 400, TOPN = 10, K = 300;
let IDX = null, TXT = null, BITS = null, KIDS = null;
const pop = x => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };

async function getBuf(name) {
  const res = await fetch(SITE + name + '?v=16', { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error(name + ' ' + res.status);
  return res.arrayBuffer();
}
async function loadAll() {
  if (!IDX) {
    const buf = await getBuf('search-vectors.bin'); const h = new Uint32Array(buf, 0, 4);
    const N = h[0], dim = h[1], np = h[2];
    IDX = { N, dim, np, delta: h[3] / 1000, parent: new Uint16Array(buf, 16, N), vec: new Int8Array(buf, 16 + 2 * N) };
    KIDS = Array.from({ length: np }, () => []); for (let i = np; i < N; i++) KIDS[IDX.parent[i]].push(i);
  }
  if (!BITS) { const b = await getBuf('search-bits.bin'); BITS = new Uint32Array(b, 8); }
  if (!TXT) {
    const buf = await getBuf('search-texts.bin'); const n = new Uint32Array(buf, 0, 1)[0];
    const off = new Uint32Array(buf, 4, n + 1), base = 4 + 4 * (n + 1), dec = new TextDecoder();
    TXT = i => dec.decode(new Uint8Array(buf, base + off[i], off[i + 1] - off[i]));
  }
}
const cors = o => ({ 'Access-Control-Allow-Origin': ALLOWED.includes(o) ? o : ALLOWED[0], 'Vary': 'Origin', 'Content-Type': 'application/json; charset=utf-8' });

export default {
  async fetch(req, env) {
    const h = cors(req.headers.get('Origin') || '');
    const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 200);
    if (q.length < 2) return new Response('{"error":"שאלה קצרה מדי"}', { status: 400, headers: h });
    try {
      await loadAll();
      const r = await env.AI.run('@cf/baai/bge-m3', { text: [q] }); const qv = (r.data || r.result.data)[0];
      const { N, dim, np, delta, parent, vec } = IDX;
      let n = 0; for (const x of qv) n += x * x; n = (Math.sqrt(n) || 1) * SCALE;
      const qf = new Float32Array(dim); for (let k = 0; k < dim; k++) qf[k] = qv[k] / n;
      const dot = i => { let s = 0, o = i * dim; for (let k = 0; k < dim; k++) s += vec[o + k] * qf[k]; return s; };
      // A — כמו היום: כל הקטעים, ואז חתיכות רק של 300 המובילים
      const A = new Float32Array(np), Am = new Int32Array(np).fill(-1);
      for (let p = 0; p < np; p++) A[p] = dot(p);
      const thr = Float32Array.from(A).sort()[Math.max(0, np - K)];
      for (let i = np; i < N; i++) { const p = parent[i]; if (A[p] < thr) continue; const s = dot(i) - delta; if (s > A[p]) { A[p] = s; Am[p] = i - np; } }
      // B — שלב 1: השוואת ביטים לכל הווקטורים; שלב 2: חישוב מדויק רק ל־300 המובילים והחתיכות שלהם
      const W4 = dim / 32, qb = new Uint8Array(dim / 8); for (let k = 0; k < dim; k++) if (qv[k] > 0) qb[k >> 3] |= 128 >> (k & 7);
      const q32 = new Uint32Array(qb.buffer), ap = new Int32Array(np).fill(-dim);
      for (let i = 0; i < N; i++) { let ham = 0, o = i * W4; for (let j = 0; j < W4; j++) ham += pop(BITS[o + j] ^ q32[j]);
        const p = i < np ? i : parent[i], s = dim - 2 * ham; if (s > ap[p]) ap[p] = s; }
      const hist = new Int32Array(2 * dim + 1); for (let p = 0; p < np; p++) hist[ap[p] + dim]++;   // סף ל־300 המובילים בלי מיון
      let c = 0, t = 2 * dim; for (; t > 0; t--) { c += hist[t]; if (c >= K) break; }
      const ord = []; for (let p = 0; p < np; p++) if (ap[p] + dim >= t) ord.push(p);
      const B = new Float32Array(np).fill(-9), Bm = new Int32Array(np).fill(-1);
      for (const p of ord) { B[p] = dot(p); for (const i of KIDS[p]) { const s = dot(i) - delta; if (s > B[p]) { B[p] = s; Bm[p] = i - np; } } }
      const top = (S) => Array.from({ length: np }, (_, p) => p).sort((a, b) => S[b] - S[a]).slice(0, TOPN);
      const ta = top(A), tb = top(B), ns = N - np;
      const item = (p, m, s) => { const [f, u, t] = TXT(2 * np + ns + p).split('\t'); return { p, t, f, u, s: +s.toFixed(3), x: (m >= 0 ? TXT(np + m) : TXT(np + ns + p)).slice(0, 260) }; };
      return new Response(JSON.stringify({ q, a: ta.map(p => item(p, Am[p], A[p])), b: tb.map(p => item(p, Bm[p], B[p])) }), { headers: h });
    } catch (e) { return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: h }); }
  }
};
