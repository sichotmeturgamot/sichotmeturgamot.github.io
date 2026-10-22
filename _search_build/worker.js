// שרת החיפוש הסמנטי — גרסה 17: חיפוש דו־שלבי (ביטים ואז מדויק). גרסה 15: סינון לפי מקור (src) ו"עוד תוצאות" (more). גרסה 10 (הטקסט לתצוגה נשלח מהשרת): חיפוש מקורות (Claude בוחר קטעים) + "שאל את ה-AI" (תשובה מנוסחת עם מראי מקומות)
// Claude חושב מעט (effort: low) לפני שהוא בוחר
// דרוש: Binding מסוג Workers AI בשם AI, וסוד בשם ANTHROPIC_API_KEY
const SITE = 'https://sichotmeturgamot.com/';
const ALLOWED = ['https://sichotmeturgamot.com', 'https://www.sichotmeturgamot.com',
                 'https://sichotmeturgamot.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const MAX_Q = 200, TOP = 5, CAND = 60, PER_MIN = 12, SCALE = 400;
const A_CAND = 80, A_X = 30, A_TOP = 12, A_PER_MIN = 6;   // מצב תשובה
const MODEL = 'claude-haiku-5-5';

let IDX = null, TXT = null, GRP = null, BITS = null;
const K1 = 300;   // שלב 1 (ביטים) בוחר את 300 הקטעים המובילים; רק עליהם החישוב המדויק
const pop = x => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };
const hits = new Map();

async function getBuf(name) {
  const res = await fetch(SITE + name + '?v=18', { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error(name + ' ' + res.status);
  return res.arrayBuffer();
}
async function loadIdx() {
  if (IDX) return IDX;
  const buf = await getBuf('search-vectors.bin');
  const h = new Uint32Array(buf, 0, 4);
  const N = h[0], dim = h[1], np = h[2], delta = h[3] / 1000;
  const parent = new Uint16Array(buf, 16, N), kids = Array.from({ length: np }, () => []);
  for (let i = np; i < N; i++) kids[parent[i]].push(i);
  return (IDX = { N, dim, np, delta, parent, kids, vec: new Int8Array(buf, 16 + 2 * N) });
}
async function loadBits() {   // search-bits.bin: לכל וקטור ביט לכל ממד (חיובי/לא) — לסינון ראשוני מהיר
  if (BITS) return BITS;
  return (BITS = new Uint32Array(await getBuf('search-bits.bin'), 8));
}
async function loadTxt() {
  if (TXT) return TXT;
  const buf = await getBuf('search-texts.bin');
  const n = new Uint32Array(buf, 0, 1)[0];
  const off = new Uint32Array(buf, 4, n + 1), base = 4 + 4 * (n + 1);
  const dec = new TextDecoder();
  return (TXT = i => dec.decode(new Uint8Array(buf, base + off[i], off[i + 1] - off[i])));
}

// קבוצת מקור לכל קטע: s = ספר השיחות (יש f), l = לקוטי דיבורים (HebrewBooks), r = רשימות ואגרות (כל השאר)
function groups(txt, np, ns) {
  if (GRP) return GRP;
  const g = new Uint8Array(np);
  for (let p = 0; p < np; p++) { const [f, u, t] = txt(2 * np + ns + p).split('\t');
    g[p] = f || (t && t.startsWith('ספר השיחות')) ? 115 : (u && u.indexOf('hebrewbooks') >= 0 ? 108 : 114); }   // ספר השיחות: קובץ באתר, או התרגום של קה"ת
  return (GRP = g);
}

function cors(origin) {
  const ok = ALLOWED.includes(origin);
  return { 'Access-Control-Allow-Origin': ok ? origin : ALLOWED[0], 'Vary': 'Origin',
           'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...h } });

async function claude(env, prompt, maxTokens, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms || 25000);
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
    const body = c.m >= 0 ? txt(np + c.m) : txt(np + ns + c.p).slice(0, 700); // החתיכה שהתאימה, או תחילת הקטע
    return `[${k + 1}] ${head}\n${body}`;
  }).join('\n\n');
  const prompt = `להלן קטעים משיחות כ"ק אדמו"ר הריי"צ (ספר השיחות ולקוטי דיבורים). לכל קטע: שם השיחה, תקציר הנושאים שלו, ומובאה מהטקסט.

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


async function answer(env, q, cands, txt, np, ns) {
  const list = cands.map((c, k) => {
    const head = txt(c.p);
    const body = c.m >= 0 ? txt(np + c.m) : txt(np + ns + c.p).slice(0, 700);
    return `[${k + 1}] ${head}\n${body}`;
  }).join('\n\n');
  const prompt = `להלן קטעים משיחות כ"ק אדמו"ר הריי"צ (ספר השיחות ולקוטי דיבורים, בלשון הקודש). לכל קטע: מספר, שם השיחה, תקציר הנושאים, ומובאה מהטקסט.

<קטעים>
${list}
</קטעים>

שאלת הלומד: ${q}

מי מדבר ועל מי — חשוב מאוד, אל תתבלבל:
- הדובר בשיחות הוא אדמו"ר הריי"צ. כשהוא אומר "אני", "שלי", "אלי" — הכוונה לאדמו"ר הריי"צ.
- "כ"ק אדמו"ר שליט"א" או "אד"ש" (ברשימות ובכותרות של השומעים) — זה אדמו"ר הריי"צ, הדובר.
- "כ"ק אאמו"ר", "הוד כ"ק אאמו"ר הרה"ק", "אבי", "כ"ק אדמו"ר נ"ע", "אדנ"ע", "הרבי נ"ע" — זה אביו, אדמו"ר הרש"ב, ולא אדמו"ר הריי"צ.
- "כ"ק אאזמו"ר", "זקני", "מוהר"ש" — אדמו"ר מהר"ש. "הצ"צ" — אדמו"ר הצמח צדק. "רבינו הזקן", "בעל התניא" — אדמו"ר הזקן.
- "הרבי" או "כ"ק אדמו"ר" בתוך סיפור על תקופה קודמת — הרבי של אותה תקופה לפי ההקשר (למשל לפני שנת תר"ף — אדמו"ר הרש"ב), ולא בהכרח אדמו"ר הריי"צ.
- בתשובה כתוב תמיד את השם המפורש (אדמו"ר הרש"ב, אדמו"ר הריי"צ וכו'), ואם לא ברור מהקטע על מי מדובר — אל תנחש; כתוב "הרבי" כמו בקטע.

כתוב תשובה בעברית לשאלה, על סמך הקטעים בלבד.
כללים:
- כל טענה בתשובה חייבת להופיע בקטעים. אל תוסיף ידע מבחוץ, אל תשער ואל תפרש מעבר למה שכתוב.
- אחרי כל משפט או פרט — ציין בסוגריים מרובעים את מספר הקטע שממנו הוא לקוח, למשל [3] או [3][7].
- השתמש רק בקטעים שעוסקים ישירות בשאלה (עד ${A_TOP} קטעים). התעלם מקטעים לא רלוונטיים.
- אם יש כמה היבטים — חלק לפסקאות קצרות, ופתח כל פסקה בכותרת קצרה מודגשת בתבנית **כותרת.**
- לפני הכתיבה בדוק: האם שני קטעים או יותר מתארים את אותו אירוע (אותם אנשים, אותו מקום או זמן, אותה מטרה) — גם אם בניסוח אחר? שיחות נאמרו בשנים שונות, ואותו סיפור מסופר בהן כמה פעמים בפרטים שונים.
- כשכמה קטעים מספרים את אותו סיפור או אירוע בפרטים שונים או סותרים — אל תמזג אותם לסיפור אחד, ואל תציג אותם כאירועים נפרדים שקרו זה אחר זה. הצג אותם כגרסאות שונות של אותו סיפור: "בשיחת [שם השיחה] מסופר ש... [n], ואילו בשיחת [שם השיחה] מסופר ש... [m]", וציין במפורש במה הגרסאות שונות.
- כשהדובר מסייג ("כמדומה לי", "אינני זוכר בבירור") — שמור על הסייג בתשובה.
- ציטוט קצר מדויק מהקטע — במירכאות ״...״.
- סגנון: עברית ברורה ומכובדת, בכינויים המפורשים (אדמו״ר הזקן, אדמו״ר הרש״ב, אדמו״ר הריי״צ וכו').
- אורך: עד כ-250 מילים. שאלה ממוקדת — תשובה קצרה.
- אם הקטעים לא עונים על השאלה — כתוב רק: לא נמצאה תשובה לשאלה זו בשיחות שבאתר.
כתוב רק את התשובה עצמה, בלי הקדמה.`;
  const out = (await claude(env, prompt, 6000, 55000)).trim();
  answer.last = out;
  // מספור מחדש לפי סדר ההופעה
  const map = new Map(), used = [];
  const text = out.replace(/\[(\d+)\]/g, (all, d) => {
    const n = +d; if (n < 1 || n > cands.length) return '';
    if (!map.has(n)) { map.set(n, used.length + 1); used.push(cands[n - 1]); }
    return '[' + map.get(n) + ']';
  });
  return { text, used };
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

    const mode = url.searchParams.get('mode') === 'answer' ? 'answer' : 'quotes';
    const src = ['s', 'l', 'r'].includes(url.searchParams.get('src')) ? url.searchParams.get('src') : '';
    const cache = caches.default, ckey = new Request('https://cache.sichos/v13?m=' + mode + '&src=' + src + '&q=' + encodeURIComponent(q) + '&x=' + (url.searchParams.get('x') || ''));
    const debug = url.searchParams.has('debug');
    const cached = debug ? null : await cache.match(ckey);
    if (cached) { const r = new Response(cached.body, cached); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }

    const ip = (req.headers.get('CF-Connecting-IP') || 'x') + (mode === 'answer' ? '#a' : ''), now = Date.now();
    const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
    if (arr.length >= (mode === 'answer' ? A_PER_MIN : PER_MIN)) return json({ error: 'יותר מדי חיפושים, נסו שוב בעוד דקה' }, 429, h);
    arr.push(now); hits.set(ip, arr);
    if (hits.size > 5000) hits.clear();

    try {
      const idx = await loadIdx();
      const r = await env.AI.run('@cf/baai/bge-m3', { text: [q] });
      const qv = (r.data || (r.result && r.result.data))[0];
      let n = 0; for (let i = 0; i < qv.length; i++) n += qv[i] * qv[i];
      n = (Math.sqrt(n) || 1) * SCALE;
      const { N, dim, np, delta, parent, vec } = idx;
      const qf = new Float32Array(dim); for (let k = 0; k < dim; k++) qf[k] = qv[k] / n;   // מהיר יותר (מערך מספרים + פריסת לולאה)
      // חיפוש דו־שלבי: (1) השוואת ביטים מהירה לכל הקטעים והחתיכות → 300 קטעים מובילים; (2) חישוב מדויק רק להם ולחתיכות שלהם
      const dot = (i) => { let s0 = 0, s1 = 0, s2 = 0, s3 = 0, o = i * dim;
        for (let k = 0; k < dim; k += 4, o += 4) { s0 += vec[o] * qf[k]; s1 += vec[o + 1] * qf[k + 1]; s2 += vec[o + 2] * qf[k + 2]; s3 += vec[o + 3] * qf[k + 3]; }
        return s0 + s1 + s2 + s3; };
      const ns = N - np, { kids } = idx, bits = await loadBits();
      const grp = src ? groups(await loadTxt(), np, ns) : null, want = src ? src.charCodeAt(0) : 0;
      const W4 = dim / 32, qb = new Uint8Array(dim / 8); for (let k = 0; k < dim; k++) if (qv[k] > 0) qb[k >> 3] |= 128 >> (k & 7);
      const q32 = new Uint32Array(qb.buffer), ap = new Int32Array(np).fill(-dim - 1);
      for (let i = 0; i < N; i++) {
        const p = i < np ? i : parent[i]; if (grp && grp[p] !== want) continue;
        let ham = 0; const o = i * W4; for (let j = 0; j < W4; j++) ham += pop(bits[o + j] ^ q32[j]);
        const sb = dim - 2 * ham; if (sb > ap[p]) ap[p] = sb;
      }
      const hist = new Int32Array(2 * dim + 2); for (let p = 0; p < np; p++) hist[ap[p] + dim + 1]++;
      let cnt = 0, t = 2 * dim + 1; for (; t > 1; t--) { cnt += hist[t]; if (cnt >= K1) break; }
      const bs = new Float32Array(np).fill(-1e9), bm = new Int32Array(np).fill(-1), sel = [];
      for (let p = 0; p < np; p++) if (ap[p] + dim + 1 >= t && ap[p] > -dim - 1) sel.push(p);
      for (const p of sel) { bs[p] = dot(p); for (const i of kids[p]) { const s = dot(i) - delta; if (s > bs[p]) { bs[p] = s; bm[p] = i - np; } } }
      const best = new Map(); for (const p of sel) best.set(p, [bs[p], bm[p]]);
      let cands = [...best.entries()].sort((a, b) => b[1][0] - a[1][0]).slice(0, mode === 'answer' ? A_CAND : CAND)
                    .map(([p, [s, m]]) => ({ p, m, s: +s.toFixed(3) }));
      const xs = (url.searchParams.get('x') || '').split(',').map(v => v.split(':').map(Number))   // מועמדים נוספים מהדפדפן: "קטע" או "קטע:חתיכה"
                   .filter(([p]) => Number.isInteger(p) && p >= 0 && p < np && (!grp || grp[p] === want)).slice(0, mode === 'answer' ? A_X : 10);
      for (const [p, xm] of xs) {
        const okm = Number.isInteger(xm) && xm >= 0 && xm < ns && parent[np + xm] === p ? xm : null;
        const c = cands.find(c => c.p === p);
        if (c) { if (okm !== null) c.m = okm; continue; }
        const b = best.get(p); cands.push({ p, m: okm !== null ? okm : (b ? b[1] : -1), s: b ? +b[0].toFixed(3) : +dot(p).toFixed(3) });
      }
      // הטקסט לתצוגה נשלח מהשרת — הדפדפן לא צריך להוריד את כל הטקסטים
      const full = (txt, r) => { const [f, u, t] = txt(2 * np + ns + r.p).split('\t'); const x = txt(np + ns + r.p);
        return { p: r.p, m: r.m, t, f, u, x, s: r.m >= 0 ? txt(np + r.m) : x }; };
      if (mode === 'answer') {
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'השירות אינו זמין כרגע' }, 503, h);
        const txt = await loadTxt();
        let a;
        try { a = await answer(env, q, cands, txt, np, N - np); }
        catch (e) { return json({ error: 'לא הצלחתי לנסח תשובה, נסו שוב בעוד רגע' }, 502, h); }
        if (debug) return json({ q, raw: answer.last, answer: a.text, results: a.used.map(r => full(txt, r)),
          cands: cands.map((c, k) => (k + 1) + '. ' + txt(c.p).slice(0, 70)) }, 200, h);
        const resp = json({ answer: a.text, results: a.used.map(r => full(txt, r)), ranked: true }, 200, { ...h, 'Cache-Control': 'public, max-age=86400' });
        ctx.waitUntil(cache.put(ckey, resp.clone()));
        return resp;
      }
      // בלי Claude: קודם עד 4 מועמדים מהדפדפן (מפתח/מילים נדירות), ואחריהם הקרובים ביותר לפי משמעות
      const xset = new Set(xs.map(([p]) => p));
      let results = [...cands.filter(c => xset.has(c.p)).slice(0, 4), ...cands.slice(0, TOP)]
                      .filter((c, i, a) => a.findIndex(d => d.p === c.p) === i).slice(0, 8), ranked = false;
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
      const txt2 = await loadTxt();
      const shown = new Set(results.map(r => r.p));
      const more = cands.filter(c => !shown.has(c.p)).slice(0, 10).map(r => full(txt2, r));   // "הצג עוד תוצאות": הקרובים הבאים לפי משמעות
      results = results.map(r => full(txt2, r));
      const resp = json({ results, ranked, more }, 200, { ...h, 'Cache-Control': 'public, max-age=86400' });
      ctx.waitUntil(cache.put(ckey, resp.clone()));
      return resp;
    } catch (e) {
      console.error('search error', e && (e.stack || e));
      return json({ error: 'שגיאת חיפוש, נסו שוב' }, 500, h);
    }
  }
};
