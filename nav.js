// תפריט משותף לכל עמודי האתר — סרגל עליון (שולחני) וסרגל תחתון (טלפון).
// עדכון סדר/פריטי התפריט נעשה כאן, במקום אחד, ומשפיע על כל העמודים.
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html');

  // סדר התפריט העליון (שולחני)
  var links = [
    ['index.html',     'ראשי'],
    ['sichos.html',    'קריאת השיחות'],
    ['milon.html',     'מילון'],
    ['search.html',    'מפתחות'],
    ['subscribe.html', 'הצטרפות לעדכונים'],
    ['donate.html',    'תרומה'],
    ['feedback.html',  'פידבק']
  ];
  var linksHtml = links.map(function (l) {
    return '<a href="' + l[0] + '"' + (l[0] === page ? ' class="active"' : '') + '>' + l[1] + '</a>';
  }).join('');

  var top = document.querySelector('.topnav');
  if (top) {
    var box = top.querySelector('.links');
    if (!box) { box = document.createElement('div'); box.className = 'links'; top.appendChild(box); }
    box.innerHTML = linksHtml;   // מחליף רק את הקישורים; הלוגו (brand) נשאר
  }

  // סרגל תחתון (טלפון): ראשי, קריאה, מילון, מפתחות, עוד — "עדכונים/תרומה/פידבק" בתוך "עוד"
  var bItems = [
    ['index.html',  'ראשי',   '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'],
    ['sichos.html', 'קריאה',  '<path d="M12 5c-2-1.5-5-2-8-2v16c3 0 6 .5 8 2 2-1.5 5-2 8-2V3c-3 0-6 .5-8 2z"/><path d="M12 5v16"/>'],
    ['milon.html',  'מילון',  '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M9 7h6M9 11h6"/>'],
    ['search.html', 'מפתחות', '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>']
  ];
  var bHtml = bItems.map(function (b) {
    return '<a href="' + b[0] + '"' + (b[0] === page ? ' class="active"' : '') +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + b[2] + '</svg><span>' + b[1] + '</span></a>';
  }).join('');
  bHtml += '<a href="#more" id="more-tab"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg><span>עוד</span></a>';

  var bn = document.querySelector('.bottomnav');
  if (!bn) { bn = document.createElement('nav'); bn.className = 'bottomnav'; document.body.appendChild(bn); }
  bn.innerHTML = bHtml;
})();
