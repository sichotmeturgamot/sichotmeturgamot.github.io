// שרת החיפוש הסמנטי — גרסה 6: חיפוש לפי משמעות + Claude בוחר את הקטעים המתאימים ביותר
// Claude חושב מעט (effort: low) לפני שהוא בוחר
// דרוש: Binding מסוג Workers AI בשם AI, וסוד בשם ANTHROPIC_API_KEY
const SITE = 'https://sichotmeturgamot.com/';
const ALLOWED = ['https://sichotmeturgamot.com', 'https://www.sichotmeturgamot.com',
                 'https://sichotmeturgamot.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const MAX_Q = 200, TOP = 5, CAND = 30, PER_MIN = 12, SCALE = 400;
const MODEL = 'claude-haiku-5-5';

let IDX = null, TXT = null;
const hits = new Map();

async function getBuf(name) {
  const res = await fetch(SITE + name + '?v=6', { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error(name + ' ' + res.status);
  return res.arrayBuffer();
}
async function loadIdx() {
  if (IDX) return IDX;
  const buf = await getBuf('search-vectors.bin');
  const h = new Uint32Array(buf, 0, 4);
  const N = h[0], dim = h[1], np = h[2], delta = h[3] / 1000;
  return (IDX = { N, dim, np, delta, parent: new Uint16Array(buf, 16, N), vec: new Int8Array(buf, 16 + 2 * N) });
}
async function loadTxt() {
  if (TXT) return TXT;
  const buf = await getBuf('search-texts.bin');
  const n = new Uint32Array(buf, 0, 1)[0];
  const off = new Uint32Array(buf, 4, n + 1), base = 4 + 4 * (n + 1);
  const dec = new TextDecoder();
  return (TXT = i => dec.decode(new Uint8Array(buf, base + off[i], off[i + 1] - off[i])));
}

function cors(origin) {
  const ok = ALLOWED.includes(origin);
  return { 'Access-Control-Allow-Origin': ok ? origin : ALLOWED[0], 'Vary': 'Origin',
           'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...h } });

async function claude(env, prompt, maxTokens) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: ctl.signal,
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, output_config: { effort: 'low' }, messages: [{ role: 'user', content: prompt }] })
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || ('status ' + r.status));
    return j.content.filter(c => c.type === 'text').map(c => c.text).join('');
  } finally { clearTimeout(t); }
}

async function rerank(env, q, cands, txt, np, ns) {
  const list = cands.map((c, k) => {
    const head = txt(c.p);                                  // "שם השיחה | תיאור"
    const body = c.m >= 0 ? txt(np + c.m) : txt(np + ns + c.p); // החתיכה שהתאימה, או תחילת הקטע
    return `[${k + 1}] ${head}\n${body}`;
  }).join('\n\n');
  const prompt = `להלן קטעים מספר השיחות של כ"ק אדמו"ר הריי"צ. לכל קטע: שם השיחה, תקציר הנושאים שלו, ומובאה מהטקסט.

<קטעים>
${list}
</קטעים>

שאלת הלומד: ${q}

בחר עד ${TOP} קטעים שעוסקים ישירות בנושא השאלה או עונים עליה — גם אם הם משתמשים במילים אחרות (שים לב לתקציר הנושאים). דרג מהמתאים ביותר. אל תבחר קטעים שהקשר שלהם לשאלה רחוק.
כתוב בתשובה רק את מספרי הקטעים, מופרדים בפסיקים. אם אין אף קטע מתאים — כתוב 0.`;
  const out = await claude(env, prompt, 3000);
  rerank.last = out;
  const lastLine = out.trim().split('\n').pop();
  const nums = (lastLine.match(/\d+/g) || []).map(Number).filter(n => n >= 1 && n <= cands.length);
  return [...new Set(nums)].slice(0, TOP).map(n => cands[n - 1]);
}

export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get('Origin') || '';
    const h = cors(origin);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const url = new URL(req.url);

    if (url.searchParams.has('check')) {                    // בדיקת חיבור המפתח
      if (!env.ANTHROPIC_API_KEY) return json({ ok: false, msg: 'הסוד ANTHROPIC_API_KEY לא מוגדר בשרת' }, 200, h);
      try { await claude(env, 'ענה במילה אחת: שלום', 5); return json({ ok: true, msg: 'המפתח עובד ✓' }, 200, h); }
      catch (e) { return json({ ok: false, msg: 'שגיאה: ' + e.message }, 200, h); }
    }
    if (origin && !ALLOWED.includes(origin)) return json({ error: 'forbidden' }, 403, h);

    const q = (url.searchParams.get('q') || '').trim().slice(0, MAX_Q);
    if (q.length < 2) return json({ error: 'שאלה קצרה מדי' }, 400, h);

    const cache = caches.default, ckey = new Request('https://cache.sichos/v6?q=' + encodeURIComponent(q) + '&x=' + (url.searchParams.get('x') || ''));
    const debug = url.searchParams.has('debug');
    const cached = debug ? null : await cache.match(ckey);
    if (cached) { const r = new Response(cached.body, cached); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }

    const ip = req.headers.get('CF-Connecting-IP') || 'x', now = Date.now();
    const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
    if (arr.length >= PER_MIN) return json({ error: 'יותר מדי חיפושים, נסו שוב בעוד דקה' }, 429, h);
    arr.push(now); hits.set(ip, arr);
    if (hits.size > 5000) hits.clear();

    try {
      const idx = await loadIdx();
      const r = await env.AI.run('@cf/baai/bge-m3', { text: [q] });
      const qv = (r.data || (r.result && r.result.data))[0];
      let n = 0; for (let i = 0; i < qv.length; i++) n += qv[i] * qv[i];
      n = (Math.sqrt(n) || 1) * SCALE;
      const { N, dim, np, delta, parent, vec } = idx;
      const best = new Map();
      for (let i = 0; i < N; i++) {
        let s = 0; const o = i * dim;
        for (let k = 0; k < dim; k++) s += vec[o + k] * qv[k];
        s /= n;
        const isSmall = i >= np;
        if (isSmall) s -= delta;
        const p = parent[i], cur = best.get(p);
        if (!cur || s > cur[0]) best.set(p, [s, isSmall ? i - np : -1]);
      }
      let cands = [...best.entries()].sort((a, b) => b[1][0] - a[1][0]).slice(0, CAND)
                    .map(([p, [s, m]]) => ({ p, m, s: +s.toFixed(3) }));
      const xs = (url.searchParams.get('x') || '').split(',').map(Number)          // מועמדים נוספים מהמפתח
                   .filter(p => Number.isInteger(p) && p >= 0 && p < np).slice(0, 10);
      for (const p of xs) if (!cands.some(c => c.p === p)) { const b = best.get(p); cands.push({ p, m: b ? b[1] : -1, s: b ? +b[0].toFixed(3) : 0 }); }
      let results = cands.slice(0, TOP), ranked = false;
      rerank.last = rerank.err = null;
      if (env.ANTHROPIC_API_KEY) {
        try {
          const txt = await loadTxt();
          const picked = await rerank(env, q, cands, txt, np, N - np);
          ranked = true;
          results = picked.length ? picked : [];
        } catch (e) { rerank.err = String(e.message || e); }
      }
      if (debug) {
        const txt = await loadTxt();
        return json({ q, ranked, claude: rerank.last || null, err: rerank.err || null, results,
          cands: cands.map((c, k) => (k + 1) + '. ' + txt(c.p).slice(0, 70) + ' (' + c.s + ')') }, 200, h);
      }
      const resp = json({ results, ranked }, 200, { ...h, 'Cache-Control': 'public, max-age=86400' });
      ctx.waitUntil(cache.put(ckey, resp.clone()));
      return resp;
    } catch (e) {
      return json({ error: 'שגיאת חיפוש, נסו שוב' }, 500, h);
    }
  }
};
