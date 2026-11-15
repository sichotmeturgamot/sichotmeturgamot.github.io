// בונה דפים סטטיים שגוגל וסוכני AI יכולים לקרוא:
//   stories/*.html   — סיפורים ופתגמים לפי דמות, נושא ומועד (מתוך stories.json)
//   erchim/*.html (לא mafteach/ — הנתיב הזה תפוס ע"י אפליקציית המפתחות הנפרדת)  — דף לכל ערך במפתח שיש לו 3 מקומות ומעלה (מתוך mafteach.js, קריאה בלבד)
//   index.html       — רשימת 5 השיחות האחרונות בין הסימונים LATEST-START / LATEST-END
//   sitemap-topics.xml
// הרצה: node _seo_build/build.mjs   (מתוך שורש המאגר). רץ גם אוטומטית ב-GitHub Actions.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://sichotmeturgamot.com';
const SITE_NAME = 'ספר השיחות מתורגם ללה״ק';
const SUFFIX = ' | הרבי הריי״צ בעברית';
const today = new Date().toISOString().slice(0, 10);
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---------- נתונים ----------
const { YEARS } = new Function(rd('data.js') + ';return {YEARS};')();
const STORIES = JSON.parse(rd('stories.json'));
const MAFTEACH = new Function(rd('mafteach.js') + ';return MAFTEACH;')();

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const GEM = { א:1,ב:2,ג:3,ד:4,ה:5,ו:6,ז:7,ח:8,ט:9,י:10,כ:20,ל:30,מ:40,נ:50,ס:60,ע:70,פ:80,צ:90,ק:100,ר:200,ש:300,ת:400 };
const gem = s => [...String(s)].reduce((a, c) => a + (GEM[c] || 0), 0);

// מפת שיחות: שם קובץ → פרטים, כולל סדר כרונולוגי
const SICHOS = new Map();
YEARS.forEach(y => y.sichos.forEach((s, i) => {
  const stem = String(s.file).replace(/^pdfs\//, '').replace(/\.pdf$/i, '');
  SICHOS.set(stem.toLowerCase(), { ...s, stem, year: y.year, ord: gem(y.year) * 1e6 + (parseInt((s.sortDate || '99-99').replace('-', ''), 10) || 9999) * 10 + i / 100 });
}));
const sichaOf = stem => SICHOS.get(String(stem || '').toLowerCase());
// קישור לשיחה: לדף השיחה כשיש, אחרת לקורא
function sichaHref(stem, title) {
  const s = sichaOf(stem);
  if (s && s.hasPage && !s.hidden) return '/sichos/' + encodeURIComponent(s.stem) + '.html';
  return '/read.html?file=' + encodeURIComponent('pdfs/' + stem + '.pdf') + '&title=' + encodeURIComponent(title || '');
}
const stemFromUrl = u => { const m = /[?&]file=([^&]+)/.exec(u || ''); if (!m) return ''; return decodeURIComponent(m[1].replace(/\+/g, ' ')).replace(/^pdfs\//, '').replace(/\.pdf$/i, ''); };
const ordOf = stem => (sichaOf(stem) || { ord: 9e9 }).ord;

// ---------- תבנית עמוד (אותו מראה של דפי המועדים) ----------
const CSS = `
  :root { --navy:#1a2942; --gold:#b8933e; --gold-ink:#93690f; --paper:#faf7f0; --card:#fff; --line:#e8e2d4; --ink:#2a2a2a; --muted:#6b6b6b; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Heebo',Arial,sans-serif; background:var(--paper); color:var(--ink); line-height:1.7; }
  .topbar { background:var(--navy); border-bottom:3px solid var(--gold); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .topbar .brand { color:#fff; font-family:'Frank Ruhl Libre',serif; font-size:1.1rem; }
  .topbar a { color:#fff; text-decoration:none; font-size:.85rem; border:1px solid rgba(255,255,255,.5); border-radius:8px; padding:5px 12px; white-space:nowrap; }
  main { max-width:860px; margin:0 auto; padding:28px 16px 40px; display:flex; flex-direction:column; gap:18px; }
  .crumb { font-size:.85rem; color:var(--muted); text-align:center; }
  .crumb a { color:var(--gold-ink); text-decoration:none; }
  h1 { font-family:'Frank Ruhl Libre',serif; color:var(--navy); font-size:clamp(1.6rem,4vw,2.1rem); text-align:center; }
  .lead { text-align:center; color:var(--muted); max-width:60ch; margin:0 auto; }
  section { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 22px; }
  h2 { font-family:'Frank Ruhl Libre',serif; color:var(--navy); font-size:1.1rem; text-align:center; margin-bottom:10px; }
  article { padding:14px 0; border-bottom:1px solid var(--line); }
  article:last-child { border-bottom:0; }
  article h3 { font-family:'Frank Ruhl Libre',serif; color:var(--navy); font-size:1.15rem; margin-bottom:4px; }
  article p { margin:6px 0; font-family:'Frank Ruhl Libre',serif; font-size:1.05rem; }
  blockquote { margin:6px 0; padding-inline-start:12px; border-inline-start:3px solid var(--line); font-family:'Frank Ruhl Libre',serif; font-size:1.02rem; }
  .m { color:var(--muted); font-size:.85rem; }
  .m a, .src a { color:var(--gold-ink); text-decoration:none; }
  .src { font-size:.88rem; color:var(--muted); margin-top:4px; }
  ul.refs { list-style:none; }
  ul.refs li { padding:8px 0; border-bottom:1px solid var(--line); }
  ul.refs li:last-child { border-bottom:0; }
  ul.refs a { color:var(--navy); text-decoration:none; font-weight:500; font-family:'Frank Ruhl Libre',serif; font-size:1.05rem; }
  .chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .chips a { text-decoration:none; color:var(--navy); background:var(--card); border:1px solid var(--line); border-radius:999px; padding:4px 14px; font-size:.88rem; }
  .chips a.cur { background:var(--navy); color:#fff; border-color:var(--navy); }
  footer { text-align:center; padding:0 16px 26px; color:#8a857a; font-size:.82rem; }
  footer a { color:var(--gold-ink); text-decoration:none; }`;

function page({ urlPath, title, h1, desc, lead, crumbs, body }) {
  const url = BASE + urlPath;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': url + '#page', url, name: h1, description: desc, inLanguage: 'he',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE + '/' },
        about: { '@type': 'Person', name: 'יוסף יצחק שניאורסון', alternateName: 'אדמו״ר הריי״צ' } },
      { '@type': 'BreadcrumbList', itemListElement: [...crumbs, { name: h1 }].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href ? { item: BASE + c.href } : {}) })) }
    ]
  };
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(h1)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="he_IL">
<meta property="og:image" content="${BASE}/og-image-1200.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
${JSON.stringify(ld).replace(/</g, '\\u003c')}
</script>
<link rel="icon" href="/icon-192.png">
<link rel="stylesheet" href="/fonts.css">
<style>${CSS}
</style>
</head>
<body>
<div class="topbar">
  <span class="brand">${SITE_NAME}</span>
  <a href="/">לאתר ←</a>
</div>
<main>
  <div class="crumb">${crumbs.map(c => `<a href="${esc(c.href)}">${esc(c.name)}</a>`).join(' › ')}</div>
  <h1>${esc(h1)}</h1>
  <p class="lead">${lead}</p>
${body}
</main>
<footer>ספר השיחות מתורגם ללשון הקודש · השיחות מתורגמות ברשות הוצאת ספרים קה"ת · <a href="/">לעמוד הבית</a></footer>
<script src="/analytics.js"></script>
</body>
</html>
`;
}
const cut = (s, n = 158) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n).replace(/[\s,.;:–—-]+\S*$/, '') + '…'; };
const paras = t => String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');

const out = new Map(); // נתיב → תוכן

// ---------- סיפורים ופתגמים ----------
const WHO_SLUG = { 'הבעש"ט': 'baal-shem-tov', 'אדמו"ר הזקן': 'alter-rebbe', 'הצמח צדק': 'tzemach-tzedek', 'אדמו"ר מהר"ש': 'maharash', 'אדמו"ר הרש"ב': 'rashab', 'אדמו"ר הריי"צ': 'rayatz', 'חסידים': 'chassidim' };
const THEME_SLUG = { 'עבודת המידות': 'avodas-hamidos', 'תפילה': 'tefillah', 'לימוד תורה': 'limud-torah', 'הנהגת רבי': 'hanhagas-rebbe', 'חינוך': 'chinuch', 'אהבת ישראל': 'ahavas-yisrael', 'ניגון': 'niggun', 'יהודי פשוט': 'yid-pashut', 'התקשרות': 'hiskashrus', 'מסירות נפש': 'mesiras-nefesh', 'אמונה ובטחון': 'emunah-bitachon', 'התוועדות': 'hisvaaduyos', 'תשובה': 'teshuvah', 'שמחה': 'simcha', 'פרנסה': 'parnassah', 'גאולה ומשיח': 'geulah-moshiach', 'צדקה': 'tzedakah', 'ארץ ישראל': 'eretz-yisrael' };
const OCC_SLUG = { 'ראש השנה': 'rosh-hashana', 'יום כיפור': 'yom-kippur', 'סוכות': 'sukkos', 'שמחת תורה': 'simchas-torah', 'י"ט כסלו': 'yud-tes-kislev', 'חנוכה': 'chanukah', 'פורים': 'purim', 'פסח': 'pesach', 'שבועות': 'shavuos', 'י"ב תמוז': 'yud-beis-tammuz' };
const hebSlug = s => String(s).normalize('NFC').replace(/[\u0591-\u05C7]/g, m => m === '\u05BE' ? '-' : '').replace(/["'״׳()]/g, '').replace(/[\s,./\\:;?!]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const MIN = 3;

const groups = [];
const addGroups = (kind, keyOf, slugMap, label, h1Of) => {
  const m = new Map();
  STORIES.forEach(s => [].concat(keyOf(s)).filter(Boolean).forEach(k => { if (!m.has(k)) m.set(k, []); m.get(k).push(s); }));
  for (const [k, items] of m) {
    if (items.length < MIN || (kind === 'who' && k === 'אחר')) continue;
    groups.push({ kind, key: k, label, slug: slugMap[k] || hebSlug(k), items, h1: h1Of(k) });
  }
};
addGroups('who', s => s.who, WHO_SLUG, 'לפי דמות', k => `${k}: סיפורים ופתגמים`);
addGroups('theme', s => s.themes, THEME_SLUG, 'לפי נושא', k => `סיפורים ופתגמים על ${k}`);
addGroups('occ', s => s.occasion, OCC_SLUG, 'לפי מועד', k => `סיפורים ופתגמים ל${k}`);
const used = new Set();
groups.forEach(g => { let s = g.slug; while (used.has(s)) s += '-' + g.kind; used.add(s); g.slug = s; g.path = `/stories/${s}.html`; });
const groupHref = (kind, key) => (groups.find(g => g.kind === kind && g.key === key) || {}).path;

const storyId = s => `s-${s.f}-${s.n}`;
function storyHtml(s, g) {
  const tags = [];
  if (s.who && g.kind !== 'who') { const h = groupHref('who', s.who); tags.push(h ? `<a href="${h}">${esc(s.who)}</a>` : esc(s.who)); }
  (s.themes || []).forEach(t => { if (g.kind === 'theme' && t === g.key) return; const h = groupHref('theme', t); tags.push(h ? `<a href="${h}">${esc(t)}</a>` : esc(t)); });
  if (s.occasion && g.kind !== 'occ') { const h = groupHref('occ', s.occasion); tags.push(h ? `<a href="${h}">${esc(s.occasion)}</a>` : esc(s.occasion)); }
  return `    <article id="${esc(storyId(s))}">
      <h3>${esc(s.title)}</h3>
      ${tags.length ? `<div class="m">${tags.join(' · ')}</div>` : ''}
      ${paras(s.text)}
      <div class="src">מתוך <a href="${esc(sichaHref(s.f, s.t))}">שיחת ${esc(s.t)}</a></div>
    </article>`;
}
const chipsFor = (kind, cur) => groups.filter(g => g.kind === kind).sort((a, b) => b.items.length - a.items.length)
  .map(g => `<a href="${g.path}"${g === cur ? ' class="cur"' : ''}>${esc(g.key)}</a>`).join('');

for (const g of groups) {
  const items = [...g.items].sort((a, b) => ordOf(a.f) - ordOf(b.f) || a.n - b.n);
  const st = items.filter(s => s.type === 'story'), sy = items.filter(s => s.type !== 'story');
  const cnt = [st.length && `${st.length} סיפורים`, sy.length && `${sy.length} פתגמים ואמרות`].filter(Boolean).join(' ו־');
  const about = g.kind === 'who' ? `שבמרכזם ${g.key}` : g.kind === 'theme' ? `בנושא ${g.key}` : `הקשורים ל${g.key}`;
  const lead = `${cnt} ${about}, מתוך שיחות כ״ק אדמו״ר הריי״צ מתורגמות ללשון הקודש. ליד כל אחד קישור לשיחה המלאה.`;
  const sample = st.concat(sy).slice(0, 3).map(s => s.title).join('; ');
  const desc = cut(`${cnt} ${about} מתוך שיחות אדמו״ר הריי״צ בתרגום ללשון הקודש: ${sample}`);
  let body = '';
  if (st.length) body += `  <section>\n    <h2>סיפורים</h2>\n${st.map(s => storyHtml(s, g)).join('\n')}\n  </section>\n`;
  if (sy.length) body += `  <section>\n    <h2>פתגמים ואמרות</h2>\n${sy.map(s => storyHtml(s, g)).join('\n')}\n  </section>\n`;
  body += `  <section>\n    <h2>לפי דמות</h2>\n    <div class="chips">${chipsFor('who', g)}</div>\n    <h2 style="margin-top:14px">לפי נושא</h2>\n    <div class="chips">${chipsFor('theme', g)}</div>\n    <h2 style="margin-top:14px">לפי מועד</h2>\n    <div class="chips">${chipsFor('occ', g)}</div>\n  </section>`;
  out.set(g.path, page({ urlPath: g.path, title: g.h1 + SUFFIX, h1: g.h1, desc, lead: esc(lead),
    crumbs: [{ name: 'דף הבית', href: '/' }, { name: 'סיפורים ופתגמים', href: '/stories.html' }], body }));
}

// ---------- מפתחות ----------
const TYPE = { i: { label: 'מפתח הענינים', short: 'ענינים' }, n: { label: 'מפתח השמות', short: 'שמות' }, m: { label: 'מפתח המקומות', short: 'מקומות' }, o: { label: 'מפתח המוסדות', short: 'מוסדות' } };
const topics = new Map();
MAFTEACH.forEach(e => {
  if (e.see || !TYPE[e.t]) return;
  const k = e.t + '|' + e.topic;
  if (!topics.has(k)) topics.set(k, { t: e.t, topic: e.topic, rows: [], ex: 0, stems: new Set() });
  const tp = topics.get(k);
  tp.rows.push(e);
  if (e.sources) e.sources.forEach(x => tp.stems.add(stemFromUrl(x.u).toLowerCase())); else tp.ex++;
});
topics.forEach(tp => { tp.refs = tp.ex + tp.stems.size; });
const mTopics = [...topics.values()].filter(t => t.refs >= MIN);
const mUsed = new Set();
const TSUF = { i: 'ענין', n: 'שם', m: 'מקום', o: 'מוסד' };
mTopics.forEach(t => { let s = hebSlug(t.topic) || 'topic'; if (mUsed.has(s)) s += '-' + TSUF[t.t]; mUsed.add(s); t.slug = s; t.path = '/erchim/' + encodeURIComponent(s) + '.html'; t.file = 'erchim/' + s + '.html'; });
const topicPath = new Map(mTopics.map(t => [t.t + '|' + t.topic, t.path]));
// הפניות "ראה" שמובילות לערך שיש לו דף
const seeTo = new Map();
MAFTEACH.forEach(e => { if (e.see) { const p = topicPath.get(e.t + '|' + e.see); if (p) { if (!seeTo.has(p)) seeTo.set(p, []); seeTo.get(p).push(e.topic); } } });

for (const t of mTopics) {
  const ex = t.rows.filter(r => !r.sources).sort((a, b) => ordOf(stemFromUrl(a.url)) - ordOf(stemFromUrl(b.url)));
  const src = t.rows.filter(r => r.sources);
  const clar = [...new Set(src.map(r => r.clar).filter(Boolean))];
  const typeL = TYPE[t.t].label;
  const h1 = t.topic;
  const aka = seeTo.get(t.path) || [];
  const where = '(תש״ו–תש״ח, מתורגמות ללשון הקודש)';
  const lead = (t.ex ? `${t.refs} קטעים משיחות כ״ק אדמו״ר הריי״צ ${where} בענין ${esc(t.topic)}` : `${esc(t.topic)} נזכר ב־${t.refs} משיחות כ״ק אדמו״ר הריי״צ ${where}`)
    + `${clar.length ? ` (${esc(clar.join('; '))})` : ''}, מתוך ${typeL}.${aka.length ? ` נקרא גם: ${esc(aka.join(', '))}.` : ''}`;
  let body = '';
  if (ex.length) {
    body += `  <section>\n${ex.map(r => {
      const stem = stemFromUrl(r.url);
      const sTitle = r.sichah || (sichaOf(stem) || {}).title || '';
      return `    <article>
      ${r.desc ? `<h3>${esc(r.desc)}</h3>` : ''}
      ${r.excerpt ? `<blockquote>${esc(r.excerpt)}</blockquote>` : ''}
      <div class="src">מתוך <a href="${esc(sichaHref(stem, sTitle))}">${esc(sTitle)}</a></div>
    </article>`; }).join('\n')}\n  </section>\n`;
  }
  const seen = new Set();
  const srcList = src.flatMap(r => r.sources).filter(s => { const k = stemFromUrl(s.u).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => ordOf(stemFromUrl(a.u)) - ordOf(stemFromUrl(b.u)));
  if (srcList.length) {
    body += `  <section>\n    <h2>נזכר בשיחות</h2>\n    <ul class="refs">\n${srcList.map(s => { const stem = stemFromUrl(s.u); return `      <li><a href="${esc(sichaHref(stem, s.s))}">${esc(s.s)}</a></li>`; }).join('\n')}\n    </ul>\n  </section>\n`;
  }
  body += `  <section>\n    <h2>${typeL}</h2>\n    <div class="chips"><a href="/erchim/">כל הערכים במפתחות</a><a href="/search.html">חיפוש במפתחות</a></div>\n  </section>`;
  const firstDesc = ex.map(r => r.desc).filter(Boolean).slice(0, 3).join('; ');
  const desc = cut(`${t.topic} בשיחות אדמו״ר הריי״צ – ${t.refs} ${t.ex ? 'קטעים' : 'שיחות'} מתוך ${typeL} של ספר השיחות המתורגם ללשון הקודש${firstDesc ? ': ' + firstDesc : '.'}`);
  out.set(t.file, page({ urlPath: t.path, title: `${t.topic} בשיחות אדמו״ר הריי״צ` + SUFFIX, h1, desc, lead,
    crumbs: [{ name: 'דף הבית', href: '/' }, { name: 'מפתחות', href: '/erchim/' }], body }));
}
// דף ראשי למפתחות
{
  const coll = new Intl.Collator('he');
  let body = '';
  for (const ty of ['i', 'n', 'm', 'o']) {
    const list = mTopics.filter(t => t.t === ty).sort((a, b) => coll.compare(a.topic, b.topic));
    if (!list.length) continue;
    body += `  <section>\n    <h2>${TYPE[ty].label}</h2>\n    <div class="chips">${list.map(t => `<a href="${t.path}">${esc(t.topic)}</a>`).join('')}</div>\n  </section>\n`;
  }
  body += `  <section>\n    <h2>חיפוש מלא</h2>\n    <div class="chips"><a href="/search.html">לחיפוש בכל המפתחות</a><a href="/stories.html">סיפורים ופתגמים</a><a href="/sichos/index.html">כל השיחות לפי שנים</a></div>\n  </section>`;
  const h1 = 'מפתחות לשיחות אדמו״ר הריי״צ';
  out.set('erchim/index.html', page({ urlPath: '/erchim/', title: h1 + SUFFIX, h1,
    desc: cut(`מפתח ענינים, שמות, מקומות ומוסדות לשיחות אדמו״ר הריי״צ המתורגמות ללשון הקודש: ${mTopics.length} ערכים, לכל ערך דף עם הציטוטים וקישור לשיחה.`),
    lead: `${mTopics.length} ערכים מתוך המפתחות לשיחות כ״ק אדמו״ר הריי״צ. לכל ערך דף עם הקטעים מהשיחות וקישור לשיחה המלאה.`,
    crumbs: [{ name: 'דף הבית', href: '/' }], body }));
}

// ---------- רשימת השיחות האחרונות בדף הבית ----------
{
  const all = YEARS.flatMap(y => y.sichos.filter(s => !s.hidden && s.addedAt));
  const latest = all.sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5);
  const html = latest.map(s => {
    const stem = String(s.file).replace(/^pdfs\//, '').replace(/\.pdf$/i, '');
    return `      <div class="sicha">
        <div class="sicha-info">
          <h3><a href="${esc(sichaHref(stem, s.title))}" style="color:inherit;text-decoration:none">${esc(s.title)}</a></h3>
          <p>${esc(s.subtitle || '')}</p>
        </div>
        <div class="btns">
          <a class="btn btn-navy btn-sm" href="${esc(sichaHref(stem, s.title))}">לקריאה</a>
          <a class="btn btn-line btn-sm" href="${esc(s.file)}" download>הורדה</a>
        </div>
      </div>`;
  }).join('\n');
  const idx = rd('index.html');
  const re = /(<!--LATEST-START-->)[\s\S]*?(<!--LATEST-END-->)/;
  if (re.test(idx)) out.set('index.html', idx.replace(re, `$1\n${html}\n      $2`));
  else console.warn('index.html: LATEST markers not found, skipped');
}

// ---------- קישורים רגילים מדפי הסיפורים והמפתחות ----------
function fillMarkers(file, html) {
  const src = out.get(file) || rd(file);
  const re = /(<!--TOPICS-START-->)[\s\S]*?(<!--TOPICS-END-->)/;
  if (!re.test(src)) { console.warn(file + ': TOPICS markers not found, skipped'); return; }
  out.set(file, src.replace(re, `$1\n${html}\n$2`));
}
const chipA = (href, text) => `<a href="${href}" style="display:inline-block;margin:0 0 6px 6px;border:1px solid var(--line);background:var(--paper);color:var(--navy);border-radius:999px;padding:5px 13px;font:.86rem 'Heebo',sans-serif;text-decoration:none">${esc(text)}</a>`;
const block = (title, links) => `<h2 style="font:500 1rem 'Heebo',sans-serif;color:var(--muted);margin:14px 0 8px">${title}</h2>\n<div>${links.join('')}</div>`;
fillMarkers('stories.html', [
  block('סיפורים ופתגמים לפי דמות', groups.filter(g => g.kind === 'who').map(g => chipA(g.path, g.key))),
  block('לפי נושא', groups.filter(g => g.kind === 'theme').sort((a, b) => b.items.length - a.items.length).map(g => chipA(g.path, g.key))),
  block('לפי מועד', groups.filter(g => g.kind === 'occ').map(g => chipA(g.path, g.key)))
].join('\n'));
fillMarkers('search.html', block('ערכים מרכזיים במפתחות', [...mTopics].sort((a, b) => b.refs - a.refs).slice(0, 40).map(t => chipA(t.path, t.topic)).concat(chipA('/erchim/', `כל ${mTopics.length} הערכים ←`))));

// ---------- כתיבה + sitemap ----------
const prevMap = new Map();
try { for (const m of rd('sitemap-topics.xml').matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) prevMap.set(m[1], m[2]); } catch {}
const keep = new Set();
const urls = [];
let changed = 0;
for (const [p, html] of out) {
  const rel = p.replace(/^\//, '');
  const full = path.join(ROOT, rel);
  keep.add(rel);
  const old = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  const same = old === html;
  if (!same) { fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, html); changed++; }
  if (!/^(stories|erchim)\//.test(rel)) continue;
  const loc = BASE + '/' + (rel.endsWith('index.html') ? rel.replace(/index\.html$/, '') : rel).split('/').map(encodeURIComponent).join('/');
  urls.push({ loc, lastmod: same && prevMap.get(loc) ? prevMap.get(loc) : today });
}
// מחיקת דפים ישנים שכבר לא נוצרים
for (const dir of ['stories', 'erchim']) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.html') && !keep.has(dir + '/' + f)) { fs.unlinkSync(path.join(d, f)); changed++; }
}
urls.sort((a, b) => a.loc.localeCompare(b.loc));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
let oldXml = ''; try { oldXml = rd('sitemap-topics.xml'); } catch {}
if (xml !== oldXml) { fs.writeFileSync(path.join(ROOT, 'sitemap-topics.xml'), xml); changed++; }
console.log(`stories pages: ${groups.length}, mafteach pages: ${mTopics.length + 1}, sitemap urls: ${urls.length}, files changed: ${changed}`);
