// שרת החיפוש הסמנטי — גרסה 17: חיפוש דו־שלבי (ביטים ואז מדויק). גרסה 15: סינון לפי מקור (src) ו"עוד תוצאות" (more). גרסה 10 (הטקסט לתצוגה נשלח מהשרת): חיפוש מקורות (Claude בוחר קטעים) + "שאל את ה-AI" (תשובה מנוסחת עם מראי מקומות)
// Claude חושב מעט (effort: low) לפני שהוא בוחר
// דרוש: Binding מסוג Workers AI בשם AI, וסוד בשם ANTHROPIC_API_KEY
const SITE = 'https://sichotmeturgamot.com/';
const ALLOWED = ['https://sichotmeturgamot.com', 'https://www.sichotmeturgamot.com',
                 'https://sichotmeturgamot.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const GOOGLE_CLIENT_ID = '696641021937-mqm27b0nkh18t82oh17su951btii7l3f.apps.googleusercontent.com', ADMINS = ['doviber@gmail.com'], USER_DAILY = 10, GLOBAL_DAILY = 300;
const MAX_Q = 200, TOP = 5, CAND = 60, PER_MIN = 12, SCALE = 400;
const A_CAND = 80, A_X = 30, A_TOP = 12, A_PER_MIN = 6;   // מצב תשובה
const MODEL = 'claude-haiku-5-5';

let IDX = null, TXT = null, GRP = null, BITS = null;
const K1 = 300;   // שלב 1 (ביטים) בוחר את 300 הקטעים המובילים; רק עליהם החישוב המדויק
const pop = x => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };
const hits = new Map();

async function getBuf(name) {
  const res = await fetch(SITE + name + '?v=34', { cf: { cacheTtl: 3600, cacheEverything: true } });
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
    g[p] = (t && t.startsWith('ספר הזכרונות')) ? 122 : (f || (t && t.startsWith('ספר השיחות')) ? 115 : (t && t.startsWith('אגרות קודש')) ? 114 : (u && u.indexOf('hebrewbooks') >= 0 ? 108 : 114)); }   // z = ספר הזכרונות, s = כל השיחות המתורגמות (האתר + תרגום קה"ת), l = לקוטי דיבורים, r = השאר
  return (GRP = g);
}

function cors(origin) {
  const ok = ALLOWED.includes(origin);
  return { 'Access-Control-Allow-Origin': ok ? origin : ALLOWED[0], 'Vary': 'Origin',
           'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
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


// מצב שיחה (ניסוי, רק למנהל עם מפתח): שאלת המשך → שאלה עצמאית לחיפוש
async function rewriteQ(env, hist, q) {
  const conv = hist.map(t => `שאלה: ${t.q}\nתשובה: ${t.a.slice(0, 600)}`).join('\n\n');
  const prompt = `להלן שיחה בין לומד ל-AI על שיחות ואגרות כ"ק אדמו"ר הריי"צ, ואחריה שאלת המשך.
<שיחה>
${conv}
</שיחה>
שאלת ההמשך: ${q}

נסח את שאלת ההמשך מחדש כשאלה עצמאית ומלאה בעברית (עד 25 מילים), שמובנת בלי השיחה — עם הנושא, האנשים והפרטים שהיא מתייחסת אליהם. החזר רק את השאלה.`;
  return (await claude(env, prompt, 200, 15000)).trim().replace(/^["״]|["״]$/g, '');
}

async function answer(env, q, cands, txt, np, ns, chat) {
  const list = cands.map((c, k) => {
    const head = txt(c.p);
    const body = c.m >= 0 ? txt(np + c.m) : txt(np + ns + c.p).slice(0, 700);
    const yi = isYi(txt, np, ns, c.p) ? ' (הקטע כתוב ביידיש)' : '';
    return `[${k + 1}] ${head}${yi}\n${body}`;
  }).join('\n\n');
  const prompt = `להלן קטעים משיחות כ"ק אדמו"ר הריי"צ (ספר השיחות ולקוטי דיבורים, בלשון הקודש). לכל קטע: מספר, שם השיחה, תקציר הנושאים, ומובאה מהטקסט.

<קטעים>
${list}
</קטעים>

${chat && chat.hist.length ? `<שיחה קודמת>
${chat.hist.map(t => `שאלה: ${t.q}\nתשובה: ${t.a}`).join('\n\n')}
</שיחה קודמת>

שאלת ההמשך של הלומד: ${chat.q}
(כלומר: ${q})
ענה על שאלת ההמשך בהקשר של השיחה הקודמת. אל תחזור על מה שכבר נאמר בה, אלא אם צריך בקצרה להקשר.` : 'שאלת הלומד: ' + q}

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
- ציטוט קצר מדויק מהקטע — במירכאות ״...״. מקטע שכתוב ביידיש — אל תצטט ביידיש; כתוב את הדברים בעברית והוסף "(בתרגום חופשי)".
- סגנון: עברית ברורה ומכובדת, בכינויים המפורשים (אדמו״ר הזקן, אדמו״ר הרש״ב, אדמו״ר הריי״צ וכו').
- אורך: עד כ-250 מילים. שאלה ממוקדת — תשובה קצרה.
- אם הקטעים לא עונים על השאלה — כתוב רק: לא נמצאה תשובה לשאלה זו בשיחות שבאתר.
כתוב רק את התשובה עצמה, בלי הקדמה.${chat ? `\nבסוף, בשורה נפרדת שמתחילה במילה המשך: — הצע 3 שאלות המשך קצרות (עד 10 מילים כל אחת) שהלומד עשוי לרצות לשאול ושאפשר לענות עליהן מהשיחות, מופרדות ב- | ` : ''}`;
  let out = (await claude(env, prompt, 6000, 55000)).trim();
  answer.last = out;
  let follow = [];
  const fm = out.match(/\n\s*\**המשך:?\**\s*:?\s*(.+)\s*$/);
  if (fm) { follow = fm[1].split('|').map(s => s.trim().replace(/^[-•\d.]+\s*/, '')).filter(Boolean).slice(0, 3); out = out.slice(0, fm.index).trim(); }
  // מספור מחדש לפי סדר ההופעה
  const map = new Map(), used = [];
  const text = out.replace(/\[(\d+)\]/g, (all, d) => {
    const n = +d; if (n < 1 || n > cands.length) return '';
    if (!map.has(n)) { map.set(n, used.length + 1); used.push(cands[n - 1]); }
    return '[' + map.get(n) + ']';
  });
  return { text, used, follow };
}

// קטעים ביידיש: הכותרת מסתיימת ב"· אידיש". תרגום — רק בלחיצה על "תרגם", ונשמר במטמון
function isYi(txt, np, ns, p) { return / · אידיש$/.test(txt(2 * np + ns + p).split('\t')[2] || ''); }
async function translate(env, x) {
  const prompt = `תרגם לעברית את הקטע הבא מתוך אגרות קודש של כ"ק אדמו"ר הריי"צ, שנכתב ביידיש.
- תרגום נאמן ומדויק, בעברית ברורה בסגנון ספרי חסידות חב"ד (לשון הקודש מודרנית ומכובדת).
- מילים, ביטויים וציטוטים שכבר בעברית/ארמית — השאר כמו שהם.
- שמור על חלוקת הפסקאות, על שורות הפתיחה והחתימה, ועל ראשי התיבות.
- אל תוסיף הסברים או הערות. החזר רק את התרגום.

<קטע>
${x}
</קטע>`;
  return (await claude(env, prompt, 4000, 55000)).trim();
}

async function gEmail(cred) {
  try {
    const tr = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String(cred || '')));
    const t = tr.ok ? await tr.json() : null;
    if (t && t.aud === GOOGLE_CLIENT_ID && t.email_verified === 'true' && +t.exp * 1000 > Date.now()) return String(t.email).toLowerCase();
  } catch (e) {}
  return null;
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

    if (url.searchParams.has('tr')) {                       // תרגום קטע ביידיש — רק לפי בקשה
      const p = parseInt(url.searchParams.get('tr'), 10);
      const tkey = new Request('https://cache.sichos/tr1?p=' + p + '&v=' + (url.searchParams.get('v') || ''));
      const hit = await caches.default.match(tkey);
      if (hit) { const r = new Response(hit.body, hit); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }
      const ip = (req.headers.get('CF-Connecting-IP') || 'x') + '#t', now = Date.now();
      const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
      if (arr.length >= A_PER_MIN) return json({ error: 'יותר מדי בקשות, נסו שוב בעוד דקה' }, 429, h);
      arr.push(now); hits.set(ip, arr);
      try {
        const { N, np } = await loadIdx(), ns = N - np, txt = await loadTxt();
        if (!Number.isInteger(p) || p < 0 || p >= np || !isYi(txt, np, ns, p)) return json({ error: 'קטע לא מתאים לתרגום' }, 400, h);
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'השירות אינו זמין כרגע' }, 503, h);
        const tr = await translate(env, txt(np + ns + p));
        const resp = json({ tr }, 200, { ...h, 'Cache-Control': 'public, max-age=2592000' });
        ctx.waitUntil(caches.default.put(tkey, resp.clone()));
        return resp;
      } catch (e) { return json({ error: 'התרגום נכשל, נסו שוב בעוד רגע' }, 502, h); }
    }

    if (req.method === 'POST' && url.searchParams.get('mode') === 'gadmin') {
      let b; try { b = await req.json(); } catch (e) { return json({ error: 'bad request' }, 400, h); }
      const em = await gEmail(b.cred);
      if (!em || !ADMINS.includes(em)) return json({ error: 'אין הרשאה' }, 403, h);
      const stub = env.USERS.get(env.USERS.idFromName('main'));
      const r = await stub.fetch('https://do/admin?act=' + (b.act === 'set' ? 'set' : 'stats'), { method: 'POST', body: JSON.stringify(b.cfg || {}) });
      return json(await r.json(), 200, h);
    }
    let chat = null, left = null;
    const cm = url.searchParams.get('mode');
    if (req.method === 'POST' && (cm === 'chat' || cm === 'gchat')) {
      let b; try { b = await req.json(); } catch (e) { return json({ error: 'bad request' }, 400, h); }
      if (cm === 'chat') {
        if (!env.CHAT_KEY || b.key !== env.CHAT_KEY) return json({ error: 'אין הרשאה' }, 403, h);
      } else {
        const em = await gEmail(b.cred);
        if (!em) return json({ error: 'ההתחברות פגה, התחברו מחדש' }, 401, h);
        if (b.q === '__quota__') return json({ email: em }, 200, h);
        const u = await env.USERS.get(env.USERS.idFromName('main')).fetch('https://do/use?e=' + encodeURIComponent(em) + '&a=' + (ADMINS.includes(em) ? 1 : 0));
        const ur = await u.json();
        if (!ur.ok) return json({ error: ur.why === 'user' ? 'הגעתם למכסה היומית (' + ur.lim + ' שאלות). חזרו מחר 🙂' : ur.why === 'blocked' ? 'הגישה שלכם לשירות הוגבלה' : 'השירות הגיע למכסה היומית הכללית, נסו שוב מחר', left: 0 }, 429, h);
        left = ur.left;
      }
      if (!env.ANTHROPIC_API_KEY) return json({ ok: false, msg: 'הסוד ANTHROPIC_API_KEY לא מוגדר בשרת' }, 200, h);
      try { await claude(env, 'ענה במילה אחת: שלום', 5); return json({ ok: true, msg: 'המפתח עובד ✓' }, 200, h); }
      catch (e) { return json({ ok: false, msg: 'שגיאה: ' + e.message }, 200, h); }
    }
    if (origin && !ALLOWED.includes(origin)) return json({ error: 'forbidden' }, 403, h);

    if (url.searchParams.has('tr')) {                       // תרגום קטע ביידיש — רק לפי בקשה
      const p = parseInt(url.searchParams.get('tr'), 10);
      const tkey = new Request('https://cache.sichos/tr1?p=' + p + '&v=' + (url.searchParams.get('v') || ''));
      const hit = await caches.default.match(tkey);
      if (hit) { const r = new Response(hit.body, hit); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }
      const ip = (req.headers.get('CF-Connecting-IP') || 'x') + '#t', now = Date.now();
      const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
      if (arr.length >= A_PER_MIN) return json({ error: 'יותר מדי בקשות, נסו שוב בעוד דקה' }, 429, h);
      arr.push(now); hits.set(ip, arr);
      try {
        const { N, np } = await loadIdx(), ns = N - np, txt = await loadTxt();
        if (!Number.isInteger(p) || p < 0 || p >= np || !isYi(txt, np, ns, p)) return json({ error: 'קטע לא מתאים לתרגום' }, 400, h);
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'השירות אינו זמין כרגע' }, 503, h);
        const tr = await translate(env, txt(np + ns + p));
        const resp = json({ tr }, 200, { ...h, 'Cache-Control': 'public, max-age=2592000' });
        ctx.waitUntil(caches.default.put(tkey, resp.clone()));
        return resp;
      } catch (e) { return json({ error: 'התרגום נכשל, נסו שוב בעוד רגע' }, 502, h); }
    }

    if (req.method === 'POST' && url.searchParams.get('mode') === 'gadmin') {
      let b; try { b = await req.json(); } catch (e) { return json({ error: 'bad request' }, 400, h); }
      const em = await gEmail(b.cred);
      if (!em || !ADMINS.includes(em)) return json({ error: 'אין הרשאה' }, 403, h);
      const stub = env.USERS.get(env.USERS.idFromName('main'));
      const r = await stub.fetch('https://do/admin?act=' + (b.act === 'set' ? 'set' : 'stats'), { method: 'POST', body: JSON.stringify(b.cfg || {}) });
      return json(await r.json(), 200, h);
    }
    let chat = null, left = null;
    const cm = url.searchParams.get('mode');
    if (req.method === 'POST' && (cm === 'chat' || cm === 'gchat')) {
      let b; try { b = await req.json(); } catch (e) { return json({ error: 'bad request' }, 400, h); }
      if (cm === 'chat') {
        if (!env.CHAT_KEY || b.key !== env.CHAT_KEY) return json({ error: 'אין הרשאה' }, 403, h);
      } else {
        const em = await gEmail(b.cred);
        if (!em) return json({ error: 'ההתחברות פגה, התחברו מחדש' }, 401, h);
        if (b.q === '__quota__') return json({ email: em }, 200, h);
        if (!ADMINS.includes(em)) {
        const lim = USER_DAILY;
        const u = await env.USERS.get(env.USERS.idFromName('main')).fetch('https://do/use?e=' + encodeURIComponent(em) + '&l=' + lim + '&g=' + GLOBAL_DAILY);
        const ur = await u.json();
        if (!ur.ok) return json({ error: ur.why === 'user' ? 'הגעתם למכסה היומית (' + lim + ' שאלות). חזרו מחר 🙂' : 'השירות הגיע למכסה היומית הכללית, נסו שוב מחר', left: 0 }, 429, h);
        left = ur.left;
        }
      }
      if (!env.ANTHROPIC_API_KEY) return json({ error: 'השירות אינו זמין כרגע' }, 503, h);
      const hist = (Array.isArray(b.h) ? b.h : []).slice(-6).map(t => ({ q: String(t.q || '').slice(0, 300), a: String(t.a || '').replace(/\[\d+\]/g, '').slice(0, 1500) }));
      const cq = String(b.q || '').trim().slice(0, 300);
      if (cq.length < 2) return json({ error: 'שאלה קצרה מדי' }, 400, h);
      let sq = cq;
      if (hist.length) { try { sq = (await rewriteQ(env, hist, cq)).slice(0, MAX_Q) || cq; } catch (e) { sq = cq; } }
      chat = { hist, q: cq, sq };
    }
    const q = chat ? chat.sq : (url.searchParams.get('q') || '').trim().slice(0, MAX_Q);
    if (q.length < 2) return json({ error: 'שאלה קצרה מדי' }, 400, h);

    const mode = (chat || cm === 'answer') ? 'answer' : 'quotes';
    const src = ['s', 'l', 'r', 'z'].includes(url.searchParams.get('src')) ? url.searchParams.get('src') : '';
    const cache = caches.default, ckey = new Request('https://cache.sichos/v30?m=' + mode + '&src=' + src + '&q=' + encodeURIComponent(q) + '&x=' + (url.searchParams.get('x') || ''));
    const debug = url.searchParams.has('debug');
    const cached = (debug || chat) ? null : await cache.match(ckey);
    if (cached) { const r = new Response(cached.body, cached); Object.entries(h).forEach(([k, v]) => r.headers.set(k, v)); return r; }

    const ip = (req.headers.get('CF-Connecting-IP') || 'x') + (mode === 'answer' ? '#a' : ''), now = Date.now();
    const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
    if (!chat && arr.length >= (mode === 'answer' ? A_PER_MIN : PER_MIN)) return json({ error: 'יותר מדי חיפושים, נסו שוב בעוד דקה' }, 429, h);
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
        try { a = await answer(env, q, cands, txt, np, N - np, chat); }
        catch (e) { return json({ error: 'לא הצלחתי לנסח תשובה, נסו שוב בעוד רגע' }, 502, h); }
        if (debug) return json({ q, raw: answer.last, answer: a.text, results: a.used.map(r => full(txt, r)),
          cands: cands.map((c, k) => (k + 1) + '. ' + txt(c.p).slice(0, 70)) }, 200, h);
        if (chat) return json({ answer: a.text, results: a.used.map(r => full(txt, r)), follow: a.follow, sq: q, left }, 200, h);
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


export class Users {
  constructor(state) { this.s = state.storage; }
  async fetch(req) {
    const u = new URL(req.url), day = new Date().toISOString().slice(0, 10);
    const r = (o) => new Response(JSON.stringify(o));
    const cfg = Object.assign({ user: USER_DAILY, global: GLOBAL_DAILY, vip: [], blocked: [] }, (await this.s.get('cfg')) || {});
    if (u.pathname === '/admin') {
      if (u.searchParams.get('act') === 'set') {
        const n = await req.json();
        const c = { user: Math.max(0, Math.min(1000, +n.user || 0)), global: Math.max(0, Math.min(100000, +n.global || 0)),
          vip: (n.vip || []).map(x => String(x).trim().toLowerCase()).filter(Boolean), blocked: (n.blocked || []).map(x => String(x).trim().toLowerCase()).filter(Boolean) };
        await this.s.put('cfg', c); return r({ cfg: c });
      }
      const m = await this.s.list({ prefix: 'u:' + day + ':' }), users = [];
      m.forEach((v, k) => users.push([k.slice(('u:' + day + ':').length), v]));
      users.sort((a, b) => b[1] - a[1]);
      return r({ cfg, today: (await this.s.get('g:' + day)) || 0, users: users.slice(0, 50) });
    }
    const e = u.searchParams.get('e'), adm = u.searchParams.get('a') === '1';
    if (!adm && cfg.blocked.includes(e)) return r({ ok: false, why: 'blocked' });
    const ku = 'u:' + day + ':' + e, kg = 'g:' + day;
    const cu = (await this.s.get(ku)) || 0, cg = (await this.s.get(kg)) || 0;
    const vip = adm || cfg.vip.includes(e);
    if (!vip && cg >= cfg.global) return r({ ok: false, why: 'global' });
    if (!vip && cu >= cfg.user) return r({ ok: false, why: 'user', lim: cfg.user });
    await this.s.put(ku, cu + 1); await this.s.put(kg, cg + 1);
    return r({ ok: true, left: vip ? null : cfg.user - cu - 1 });
  }
}
