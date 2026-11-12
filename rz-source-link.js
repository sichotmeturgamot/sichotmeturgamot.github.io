/* קישור מקור בתשובות החיפוש וה-AI → העמוד המתאים ב"תורת אדמו״ר הריי״ץ" (rayatz-read.html).
   הקישור נבנה בלחיצה: טוענים את rayatz-data.js (פעם אחת), מזהים את הספר והעמוד לפי כותרת המקור,
   ופותחים את הקורא בעמוד הנכון. אם אי אפשר לזהות — נפתח עמוד "תורת אדמו״ר הריי״ץ". */
(function () {
  var LABEL = 'למקור בתורת אדמו״ר הריי״ץ ↗';
  var norm = function (s) { return String(s || '').replace(/[“”„״"]/g, '״').replace(/[‘’׳']/g, '׳').replace(/\s+/g, ' ').trim(); };
  var GV = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400 };
  function gem(s) { var n = 0; String(s || '').split('').forEach(function (ch) { n += GV[ch] || 0; }); return n; }
  function cleanBookTitle(s) { return norm(s).replace(/\s*\((?:לה״ק|אידיש)\)\s*$/, ''); }

  function loadData(cb) {
    if (typeof RAYATZ !== 'undefined') return cb();
    var s = document.createElement('script'); s.src = 'rayatz-data.js?v=20261111y';
    s.onload = function () { cb(); }; s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  // כותרת מקור → מזהה ספר במרכז
  function bookOf(t, books) {
    var m, id = null;
    if ((m = /^אגרות קודש\s+(?:ח״|חלק\s+|כרך\s+)?([א-ת׳״]+)/.exec(t))) id = 'ak-' + gem(m[1]);
    else if ((m = /^לקוטי דיבורים\s+(?:ח״|חלק\s+|כרך\s+)?([א-ת׳״]+)/.exec(t))) id = 'ld-' + gem(m[1]);
    else if ((m = /^ספר הזכרונות\s+(?:ח״|חלק\s+)?([א-ת׳״]+)/.exec(t))) { var n = gem(m[1]); id = n === 3 ? 'zy-3' : 'zk-' + n; }
    else if ((m = /^רשימות(?: היומן)?\s+חוברת\s+([א-ת׳״]+)/.exec(t))) id = 'rs-' + gem(m[1]);
    if (id) { for (var i = 0; i < books.length; i++) if (books[i].id === id) return books[i]; }
    // ספרים אחרים: שם הספר במרכז הוא תחילת הכותרת (למשל "ספר השיחות תרפ״ח–תרצ״א")
    var best = null;
    books.forEach(function (b) {
      var bt = cleanBookTitle(b.title);
      if (bt.length > 6 && t.indexOf(bt) === 0 && (!best || bt.length > cleanBookTitle(best.title).length)) best = b;
    });
    return best;
  }

  // עמוד מודפס → עמוד PDF בקובץ של המרכז
  function pdfPage(b, pg) {
    if (!pg) return 0;
    var pick = null;
    (b.sections || []).forEach(function (sec) {
      (sec.sichos || []).forEach(function (x) {
        if (x.href || x.ps == null || x.pdf == null) return;
        if (x.ps <= pg && (!pick || x.ps >= pick.ps)) pick = x;
      });
    });
    if (!pick) return 0;
    var p = pick.pdf + (pg - pick.ps);
    return b.pages && p > b.pages ? pick.pdf : p;
  }

  function resolve(c) {
    var t = norm((c.t || '').replace(/\s*·\s*אידיש\s*$/, ''));
    var books = (typeof RAYATZ !== 'undefined' && RAYATZ.books) || [];
    var b = bookOf(t, books);
    if (!b) return 'rayatz.html';
    var pm = /עמ['׳.]*\s*(\d+)/.exec(t);
    var page = pm ? pdfPage(b, +pm[1]) : 0;
    if (!page && c.u) { var um = /pgnum=(\d+)/.exec(c.u); if (um) page = +um[1]; }
    return 'rayatz-read.html?book=' + encodeURIComponent(b.id) + (page ? '&page=' + page : '') + '&title=' + encodeURIComponent(t);
  }

  // יוצר את הקישור. טקסט בלי f → מרכז הריי״ץ; שיחה מתורגמת (f) נשארת בקורא של השיחות המתורגמות.
  window.rzSrcLink = function (c) {
    var l = document.createElement('a');
    if (c.f && !c.u) {
      l.textContent = 'לקריאת השיחה';
      l.href = 'read.html?file=' + encodeURIComponent('pdfs/' + c.f + '.pdf') + '&title=' + encodeURIComponent(c.t);
      return l;
    }
    l.textContent = LABEL; l.href = 'rayatz.html'; l.target = '_blank'; l.rel = 'noopener';
    l.addEventListener('click', function (e) {
      e.preventDefault();
      var w = window.open('about:blank', '_blank');   // נפתח מיד (לפני הטעינה) כדי שהדפדפן לא יחסום
      loadData(function () {
        var url = resolve(c);
        if (w) { try { w.opener = null; } catch (x) {} w.location.href = url; } else location.href = url;
      });
    });
    return l;
  };
  window.rzResolveSource = resolve;   // לבדיקות
})();
