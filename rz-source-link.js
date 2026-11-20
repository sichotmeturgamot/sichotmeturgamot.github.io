/* קישור מקור בתשובות החיפוש וה-AI → העמוד המתאים ב"תורת אדמו״ר הריי״ץ" (rayatz-read.html).
   הקישור נבנה בלחיצה: טוענים את rayatz-data.js (פעם אחת), מזהים את הספר והעמוד לפי כותרת המקור,
   ופותחים את הקורא בעמוד הנכון (באותו חלון, כדי שאפשר יהיה לחזור לתשובה). אם אי אפשר לזהות — נפתח עמוד "תורת אדמו״ר הריי״ץ". */
(function () {
  var LABEL = 'למקור בתורת אדמו״ר הריי״ץ ↗';
  var norm = function (s) { return String(s || '').replace(/[“”„״"]/g, '״').replace(/[‘’׳']/g, '׳').replace(/\s+/g, ' ').trim(); };
  var GV = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400 };
  function gem(s) { var n = 0; String(s || '').split('').forEach(function (ch) { n += GV[ch] || 0; }); return n; }
  function cleanBookTitle(s) { return norm(s).replace(/\s*\((?:לה״ק|אידיש)\)\s*$/, ''); }

  function loadData(cb) {
    if (typeof RAYATZ !== 'undefined') return cb();
    var s = document.createElement('script'); s.src = 'rayatz-data.js?v=20261116f';
    s.onload = function () { cb(); }; s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  // שם ספר/שנה בלי ה׳, בלי "חורף", בלי (לה״ק), בלי גרשיים ורווחים — כדי ש"תרצ״ו–ה׳ש״ת" = "תרצ״ו–חורף ה׳ש״ת"
  function key(s) { return norm(s).replace(/\((?:לה״ק|אידיש)\)/g, '').replace(/חורף/g, '').replace(/(^|[\s–\-])ה׳/g, '$1').replace(/[׳״\s]/g, '').replace(/[–\-]/g, '-'); }

  // כותרת מקור → {ספר באתר, ושנה (חלק) בתוך הספר כשהמספור מתחיל מחדש בכל שנה}
  function bookOf(t, books) {
    var m, id = null;
    if ((m = /^אגרות קודש\s+(?:אדמו״ר\s+(?:מו)?הריי״[צץ]\s+)?(?:ח״|חלק\s+|כרך\s+)?([א-ת׳״]+)/.exec(t))) id = 'ak-' + gem(m[1]);
    else if ((m = /^לקוטי דיבורים\s+(?:ח״|חלק\s+|כרך\s+)?([א-ת׳״]+)/.exec(t))) id = 'ld-' + gem(m[1]);
    else if ((m = /^ספר הזכרונות\s+(?:ח״|חלק\s+)?([א-ת׳״]+)/.exec(t))) { var n = gem(m[1]); id = n === 3 ? 'zy-3' : 'zk-' + n; }
    else if (/הצמח צדק ותנועת ההשכלה/.test(t)) id = 'kn-2';
    else if (/^קונטרס דברי ימי החוזרים/.test(t)) id = 'kn-1';
    else if ((m = /^רשימות(?: היומן)?\s+חוברת\s+([א-ת׳״]+)/.exec(t))) id = 'rs-' + gem(m[1]);
    if (id) { for (var i = 0; i < books.length; i++) if (books[i].id === id) return { b: books[i] }; }
    var name = t.split(' — ')[0], he = /\(לה״ק\)/.test(name), nk = key(name);
    // 1) שם הספר זהה (אחרי ניקוי) או שהכותרת מתחילה בו
    var best = null;
    books.forEach(function (b) {
      var bk = key(b.title);
      if (bk.length > 6 && (nk === bk || nk.indexOf(bk) === 0) && (!best || bk.length > key(best.title).length)) best = b;
    });
    if (best) return { b: best };
    // 2) שנה אחת מתוך כרך משותף (למשל "ספר השיחות ה׳תש״ד (לה״ק)" בתוך "ה׳תש״ד–תש״ה"): מחפשים חלק בשם השנה
    if ((m = /^ספר השיחות\s+(.+)$/.exec(name))) {
      var yk = key(m[1]), hit = null;
      books.forEach(function (b) {
        if (!/^ספר השיחות/.test(b.title)) return;
        var bhe = /\(לה״ק\)/.test(b.title);
        (b.sections || []).forEach(function (sec) {
          if (key(sec.id) !== yk) return;
          var score = (bhe === he ? 2 : 0);
          if (!hit || score > hit.score) hit = { b: b, sec: sec, score: score };
        });
      });
      if (hit) {   // בכרכי לה״ק המספור מתחיל מחדש בכל שנה; בכרכי אידיש הוא רציף
        var restart = false, prev = 0;
        (hit.b.sections || []).forEach(function (sec) { if (/הוספות/.test(sec.id)) return; var xs = (sec.sichos || []).filter(function (x) { return x.ps != null; }); if (!xs.length) return; if (xs[0].ps < prev) restart = true; prev = xs[xs.length - 1].ps; });
        return { b: hit.b, sec: restart ? hit.sec : null };
      }
    }
    return null;
  }

  // עמוד מודפס → עמוד PDF בקובץ שבאתר
  function pdfPage(b, pg, only) {
    if (!pg) return 0;
    var pick = null;
    (only ? [only] : (b.sections || [])).forEach(function (sec) {
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
    var r = bookOf(t, books);
    if (!r) return 'rayatz.html';
    var b = r.b, page = 0, fm = /עמ['׳.]*\s*(\d+)\s+בקובץ/.exec(t);
    if (fm) page = Math.min(+fm[1], b.pages || +fm[1]);   // "עמ׳ N בקובץ" = כבר עמוד בקובץ
    else {
      var pm = /עמ['׳.]*\s*(\d+|[א-ת]+[׳״]?[א-ת]?)\s*\)/.exec(t);
      if (pm && pm[1] !== 'מבוא') page = pdfPage(b, /^\d/.test(pm[1]) ? +pm[1] : gem(pm[1]), r.sec);
    }
    if (!page && c.u) { var um = /pgnum=(\d+)/.exec(c.u); if (um) page = +um[1]; }
    return 'rayatz-read.html?book=' + encodeURIComponent(b.id) + (page ? '&page=' + page : '') + '&title=' + encodeURIComponent(t);
  }

  // יוצר את הקישור. טקסט בלי f → תורת אדמו״ר הריי״ץ; שיחה מתורגמת (f) נשארת בקורא של השיחות המתורגמות.
  window.rzSrcLink = function (c) {
    var l = document.createElement('a');
    if (c.f && !c.u) {
      l.textContent = 'לקריאת השיחה';
      l.href = 'read.html?file=' + encodeURIComponent('pdfs/' + c.f + '.pdf') + '&title=' + encodeURIComponent(c.t);
      return l;
    }
    l.textContent = LABEL; l.href = 'rayatz.html';
    l.addEventListener('click', function (e) {
      e.preventDefault();
      l.textContent = 'פותח…';
      loadData(function () { location.href = resolve(c); });   // באותו חלון — כך כפתור "חזרה" מחזיר לתשובה
    });
    return l;
  };
  window.rzResolveSource = resolve;   // לבדיקות
})();
