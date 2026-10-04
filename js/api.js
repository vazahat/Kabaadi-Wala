/* KWAPI — live-backend bridge with offline fallback.
   - Same-origin /api when served over http(s); silent offline mode on file:// or unreachable server.
   - Pull: server → localStorage. Push: local mutations → server (same ids, fire-and-forget).
   - Public pages use /api/bootstrap; admin uses JWT + /api/admin/*. */
(function(){
  const sameOrigin = /^https?:$/.test(location.protocol);
  const BASE = sameOrigin ? '/api' : null;
  let online = false, token = sessionStorage.getItem('kw_token') || '';
  const H = () => token ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/json' };
  async function req(path, opts = {}) {
    if (!BASE) throw new Error('offline');
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(BASE + path, { ...opts, headers: { ...(opts.headers || {}), ...(opts.auth ? H() : { 'Content-Type': 'application/json' }) }, signal: ctl.signal });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(j.error || ('HTTP ' + r.status)), { status: r.status, data: j });
      return j;
    } finally { clearTimeout(t); }
  }
  const LS = 'kw_db_v1';
  const read = () => JSON.parse(localStorage.getItem(LS));
  const write = db => localStorage.setItem(LS, JSON.stringify(db));
  const refresh = () => window.dispatchEvent(new Event('kw:refresh'));

  async function pull() {
    const b = await req('/bootstrap');
    const db = read();
    db.materials = b.materials.map(m => ({ id: m.id, cat: m.cat, name: m.name, desc: m.description, img: m.img, tags: m.tags, active: m.active }));
    db.testimonials = b.testimonials; db.faqs = b.faqs; db.areas = b.areas;
    Object.assign(db.settings, b.settings);
    write(db); refresh(); online = true;
  }
  async function pullAdmin() {
    if (!token) return;
    const [p, q, c, bb, m, t, f] = await Promise.all([
      req('/admin/pickups', { auth: true }), req('/admin/quotes', { auth: true }),
      req('/admin/customers', { auth: true }), req('/admin/b2b', { auth: true }),
      req('/admin/materials', { auth: true }), req('/admin/testimonials', { auth: true }),
      req('/admin/faqs', { auth: true }),
    ]);
    const db = read();
    db.pickups = p; db.quotes = q; db.customers = c; db.b2b = bb;
    db.materials = m.map(x => ({ id: x.id, cat: x.cat, name: x.name, desc: x.description, img: x.img, tags: x.tags, active: x.active }));
    db.testimonials = t; db.faqs = f;
    write(db); online = true;
  }
  const fire = (path, method, body, auth = false) => {
    if (!online && BASE) { /* still try once; first success flips online */ }
    req(path, { method, auth, body: body ? JSON.stringify(body) : undefined }).then(() => { online = true; }).catch(() => {});
  };
  function wrapMutations() {
    const K = window.KWDB; if (!K || K.__bridged) return; K.__bridged = true;
    const wrap = (name, push) => { const o = K[name]; K[name] = function (...a) { const r = o.apply(this, a); try { push(r, ...a); } catch (e) {} return r; }; };
    wrap('addPickup', r => fire('/pickups', 'POST', r));
    wrap('addQuote', r => fire('/quotes', 'POST', r));
    wrap('addB2B', r => fire('/b2b', 'POST', r));
    wrap('setPickupStatus', (r, id, st) => token && fire('/admin/pickups/' + id, 'PATCH', { status: st }, true));
    wrap('delPickup', (r, id) => token && fire('/admin/pickups/' + id, 'DELETE', null, true));
    wrap('setQuote', (r, id, p) => token && fire('/admin/quotes/' + id, 'PATCH', p, true));
    wrap('delQuote', (r, id) => token && fire('/admin/quotes/' + id, 'DELETE', null, true));
    const M0 = K.upsertMaterial;
    K.upsertMaterial = function (m) { if (m && m.id) m.__existed = !!K.materialsAll().find(x => x.id === m.id); const r = M0.apply(this, arguments); try { if (token && m) fire(m.__existed ? '/admin/materials/' + m.id : '/admin/materials', m.__existed ? 'PUT' : 'POST', toServer(m), true); } catch (e) {} return r; };
    wrap('delMaterial', (r, id) => token && fire('/admin/materials/' + id, 'DELETE', null, true));
    const T0 = K.upsertTesti;
    K.upsertTesti = function (t) { if (t && t.id) t.__existed = !!K.testimonialsAll().find(x => x.id === t.id); const r = T0.apply(this, arguments); try { if (token && t) fire(t.__existed ? '/admin/testimonials/' + t.id : '/admin/testimonials', t.__existed ? 'PUT' : 'POST', t, true); } catch (e) {} return r; };
    wrap('delTesti', (r, id) => token && fire('/admin/testimonials/' + id, 'DELETE', null, true));
    const F0 = K.upsertFaq;
    K.upsertFaq = function (f) { if (f && f.id) f.__existed = !!K.faqsAll().find(x => x.id === f.id); const r = F0.apply(this, arguments); try { if (token && f) fire(f.__existed ? '/admin/faqs/' + f.id : '/admin/faqs', f.__existed ? 'PUT' : 'POST', f, true); } catch (e) {} return r; };
    wrap('delFaq', (r, id) => token && fire('/admin/faqs/' + id, 'DELETE', null, true));
    wrap('setAreas', (r, a) => token && fire('/admin/areas', 'PUT', { areas: a }, true));
    wrap('saveSettings', (r, s) => token && fire('/admin/settings', 'PUT', s, true));
  }
  function toServer(m) { const c = { ...m }; if (c.desc !== undefined && c.description === undefined) { c.description = c.desc; } delete c.__existed; return c; }

  window.KWAPI = {
    get online() { return online; },
    get token() { return token; },
    async uploadPhotos(files) {
      const fd = new FormData(); files.forEach(f => fd.append('photos', f));
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
      try {
        const r = await fetch((BASE || '') + '/api/uploads', { method: 'POST', body: fd, signal: ctl.signal });
        /* note: absolute path fallback when BASE is null — will fail offline, caller falls back to filenames */
        const j = await r.json().catch(() => null);
        if (!r.ok || !Array.isArray(j)) throw new Error((j && j.error) || 'upload failed');
        online = true; return j.map(x => x.url);
      } finally { clearTimeout(t); }
    },
    async login(username, password) {
      const j = await req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      token = j.token; sessionStorage.setItem('kw_token', token); online = true; return j;
    },
    logout() { token = ''; sessionStorage.removeItem('kw_token'); },
    async changePassword(current, next) { return req('/auth/password', { method: 'PUT', auth: true, body: JSON.stringify({ current, next }) }); },
    pull, pullAdmin,
  };
  wrapMutations();
  /* silent initial sync (public data); admin pages call pullAdmin() after login */
  if (BASE) pull().catch(() => { online = false; });
})();
