// בניית search-kw.json — אינדקס מילים קטן לדפדפן (במקום להוריד את כל הטקסט)
//  v:  מילה מנורמלת → רשימת קטעים שהיא מופיעה בהם (חיפוש תת-מחרוזת במילה ≡ חיפוש בטקסט המלא)
//  mf: לכל ערך ב-MAFTEACH (לפי הסדר) → [קטע, חתיכה קטנה, קטע ארוך?] או 0 אם לא נמצא
// הרצה: node _search_build/build_kw.mjs   (מתוך תיקיית האתר)
import fs from 'fs';
const meta = JSON.parse(fs.readFileSync('search-meta.json', 'utf8'));
const MAFTEACH = new Function(fs.readFileSync('mafteach.js', 'utf8') + '\nreturn MAFTEACH;')();
const norm = t => t.replace(/[֑-ׇ]/g, '').replace(/["'״׳]/g, '');
const W = t => norm(t.replace(/הי['׳](?=[^א-ת]|$)/g, 'היה')).replace(/\s+/g, ' ').trim();   // כמו בדף

const v = {};
meta.chunks.forEach((c, i) => {
  for (const w of new Set(norm(c.x).match(/[א-ת]+/g) || [])) (v[w] = v[w] || []).push(i);
});
const cx = meta.chunks.map(c => W(c.x));
const sx = meta.smalls.map(s => W(s.x));
const mf = MAFTEACH.map(e => {
  const k = W(e.a || e.excerpt || '').replace(/^[א-ת]{1,2}\. /, '').slice(0, 30);
  if (!k) return 0;
  const p = cx.findIndex(t => t.indexOf(k) >= 0);
  if (p < 0) return 0;
  const m = meta.smalls.findIndex((s, j) => s.p === p && sx[j].indexOf(k) >= 0);
  return [p, m, meta.chunks[p].x.length > 450 ? 1 : 0];
});
fs.writeFileSync('search-kw.json', JSON.stringify({ n: meta.chunks.length, v, mf }));
console.log('words', Object.keys(v).length, 'mafteach mapped', mf.filter(Boolean).length, '/', mf.length,
            'size', fs.statSync('search-kw.json').size);
