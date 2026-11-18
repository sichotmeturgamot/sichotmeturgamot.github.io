document.querySelectorAll('.gal').forEach(function (g) {
  var track = g.querySelector('.track'), slides = [].slice.call(track.children);
  var dots = g.querySelector('.dots'), thumbs = g.querySelector('.thumbs');
  var prev = g.querySelector('.prev'), next = g.querySelector('.next'), cur = 0;
  if (slides.length > 1) g.classList.add('multi');
  slides.forEach(function (s, i) {
    var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'תמונה ' + (i + 1));
    d.onclick = function () { go(i); }; dots.appendChild(d);
    var t = document.createElement('button'); t.type = 'button'; t.setAttribute('aria-label', s.dataset.label || ('תמונה ' + (i + 1)));
    var im = s.querySelector('img');
    if (im) { var c = document.createElement('img'); c.src = im.currentSrc || im.src; c.alt = ''; c.loading = 'lazy'; t.appendChild(c); }
    else { t.innerHTML = '<span class="vid">▶</span>'; }
    t.onclick = function () { go(i); }; thumbs.appendChild(t);
  });
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
  }
  function mark(i) {
    if (i !== cur) { var v = slides[cur].querySelector('video'); if (v) v.pause(); }
    cur = i;
    [].forEach.call(dots.children, function (b, k) { b.setAttribute('aria-current', k === i); });
    [].forEach.call(thumbs.children, function (b, k) { b.setAttribute('aria-current', k === i); });
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.intersectionRatio > 0.6) mark(slides.indexOf(e.target)); });
  }, { root: track, threshold: [0.6] });
  slides.forEach(function (s) { io.observe(s); });
  prev.onclick = function () { go(cur - 1); }; next.onclick = function () { go(cur + 1); };
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(cur + 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(cur - 1); e.preventDefault(); }
  });
  mark(0);
});
