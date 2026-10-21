/* ציטוט כתמונה — יוצר תמונה מעוצבת (PNG) של קטע מהשיחות, עם מראה מקום ושם האתר,
   ומציג תצוגה מקדימה עם "שיתוף" / "הורדה".
   שימוש: QuoteImage.open({ text, name, link })   — name = שם השיחה (בלי "שיחת"), link = קישור לשיחה */
(function () {
  const C = { W: 1080, pad: 110, bg: '#f4efe4', navy: '#1a2942', gold: '#b8933e', cream: '#f4efe4', goldLight: '#d4b56a' };
  const MAX_TEXT_H = 1300;   // גובה מרבי לטקסט הציטוט (פיקסלים בתמונה)

  function wrapLines(ctx, text, maxW) {
    const out = [];                                           // {t, last} — last = שורה אחרונה בפסקה (לא מיושרת לשני הצדדים)
    text.split(/\n\s*\n+|\n/).forEach((para, pi) => {
      if (pi) out.push(null);                                 // רווח בין פסקאות
      let line = '';
      para.split(/\s+/).filter(Boolean).forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width > maxW && line) { out.push({ t: line, last: false }); line = w; } else line = t;
      });
      if (line) out.push({ t: line, last: true });
    });
    return out;
  }
  // שורה מיושרת לשני הצדדים: מפזרים את הרווח העודף בין המילים (מימין לשמאל)
  function drawJustified(ctx, l, right, maxW, y) {
    const words = l.t.split(' ');
    if (l.last || words.length < 2) { ctx.textAlign = 'right'; ctx.fillText(l.t, right, y); return; }
    const ws = words.map(w => ctx.measureText(w).width), sum = ws.reduce((a, b) => a + b, 0);
    const gap = (maxW - sum) / (words.length - 1);
    if (gap > ctx.measureText(' ').width * 3.2) { ctx.textAlign = 'right'; ctx.fillText(l.t, right, y); return; }  // רווחים גדולים מדי — בלי יישור
    ctx.textAlign = 'right'; let x = right;
    words.forEach((w, i) => { ctx.fillText(w, x, y); x -= ws[i] + gap; });
  }
  const textH = (lines, lh) => lines.reduce((h, l) => h + (l === null ? lh * .55 : lh), 0);

  async function make(p) {
    try {
      await Promise.all([document.fonts.load('500 46px "Frank Ruhl Libre"'), document.fonts.load('700 40px "Frank Ruhl Libre"'),
                         document.fonts.load('400 26px Heebo')]);
    } catch (e) {}
    const W = C.W, maxW = W - 2 * C.pad, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    ctx.direction = 'rtl';
    let text = String(p.text).replace(/\*([^*\n]+)\*/g, '$1').trim(), size = 48, lines, cut = false;
    // גודל הגופן לפי אורך הקטע; קטע ארוך מאוד — מקוצר במילה שלמה
    for (;;) {
      ctx.font = '500 ' + size + 'px "Frank Ruhl Libre", serif';
      lines = wrapLines(ctx, text, maxW);
      if (textH(lines, size * 1.62) <= MAX_TEXT_H) break;
      if (size > 32) { size -= 2; continue; }
      const words = text.split(/\s+/);
      words.length = Math.max(15, Math.floor(words.length * .9));
      text = words.join(' ').replace(/[,.;:—–\-]+$/, '') + ' …'; cut = true;
    }
    const lh = size * 1.62;
    ctx.font = '700 36px "Frank Ruhl Libre", serif';
    const srcLines = wrapLines(ctx, 'מתוך שיחת ' + p.name, maxW);
    const top = 210, footH = 150;
    const H = Math.max(1080, Math.round(top + textH(lines, lh) + 80 + srcLines.length * 52 + 70 + footH));
    cv.width = W; cv.height = H;
    ctx.direction = 'rtl'; ctx.textBaseline = 'alphabetic';
    // רקע ומסגרת כפולה
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.strokeRect(40, 40, W - 80, H - footH - 80);
    ctx.lineWidth = 1; ctx.strokeRect(50, 50, W - 100, H - footH - 100);
    // ב"ה ומרכאות
    ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.font = '400 30px "Frank Ruhl Libre", serif';
    ctx.fillText('ב״ה', W / 2, 108);
    ctx.font = '700 150px "Frank Ruhl Libre", serif'; ctx.textAlign = 'right'; ctx.globalAlpha = .3;
    ctx.fillText('”', W - C.pad + 24, 238); ctx.globalAlpha = 1;
    // הציטוט
    ctx.fillStyle = C.navy; ctx.textAlign = 'right';
    ctx.font = '500 ' + size + 'px "Frank Ruhl Libre", serif';
    let y = top + size;
    lines.forEach(l => { if (l === null) { y += lh * .55; return; } drawJustified(ctx, l, W - C.pad, maxW, y); y += lh; });
    // קו ומראה מקום
    y += 22; ctx.fillStyle = C.gold; ctx.fillRect(W - C.pad - 90, y, 90, 3);
    y += 62; ctx.fillStyle = C.navy; ctx.font = '700 36px "Frank Ruhl Libre", serif';
    srcLines.forEach(l => { ctx.textAlign = 'right'; ctx.fillText(l.t, W - C.pad, y); y += 52; });
    // פס תחתון עם שם האתר
    ctx.fillStyle = C.navy; ctx.fillRect(0, H - footH, W, footH);
    ctx.textAlign = 'center'; ctx.fillStyle = C.cream; ctx.font = '500 40px "Frank Ruhl Libre", serif';
    ctx.fillText('ספר השיחות מתורגם ללה״ק', W / 2, H - footH + 66);
    ctx.direction = 'ltr'; ctx.fillStyle = C.goldLight; ctx.font = '400 28px Heebo, sans-serif';
    ctx.fillText('sichotmeturgamot.com', W / 2, H - footH + 112);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    return { blob, cut };
  }

  // ---------- חלון תצוגה מקדימה ----------
  let box, img, note, btnShare, cur = null;
  function ui() {
    if (box) return;
    const st = document.createElement('style');
    st.textContent = `
      #qimg-box{position:fixed;inset:0;z-index:9000;background:rgba(10,16,28,.84);display:none;align-items:center;justify-content:center;padding:16px}
      #qimg-box.show{display:flex}
      #qimg-box .w{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:100%;max-height:100%}
      #qimg-box img{max-width:min(92vw,520px);max-height:68vh;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.5);background:#f4efe4}
      #qimg-box .b{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
      #qimg-box button{background:#b8933e;color:#fff;border:none;border-radius:24px;padding:11px 20px;font:500 .95rem 'Heebo',sans-serif;cursor:pointer}
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
