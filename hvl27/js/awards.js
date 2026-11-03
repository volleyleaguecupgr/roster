/* ΒΙΚΟΣ COLA MVP + NOVIBET DREAM TEAM: shared helpers.
   Data:   site/data/mvp.txt, site/data/dreamteam.txt  («Κλειδί: τιμή» lines, # = comment)
   Photos: site/photos/<όνομα παίκτη όπως στο αρχείο>.png  (also .webp / .jpg; spaces or _ ; any case) */
(function () {
  const AW = (window.AW = {});
  const plain = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  /** «Κλειδί: τιμή» lines → [{key (plain), raw key, value}] */
  AW.lines = (txt) => String(txt || '').replace(/^﻿/, '').split(/\r?\n/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf(':'); return i < 0 ? { key: '', raw: '', value: l } : { key: plain(l.slice(0, i)), raw: l.slice(0, i).trim(), value: l.slice(i + 1).trim() }; });

  AW.load = async (file) => {
    const r = await fetch(`${HVL.root}data/${file}?${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${r.status} data/${file}`);
    return r.text();
  };

  /** «2» → «2η ΑΓΩΝΙΣΤΙΚΗ»; any other text is shown as written */
  AW.gameday = (v) => { v = String(v || '').trim(); return /^\d+$/.test(v) ? `${v}η ΑΓΩΝΙΣΤΙΚΗ` : v.toUpperCase(); };

  /** «SPIRITO Luca» → { first:'Luca', last:'SPIRITO' }  (the all-caps words are the surname, Data Project style) */
  AW.split = (name) => {
    const w = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (w.length < 2) return { first: '', last: w[0] || '' };
    const caps = (x) => x === x.toUpperCase() && x !== x.toLowerCase();
    const last = w.filter(caps), first = w.filter((x) => !caps(x));
    if (last.length && first.length) return { first: first.join(' '), last: last.join(' ') };
    return { first: w.slice(0, -1).join(' '), last: w[w.length - 1] };
  };

  const KEYS = { gameday: ['αγωνιστικη', 'gameday', 'game day', 'αγων'], title: ['τιτλος', 'title'], player: ['παικτης', 'player', 'ονομα', 'name'],
    team: ['ομαδα', 'team'], stats: ['στατιστικα', 'stats'], photo: ['φωτογραφια', 'photo'], subtitle: ['υποτιτλος', 'subtitle'] };
  const keyOf = (k) => Object.keys(KEYS).find((n) => KEYS[n].includes(k)) || '';

  /** mvp.txt → { gameday, title, player, team, stats:[{n,l}], photo } */
  AW.parseMVP = (txt) => {
    const o = { stats: [] };
    for (const l of AW.lines(txt)) {
      const k = keyOf(l.key);
      if (k === 'stats') o.stats = l.value.split(/\s*[,·|•]\s*/).filter(Boolean).map((s) => { const m = s.match(/^(\d+[.,]?\d*%?)\s*(.*)$/); return m ? { n: m[1], l: m[2] } : { n: '', l: s }; });
      else if (k) o[k] = l.value;
    }
    return o;
  };

  /** Positions: key in the file (Greek or English) → role */
  const ROLES = {
    S: { el: 'ΠΑΣΑΔΟΡΟΣ', keys: ['s', 'setter', 'πασαδορος', 'πασαδορας', 'π'] },
    OH: { el: 'ΑΚΡΑΙΟΣ', keys: ['oh', 'outside', 'outside hitter', 'ακραιος', 'α'] },
    MB: { el: 'ΚΕΝΤΡΙΚΟΣ', keys: ['mb', 'middle', 'middle blocker', 'κεντρικος', 'κ'] },
    OP: { el: 'ΔΙΑΓΩΝΙΟΣ', keys: ['op', 'opposite', 'διαγωνιος', 'δ'] },
    L: { el: 'ΛΙΜΠΕΡΟ', keys: ['l', 'libero', 'λιμπερο', 'λ'] },
  };
  AW.roleLabel = (r) => ROLES[r]?.el || r;
  const roleOf = (k) => Object.keys(ROLES).find((r) => ROLES[r].keys.includes(k)) || '';

  /** dreamteam.txt → { gameday, title, players:[{role, name, team, photo}] }
   *  Player line:  ΘΕΣΗ: Όνομα | Ομάδα | φωτογραφία.png (optional) */
  AW.parseDream = (txt) => {
    const o = { players: [] };
    for (const l of AW.lines(txt)) {
      const role = roleOf(l.key);
      if (role) { const [name, team, photo] = l.value.split('|').map((x) => x.trim()); if (name) o.players.push({ role, name, team: team || '', photo: photo || '' }); continue; }
      const k = keyOf(l.key); if (k) o[k] = l.value;
    }
    return o;
  };

  /** <img> for a player photo from site/photos/: tries the name as written, with _ , lower/upper case, .png/.webp/.jpg;
   *  none found → the league logo (same as players without a photo elsewhere). */
  // ?photos=<folder or URL> another folder (default: site/photos/)
  /* Which file names to try for a player, most likely first: the name as written, then surname + name the other way round,
     then only the surname, only the first name (e.g. photos/Σπίριτο.png, photos/Luca.png) — each as written, with or without
     accents, in capitals / small letters, space or «_», .png/.jpg/.webp (+ «.png.png» typed twice on Windows). */
  AW.photoList = (name, explicit) => {
    let base = HVL.get('photos', '') || `${HVL.root}photos/`; if (!base.endsWith('/')) base += '/';
    const out = [], enc = (f) => base + encodeURIComponent(f);
    if (explicit) out.push(/^https?:/.test(explicit) ? explicit : enc(explicit));
    const n = String(name || '').trim().replace(/\s+/g, ' ');
    const sp = AW.split(n), words = n.split(' ').filter(Boolean);
    const forms = [n, [sp.last, sp.first].filter(Boolean).join(' '), [sp.first, sp.last].filter(Boolean).join(' '), sp.last, sp.first, ...words];
    const ext = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'webp', 'png.png', 'jpg.jpg', 'Png'];
    for (const f of [...new Set(forms.filter(Boolean))]) {
      const v = [];
      for (const x of [f, f.normalize('NFC'), f.normalize('NFD'), f.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC')])
        v.push(x, x.replace(/ /g, '_'), x.toLowerCase(), x.toUpperCase(), x.toLowerCase().replace(/ /g, '_'), x.toUpperCase().replace(/ /g, '_'), x[0] ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x);
      for (const x of [...new Set(v)].filter(Boolean)) for (const e of (f === n ? ext : ext.slice(0, 7))) out.push(enc(`${x}.${e}`));
    }
    return [...new Set(out)].slice(0, 400);   // never more than 400 tries per player
  };
  /** first file of the list that exists: asked for in parallel batches, the earliest one in the list wins */
  const FOUND = {};
  AW.find = (L) => {
    const key = L[0]; if (FOUND[key]) return FOUND[key];
    return (FOUND[key] = (async () => {
      const probe = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = u; });
      for (let i = 0; i < L.length; i += 30) {
        const part = L.slice(i, i + 30), ok = await Promise.all(part.map(probe)), k = ok.indexOf(true);
        if (k >= 0) return part[k];
      }
      return null;
    })());
  };
  let SEQ = 0;
  AW.photo = (name, explicit, cls = '') => {
    const L = AW.photoList(name, explicit), id = 'awp' + (++SEQ);
    AW.find(L).then((u) => {
      const img = document.getElementById(id); if (!img) return;
      if (u) { img.src = u; img.style.visibility = ''; return; }
      console.warn('[photos] not found:', decodeURIComponent(L[0]), '(also tried surname / first name only and other spellings)');
      img.onerror = () => { img.style.visibility = 'hidden'; }; img.classList.add('np'); img.src = HVL.noPhotoSrc(); img.style.visibility = '';
    });
    return `<img id="${id}" class="${cls}" alt="" style="visibility:hidden" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">`;
  };

  /** team logo from the team name written in the file (logos/<slug>.png) */
  AW.team = (name) => (name ? HVL.logo({ name, short: name }) : '');

  /** reload the file every ?refresh= s (30); redraw (with the entrance) only when its text changed.
   *  ?loop=N replays the entrance every N s. */
  AW.run = (file, draw) => {
    let last = null;
    const tick = async (force) => {
      let txt;
      try { txt = await AW.load(file); } catch (e) { if (last === null) draw(null, e); return; }
      if (txt !== last || force) { last = txt; draw(txt); }
    };
    tick();
    setInterval(() => tick(false), (+HVL.get('refresh', 30) || 30) * 1000);
    const loop = +HVL.get('loop', 0);
    if (loop > 0) setInterval(() => tick(true), loop * 1000);
  };
})();
