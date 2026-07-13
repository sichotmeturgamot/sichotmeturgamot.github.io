// חלונית "עוד" משותפת לסרגל התחתון — נטענת בכל עמוד
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html');

  var items = [
    { href: 'donate.html',   label: 'תרומה',        icon: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z"/>' },
    { href: 'feedback.html', label: 'פידבק',         icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', badge: 'חדש' },
    { href: 'help.html',     label: 'עזרה והדרכה',   icon: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 2.2-2.5 3.7M12 17h.01"/>' },
    { href: '#share',        label: 'שיתוף והתקנה',  icon: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>', share: true }
  ];

  var sheetPages = ['donate.html', 'feedback.html', 'help.html'];

  var backdrop = document.createElement('div');
  backdrop.className = 'more-backdrop';

  var sheet = document.createElement('div');
  sheet.className = 'more-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'עוד');

  var html = '<div class="more-grip"></div><div class="more-title">עוד</div>';
  items.forEach(function (it) {
    var active = (it.href === page) ? ' more-active' : '';
    var badge = it.badge ? '<span class="more-badge">' + it.badge + '</span>' : '';
    html += '<a class="more-item' + active + '" href="' + it.href + '"' + (it.share ? ' data-share="1"' : '') + '>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' + it.icon + '</svg>' +
            '<span>' + it.label + '</span>' + badge + '</a>';
  });
  sheet.innerHTML = html;

  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);

  function open() { backdrop.classList.add('show'); sheet.classList.add('show'); }
  function close() { backdrop.classList.remove('show'); sheet.classList.remove('show'); }

  var tab = document.getElementById('more-tab');
  if (tab) {
    // הדגשת "עוד" כשנמצאים באחד מעמודי החלונית
    if (sheetPages.indexOf(page) !== -1) tab.classList.add('active');
    tab.addEventListener('click', function (e) { e.preventDefault(); open(); });
  }
  backdrop.addEventListener('click', close);

  // שיתוף
  sheet.querySelectorAll('[data-share]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var data = { title: 'ספר השיחות מתורגם ללה״ק', text: 'ספר השיחות מתורגם ללשון הקודש', url: location.origin + '/' };
      if (navigator.share) { navigator.share(data).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(data.url); alert('הקישור הועתק'); }
      close();
    });
  });
})();
