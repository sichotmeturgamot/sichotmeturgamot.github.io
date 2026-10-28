/* אזור אישי — מרכז הריי״ץ. התחברות אופציונלית עם Google (אותו חשבון כמו ב"שיחה עם השיחות"). */
(function () {
  var API = 'https://sichos-translate.doviber.workers.dev';
  var CLIENT_ID = '696641021937-mqm27b0nkh18t82oh17su951btii7l3f.apps.googleusercontent.com';
  var SK = 'rz-session', KEYN = 'rayatz-key', subs = [], gInit = false;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function load() { try { var s = JSON.parse(ls(SK) || 'null'); if (s && s.session && s.exp > Date.now()) return s; } catch (e) {} return null; }
  var S = load();
  function notify() { subs.forEach(function (f) { try { f(S); } catch (e) {} }); }
  function sessExp(t) { try { return JSON.parse(atob(t.split('.')[0].replace(/-/g, '+').replace(/_/g, '/'))).x || 0; } catch (e) { return 0; } }
  function fail(code) { return new Error(code); }

  async function exchange(cred) {
    var r = await fetch(API + '/me/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-key': ls(KEYN) || '' }, body: JSON.stringify({ credential: cred }) });
    var j = await r.json().catch(function () { return {}; });
    if (!j.ok) throw fail(j.error || 'login-failed');
    S = { session: j.session, email: j.email, exp: sessExp(j.session) };
    ls(SK, JSON.stringify(S)); notify(); return S;
  }
  // אם המשתמש כבר מחובר ב"שיחה עם השיחות" (אותו דפדפן) — מתחברים אוטומטית
  async function adopt() {
    if (S) return;
    try { var g = JSON.parse(ls('g-cred') || 'null'); if (g && g.c && g.exp > Date.now() + 60000) await exchange(g.c); } catch (e) {}
  }
  function gis(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    if (!document.getElementById('gis-js')) { var sc = document.createElement('script'); sc.id = 'gis-js'; sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; document.head.appendChild(sc); }
    setTimeout(function () { gis(cb); }, 250);
  }
  function modal() {
    var m = document.getElementById('rz-login'); if (m) { m.style.display = 'flex'; return; }
    m = document.createElement('div'); m.id = 'rz-login';
    m.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(15,25,45,.75);display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl';
    m.innerHTML = '<div style="background:#fffdf9;border-radius:14px;padding:22px 20px;max-width:340px;width:100%;text-align:center;font-family:Heebo,sans-serif;color:#2a2723">' +
      '<h3 style="font-family:\'Frank Ruhl Libre\',serif;color:#17233d;margin-bottom:6px">האזור האישי</h3>' +
      '<p style="font-size:.86rem;color:#8a7d61;line-height:1.5;margin-bottom:12px">התחברות אופציונלית עם חשבון Google. היא שומרת את היסטוריית התרגומים שלכם ומאפשרת לראות אותה מכל מכשיר. התרגומים נשמרים אצלנו, ואפשר למחוק אותם בכל עת.</p>' +
      '<div id="rz-gbtn" style="display:flex;justify-content:center;min-height:44px"></div>' +
      '<div id="rz-lerr" style="color:#a33a34;font-size:.84rem;min-height:1.2em;margin:8px 0"></div>' +
      '<button type="button" id="rz-lclose" style="font:inherit;font-size:.9rem;border:1px solid #d9d1c0;background:transparent;border-radius:20px;padding:6px 18px;cursor:pointer">סגור</button></div>';
    document.body.appendChild(m);
    m.onclick = function (e) { if (e.target === m) m.style.display = 'none'; };
    document.getElementById('rz-lclose').onclick = function () { m.style.display = 'none'; };
    gis(function () {
      if (!gInit) {
        gInit = true;
        google.accounts.id.initialize({ client_id: CLIENT_ID, auto_select: false, callback: function (r) {
          exchange(r.credential).then(function () { m.style.display = 'none'; }).catch(function (e) {
            document.getElementById('rz-lerr').textContent = 'ההתחברות נכשלה. נסו שוב.';
          });
        } });
      }
      google.accounts.id.renderButton(document.getElementById('rz-gbtn'), { theme: 'outline', size: 'large', text: 'signin_with', locale: 'he' });
    });
  }
  function signOut() { S = null; ls(SK, null); try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {} notify(); }
  async function call(path, body) {
    if (!S) throw fail('login-required');
    var r = await fetch(API + path, { method: body ? 'POST' : 'GET', headers: { 'x-key': ls(KEYN) || '', 'Authorization': 'Bearer ' + S.session, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401) { var j0 = await r.json().catch(function () { return {}; }); if (j0.error === 'login-required') signOut(); throw fail(j0.error || 'unauthorized'); }
    return r.json();
  }
  // כפתור/שורת משתמש קטנה בתוך אלמנט
  function mount(el, opt) {
    opt = opt || {};
    function draw() {
      el.innerHTML = '';
      var css = 'font:inherit;font-size:.82rem;border:1px solid #b8933e;background:transparent;color:#17233d;border-radius:18px;padding:4px 12px;cursor:pointer;text-decoration:none;display:inline-block;margin:0 3px';
      if (!S) { var b = document.createElement('button'); b.type = 'button'; b.style.cssText = css; b.textContent = opt.compact ? '👤 התחברות' : '👤 התחברות לאזור האישי'; b.title = 'התחברות לאזור האישי'; b.onclick = modal; el.appendChild(b); return; }
      if (opt.compact) { var a2 = document.createElement('a'); a2.href = 'rayatz-me.html'; a2.style.cssText = css; a2.title = S.email; a2.textContent = '👤 האזור שלי'; el.appendChild(a2); return; }
      var t = document.createElement('span'); t.style.cssText = 'font-size:.8rem;color:#8a7d61;margin:0 4px'; t.textContent = S.email; el.appendChild(t);
      if (!opt.noLink) { var a = document.createElement('a'); a.href = 'rayatz-me.html'; a.style.cssText = css; a.textContent = 'האזור שלי'; el.appendChild(a); }
      var o = document.createElement('button'); o.type = 'button'; o.style.cssText = css + ';border-color:#d9d1c0'; o.textContent = 'יציאה'; o.onclick = signOut; el.appendChild(o);
    }
    subs.push(draw); draw();
  }
  window.RZ = { adopt: adopt, get user() { return S; }, mount: mount, login: modal, logout: signOut, call: call, onChange: function (f) { subs.push(f); }, authHeader: function () { return S ? { 'Authorization': 'Bearer ' + S.session } : {}; }, ready: adopt() };
})();
