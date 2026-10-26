/* ציטוט כתמונה — יוצר תמונה מעוצבת (PNG, 1080×1920 — מתאימה לסטטוס) של קטע מהשיחות,
   ומציג תצוגה מקדימה עם "שיתוף" / "הורדה".
   שימוש: QuoteImage.open({ text, name, link, note })
     name = שם השיחה (בלי "שיחת"), link = קישור לשיחה (נשלח רק בשיתוף, לא מופיע בתמונה),
     note = כותרת לתאריך (רשות), למשל: ט"ו חשון — יום היארצייט של ...  → התאריך גדול בזהב והשאר מתחתיו.
   טקסט בין *כוכביות* מודגש בזהב. */
(function () {
  const W = 1080, H = 1920, PAD = 110, MAXW = W - 2 * PAD;
  const C = { gold: '#b8955a', goldHi: '#d9b46a', gold2: '#e8c47e', cream: '#efe6d2', sub: '#e9dcc0', subB: '#f4e9d0' };
  const FR = '"Frank Ruhl Libre", serif', DL = '"David Libre", "Frank Ruhl Libre", serif';
  const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
  const HEB = 'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F';

  // גופן דוד ליברה לגוף הציטוט (נטען רק כשצריך)
  let fontsP = null;
  function loadFonts() {
    if (fontsP) return fontsP;
    const add = (file, weight, range) => { try { const f = new FontFace('David Libre', 'url(' + file + ')', { weight, unicodeRange: range }); document.fonts.add(f); return f.load(); } catch (e) { return Promise.resolve(); } };
    fontsP = Promise.all([
      add('david-libre-hebrew-400.woff2', '400', HEB), add('david-libre-hebrew-700.woff2', '700', HEB),
      add('david-libre-latin-400.woff2', '400', LATIN), add('david-libre-latin-700.woff2', '700', LATIN),
      document.fonts.load('700 96px "Frank Ruhl Libre"'), document.fonts.load('400 44px "Frank Ruhl Libre"')
    ]).catch(() => {});
    return fontsP;
  }

  // מילים עם סימון הדגשה (*...* יכול להשתרע על כמה מילים)
  function tokens(text) {
    const paras = [];
    let bold = false;
    text.split(/\n\s*\n+|\n/).forEach(p => {
      const words = [];
      p.split(/\s+/).filter(Boolean).forEach(raw => {
        let w = '', b = bold, segs = [];
        for (const ch of raw) {
          if (ch === '*') { if (w) segs.push({ t: w, b }); w = ''; bold = !bold; b = bold; } else w += ch;
        }
        if (w) segs.push({ t: w, b });
        if (segs.length) words.push(segs);
      });
      if (words.length) paras.push(words);
    });
    return paras;
  }
  const fontFor = (b, size) => (b ? '700 ' : '400 ') + size + 'px ' + DL;
  function wordW(ctx, segs, size) { return segs.reduce((s, g) => { ctx.font = fontFor(g.b, size); return s + ctx.measureText(g.t).width; }, 0); }

  function layout(ctx, paras, size) {
    ctx.font = fontFor(false, size); const sp = ctx.measureText(' ').width;
    const out = [];
    paras.forEach((words, pi) => {
      if (pi) out.push(null);
      let line = [], lw = 0;
      words.forEach(segs => {
        const ww = wordW(ctx, segs, size);
        if (line.length && lw + sp + ww > MAXW) { out.push({ words: line, last: false }); line = []; lw = 0; }
        lw += (line.length ? sp : 0) + ww; line.push({ segs, w: ww });
      });
      if (line.length) out.push({ words: line, last: true });
    });
    return { lines: out, sp };
  }
  const bodyH = (lines, lh, pg) => lines.reduce((h, l) => h + (l === null ? pg : lh), 0);

  // שורה: מיושרת לשני הצדדים; שורה אחרונה בפסקה — ממורכזת
  function drawLine(ctx, l, sp, size, y) {
    const sum = l.words.reduce((s, w) => s + w.w, 0), n = l.words.length;
    let gap = sp, x;
    if (!l.last && n > 1) { gap = (MAXW - sum) / (n - 1); if (gap > sp * 6) gap = -1; }
    if (gap < 0) { gap = sp; x = W - PAD; } else x = l.last ? W / 2 + (sum + gap * (n - 1)) / 2 : W - PAD;
    ctx.textAlign = 'right';
    l.words.forEach(w => {
      let xx = x;
      w.segs.forEach(g => { ctx.font = fontFor(g.b, size); ctx.fillStyle = g.b ? C.gold2 : C.cream; ctx.fillText(g.t, xx, y); xx -= ctx.measureText(g.t).width; });
      x -= w.w + gap;
    });
  }

  function wrapPlain(ctx, text, maxW) {
    const out = []; let line = '';
    String(text).split(/\s+/).filter(Boolean).forEach(w => { const t = line ? line + ' ' + w : w; if (line && ctx.measureText(t).width > maxW) { out.push(line); line = w; } else line = t; });
    if (line) out.push(line); return out;
  }

  async function make(p) {
    await loadFonts();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); ctx.direction = 'rtl'; ctx.textBaseline = 'alphabetic';

    // כותרת: התאריך (לפני המקף) + תיאור (אחריו)
    let date = '', sub = '';
    if (p.note) {
      const n = String(p.note).replace(/\s+/g, ' ').trim().replace(/[.。]$/, '');
      const m = n.match(/^(.+?)\s+[—–-]\s+(.+)$/);
      if (m) { date = m[1]; sub = m[2]; } else sub = n;
    }
    ctx.font = '400 44px ' + FR;
    let subLines = [];
    if (sub) {
      const m2 = sub.match(/^(.*?של(?: החסיד| החסידה)?)\s+(.+)$/);   // "...של החסיד" / שם — בשורה שנייה מודגשת
      ctx.font = '700 44px ' + FR;
      if (m2 && ctx.measureText(m2[2]).width <= MAXW - 40) { ctx.font = '400 44px ' + FR; subLines = [...wrapPlain(ctx, m2[1], MAXW - 40), m2[2]]; }
      else { ctx.font = '400 44px ' + FR; subLines = wrapPlain(ctx, sub, MAXW - 40); }
    }
    const headH = (date ? 110 : 0) + (subLines.length ? (date ? 20 : 0) + subLines.length * 60 : 0);
    const ornH = 100, quoteH = 50, srcH = 92;

    // גוף: גודל לפי האורך; ארוך מאוד — מקוצר במילה שלמה
    let text = String(p.text).trim(), size = 46, cut = false, L;
    const avail = (H - 2 * 44 - 2 * 70) - headH - (headH ? ornH : 56) - quoteH - srcH;
    for (;;) {
      L = layout(ctx, tokens(text), size);
      if (bodyH(L.lines, size * 1.62, size * .6) <= avail) break;
      if (size > 30) { size--; continue; }
      const words = text.split(/\s+/); words.length = Math.max(15, Math.floor(words.length * .9));
      text = words.join(' ').replace(/[,.;:—–\-]+$/, ''); if ((text.match(/\*/g) || []).length % 2) text += '*';
      text += ' …'; cut = true;
    }
    const lh = size * 1.62, bH = bodyH(L.lines, lh, size * .6);
    const blockH = headH + (headH ? ornH : 56) + quoteH + bH + srcH;

    // רקע + מסגרת כפולה
    const g = ctx.createRadialGradient(W / 2, H * .3, 0, W / 2, H * .3, H * .78);
    g.addColorStop(0, '#23304a'); g.addColorStop(.55, '#141c2e'); g.addColorStop(1, '#0b101c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.strokeRect(45, 45, W - 90, H - 90);
    ctx.strokeStyle = 'rgba(184,149,90,.45)'; ctx.lineWidth = 1; ctx.strokeRect(57.5, 57.5, W - 115, H - 115);

    let y = Math.round((H - blockH) / 2);
    ctx.textAlign = 'center';
    if (date) { ctx.fillStyle = C.goldHi; ctx.font = '700 96px ' + FR; ctx.fillText(date, W / 2, y + 86); y += 110 + (subLines.length ? 20 : 0); }
    subLines.forEach((s, i) => {
      const last = i === subLines.length - 1 && subLines.length > 1;
      ctx.fillStyle = last ? C.subB : C.sub; ctx.font = (last ? '700' : '400') + ' 44px ' + FR;
      ctx.fillText(s, W / 2, y + 46); y += 60;
    });
    // קישוט: קו — ✦ — קו
    const oy = y + (headH ? 50 : 28);
    if (headH) {
      [[-1], [1]].forEach(([d]) => {
        const x0 = W / 2 + d * 35, x1 = W / 2 + d * 215, lg = ctx.createLinearGradient(x0, 0, x1, 0);
        lg.addColorStop(0, C.gold); lg.addColorStop(1, 'rgba(184,149,90,0)');
        ctx.fillStyle = lg; ctx.fillRect(Math.min(x0, x1), oy, 180, 1);
      });
      ctx.fillStyle = C.gold; ctx.font = '400 30px ' + DL; ctx.fillText('✦', W / 2, oy + 11);
      y += ornH;
    } else y += 56;
    // מרכאה פותחת
    ctx.globalAlpha = .8; ctx.fillStyle = C.gold; ctx.font = '400 110px ' + FR; ctx.fillText('”', W / 2, y + 66); ctx.globalAlpha = 1;
    y += quoteH;
    // הציטוט
    y += size * 1.05;
    L.lines.forEach(l => { if (l === null) { y += size * .6; return; } drawLine(ctx, l, L.sp, size, y); y += lh; });
    // מראה מקום
    ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.font = '400 31px ' + FR;
    let src = '— משיחת ' + p.name + ' —';
    while (ctx.measureText(src).width > MAXW && src.length > 20) src = src.replace(/\s*\S+\s*—$/, ' —');
    ctx.fillText(src, W / 2, y - lh + size * .4 + 70);
    // שם האתר, בעדינות בתחתית המסגרת
    ctx.globalAlpha = .55; ctx.font = '400 24px ' + FR; ctx.fillText('ספר השיחות מתורגם ללה״ק', W / 2, H - 82); ctx.globalAlpha = 1;

    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    return { blob, cut };
  }

  // ---------- חלון תצוגה מקדימה ----------
  let box, img, note, btnShare, cur = null;
  function ui() {
    if (box) return;
    const st = document.createElement('style');
    st.textContent = `
      #qimg-box{position:fixed;inset:0;z-index:9000;background:rgba(10,16,28,.88);display:none;align-items:center;justify-content:center;padding:16px}
      #qimg-box.show{display:flex}
      #qimg-box .w{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:100%;max-height:100%}
      #qimg-box img{max-width:min(92vw,420px);max-height:72vh;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.6);background:#141c2e}
      #qimg-box .b{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
      #qimg-box button{background:#b8955a;color:#fff;border:none;border-radius:24px;padding:11px 20px;font:500 .95rem 'Heebo',sans-serif;cursor:pointer}
      #qimg-box button.g{background:transparent;border:1px solid rgba(255,255,255,.6)}
      #qimg-box .n{color:#d9dde4;font:400 .82rem 'Heebo',sans-serif;text-align:center;min-height:1em;max-width:420px}`;
    document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'qimg-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'ציטוט כתמונה');
    box.innerHTML = '<div class="w"><img alt="תמונת הציטוט"><div class="b">' +
      '<button type="button" data-a="share">שיתוף התמונה</button><button type="button" data-a="dl">הורדה</button>' +
      '<button type="button" data-a="close" class="g">סגירה</button></div><div class="n"></div></div>';
    document.body.appendChild(box);
    img = box.querySelector('img'); note = box.querySelector('.n'); btnShare = box.querySelector('[data-a=share]');
    box.addEventListener('click', async e => {
      const a = e.target.closest('button') && e.target.closest('button').dataset.a;
      if (e.target === box || a === 'close') return close();
      if (!cur) return;
      if (a === 'share') { try { await navigator.share({ files: [cur.file], text: cur.link }); } catch (er) {} }
      if (a === 'dl') { const l = document.createElement('a'); l.href = cur.url; l.download = cur.file.name; document.body.appendChild(l); l.click(); l.remove(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  function close() { if (!box) return; box.classList.remove('show'); if (cur) { URL.revokeObjectURL(cur.url); cur = null; } }

  async function open(p) {
    ui();
    const r = await make(p);
    if (cur) URL.revokeObjectURL(cur.url);
    const fname = 'ציטוט - ' + String(p.name).replace(/[\\/:*?"<>|]/g, '').slice(0, 40) + '.png';
    cur = { url: URL.createObjectURL(r.blob), file: new File([r.blob], fname, { type: 'image/png' }), link: p.link || '' };
    img.src = cur.url;
    note.textContent = r.cut ? 'הקטע ארוך, ולכן בתמונה הוא קוצר.' : '';
    btnShare.style.display = (navigator.canShare && navigator.canShare({ files: [cur.file] })) ? '' : 'none';
    box.classList.add('show');
  }
  window.QuoteImage = { open, make };
})();
