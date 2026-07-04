(function () {
  // אם האתר כבר מותקן (רץ כאפליקציה) — אין צורך בכפתור
  var standalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  if (standalone) return;

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var deferredPrompt = null;

  var wrap = document.createElement('div');
  wrap.className = 'install-fab';
  wrap.innerHTML =
    '<button class="install-btn" id="pwa-install" type="button">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="M8 10l4 4 4-4"/><path d="M5 20h14"/></svg>' +
      '<span>התקנת האפליקציה</span>' +
    '</button>' +
    '<button class="install-btn share" id="pwa-share" type="button" aria-label="שיתוף האתר">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>' +
    '</button>';
  document.body.appendChild(wrap);

  var installBtn = wrap.querySelector('#pwa-install');
  var shareBtn = wrap.querySelector('#pwa-share');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', function () {
    wrap.style.display = 'none';
  });

  installBtn.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
    } else {
      showHelp();
    }
  });

  shareBtn.addEventListener('click', function () {
    var url = location.origin + '/';
    var data = {
      title: 'ספר השיחות מתורגם ללה"ק',
      text: 'ספר השיחות מתורגם ללשון הקודש — אפשר להתקין כאפליקציה למסך הבית',
      url: url
    };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        function () { toast('הקישור הועתק — אפשר להדביק ולשלוח'); },
        function () { window.prompt('העתיקו את הקישור:', url); }
      );
    } else {
      window.prompt('העתיקו את הקישור:', url);
    }
  });

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'pwa-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  }

  function showHelp() {
    var steps = isIOS
      ? 'לחצו על כפתור <b>השיתוף</b> בתחתית ספארי (ריבוע עם חץ ↑), גללו ובחרו <b>"הוספה למסך הבית"</b>.'
      : 'פתחו את תפריט הדפדפן (⋮) ובחרו <b>"התקן אפליקציה"</b> או <b>"הוספה למסך הבית"</b>.';
    var m = document.createElement('div');
    m.className = 'pwa-modal';
    m.innerHTML =
      '<div class="pwa-modal-box">' +
        '<div class="pwa-modal-icon">📲</div>' +
        '<h3>התקנת האפליקציה</h3>' +
        '<p>' + steps + '</p>' +
        '<button class="btn btn-navy" type="button">הבנתי</button>' +
      '</div>';
    document.body.appendChild(m);
    function close() { m.remove(); }
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    m.querySelector('button').addEventListener('click', close);
  }
})();
