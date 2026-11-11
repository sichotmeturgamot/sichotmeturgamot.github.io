// תפריט משותף לכל עמודי האתר — סרגל עליון (שולחני) וסרגל תחתון (טלפון).
// עדכון סדר/פריטי התפריט נעשה כאן, במקום אחד, ומשפיע על כל העמודים.
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html');
  var RZLIVE = !!(window.RZ_CONFIG && window.RZ_CONFIG.live);   // מרכז הריי״ץ נוסף כעמוד נפרד «תורת אדמו״ר הריי״ץ» (מתג בעמוד הניהול)
  if (page === 'search.html' || page === 'answer.html') page = 'ask.html';   // המפתחות שייכים ללשונית "חיפוש" (ברירת המחדל: שאלה)

  // סדר התפריט העליון (שולחני)
  var links = [
    ['index.html',     'ראשי'],
    ['sichos.html',    'שיחות מתורגמות'],
    ['milon.html',     'מילון'],
    ['stories.html',   'סיפורים ופתגמים'],
    ['ask.html',       'חיפוש'],
    ['subscribe.html', 'הצטרפות לעדכונים'],
    ['donate.html',    'תרומה'],
    ['about.html',     'אודות'],
    ['feedback.html',  'פידבק']
  ];
  if (RZLIVE) links.splice(2, 0, ['rayatz.html', 'תורת אדמו״ר הריי״ץ']);   // עמוד נוסף לצד שיחות מתורגמות
  var linksHtml = links.map(function (l) {
    return '<a href="' + l[0] + '"' + (l[0] === page ? ' class="active"' : '') + '>' + l[1] + '</a>';
  }).join('');

  var top = document.querySelector('.topnav');

  // כפתור «האזור שלי» / «התחברות» בפינה הימנית העליונה של כל עמוד (צד ימין = תחילת השורה בעברית)
  if (top && !top.querySelector('.rz-navuser')) {
    var st0 = document.createElement('style');
    st0.textContent = '.topnav{position:sticky}' +
      '.rz-navuser{display:inline-flex;align-items:center;flex:0 0 auto}' +
      '.rz-navbtn{font:inherit;font-size:.84rem;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--gold,#b8933e);background:transparent;color:#e8d9b0;border-radius:18px;padding:4px 12px;cursor:pointer;text-decoration:none;line-height:1.3}' +
      '.rz-navbtn:hover{background:rgba(232,217,176,.12)}.rz-navbtn.in{background:rgba(232,217,176,.12)}' +
      '@media (max-width:640px){.rz-navuser{position:absolute;inset-inline-start:10px;top:50%;transform:translateY(-50%)}' +
      '.rz-navbtn{width:34px;height:34px;padding:0;justify-content:center;border-radius:50%}.rz-navlbl{display:none}}';
    document.head.appendChild(st0);
    var ub = document.createElement('div'); ub.className = 'rz-navuser';
    top.insertBefore(ub, top.firstChild);
    var mountUser = function () { if (window.RZ) RZ.mount(ub, { nav: true }); };
    if (window.RZ) mountUser();
    else { var sc0 = document.createElement('script'); sc0.src = 'rayatz-auth.js?v=20261109a'; sc0.onload = mountUser; document.head.appendChild(sc0); }
  }

  if (top) {
    var box = top.querySelector('.links');
    if (!box) { box = document.createElement('div'); box.className = 'links'; top.appendChild(box); }
    box.innerHTML = linksHtml;   // מחליף רק את הקישורים; הלוגו (brand) נשאר
  }

  // סרגל תחתון (טלפון): ראשי, קריאה, מילון, חיפוש (מפתחות + שאלה), עוד — "עדכונים/תרומה/פידבק" בתוך "עוד"
  var bItems = [
    ['index.html',  'ראשי',   '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'],
    ['sichos.html', 'שיחות מתורגמות',  '<path d="M12 5c-2-1.5-5-2-8-2v16c3 0 6 .5 8 2 2-1.5 5-2 8-2V3c-3 0-6 .5-8 2z"/><path d="M12 5v16"/>'],
    ['milon.html',  'מילון',  '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M9 7h6M9 11h6"/>'],
    ['ask.html',    'חיפוש', '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'],
    ['stories.html', 'סיפורים ופתגמים', '<path d="M7 8h10M7 12h7"/><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'],
    ['subscribe.html', 'הצטרפות לעדכונים', '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10 21a2 2 0 004 0"/>'],
    ['donate.html', 'תרומה', '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z"/>'],
    ['about.html',  'אודות', '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>'],
    ['feedback.html', 'פידבק', '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'],
    ['#share', 'שיתוף והתקנה', '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>']
  ];
  if (RZLIVE) bItems.splice(2, 0, ['rayatz.html', 'תורת אדמו״ר הריי״ץ', '<path d="M2 20h3.2l1.6-16H3.6z"/><path d="M3.15 8.5h3.2M2.45 15.5h3.2"/><rect x="9.2" y="4" width="3" height="16" rx=".5"/><path d="M9.2 8.5h3M9.2 15.5h3"/><rect x="14.2" y="4" width="3" height="16" rx=".5"/><path d="M14.2 8.5h3M14.2 15.5h3"/><rect x="19.2" y="4" width="3" height="16" rx=".5"/><path d="M19.2 8.5h3M19.2 15.5h3"/>']);
  var bHtml = bItems.map(function (b) {
    return '<a href="' + b[0] + '"' + (b[0] === page ? ' class="active"' : '') + (b[0] === '#share' ? ' data-bshare="1"' : '') +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + b[2] + '</svg><span>' + b[1] + '</span></a>';
  }).join('');

  var bn = document.querySelector('.bottomnav');
  if (!bn) { bn = document.createElement('nav'); bn.className = 'bottomnav'; document.body.appendChild(bn); }
  bn.innerHTML = bHtml;
  // מגע על הסרגל התחתון לא מגיע למנגנון ההחלקה בין עמודים (נרשם בשלב הלכידה, לפני שאר המאזינים)
  if (!window.__bnGuard) {
    window.__bnGuard = true;
    addEventListener('touchstart', function (e) {
      var b = document.querySelector('.bottomnav');
      if (!b || getComputedStyle(b).display === 'none') return;
      var r = b.getBoundingClientRect(), t = e.touches[0];
      if (t && t.clientY >= r.top - 4) e.stopImmediatePropagation();
    }, { capture: true, passive: true });
  }
  var sh = bn.querySelector('[data-bshare]');
  if (sh) sh.addEventListener('click', function (e) {
    e.preventDefault();
    var data = { title: 'ספר השיחות מתורגם ללה״ק', text: 'ספר השיחות מתורגם ללשון הקודש', url: location.origin + '/' };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url); alert('הקישור הועתק'); }
  });
  var act = bn.querySelector('a.active');
  if (act && act.scrollIntoView) try { bn.scrollLeft += act.getBoundingClientRect().left - bn.getBoundingClientRect().left - (bn.clientWidth - act.offsetWidth) / 2; } catch (e) {}
})();

  // חזרה אחורה במחשב + תיקון עמוד שנשמר שקוף אחרי מעבר
  (function () {
    function sameSiteRef() {
      try {
        if (!document.referrer) return false;
        var u = new URL(document.referrer);
        return u.origin === location.origin;
      } catch (e) { return false; }
    }
    window.sichosGoBack = function (fallback) {
      if (sameSiteRef() && history.length > 1) history.back();
      else location.href = fallback || 'index.html';
    };

    addEventListener('pageshow', function () {
      document.body.style.opacity = '';
      document.body.style.transform = '';
    });

    var page = (location.pathname.split('/').pop() || 'index.html');
    var top = document.querySelector('.topnav');
    if (!top) return;
    if (page === 'index.html' && !sameSiteRef()) return;

    if (!document.getElementById('sichos-back-style')) {
      var st = document.createElement('style');
      st.id = 'sichos-back-style';
      st.textContent = '.topnav .back-btn{display:none;align-items:center;gap:4px;margin-inline-end:10px;color:inherit;text-decoration:none;font-size:.92rem;opacity:.85;background:none;border:0;cursor:pointer;font-family:inherit;padding:4px 0}' +
        '@media (min-width:901px){.topnav .back-btn{display:inline-flex}}' +
        '.topnav .back-btn:hover{opacity:1}';
      document.head.appendChild(st);
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-btn';
    btn.setAttribute('aria-label', 'חזרה');
    btn.innerHTML = '<span aria-hidden="true">→</span> חזור';
    btn.addEventListener('click', function () { window.sichosGoBack(page === 'read.html' ? 'sichos.html' : 'index.html'); });
    var ubx = top.querySelector('.rz-navuser'); top.insertBefore(btn, ubx ? ubx.nextSibling : top.firstChild);
  })();

