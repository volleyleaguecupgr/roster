/* Shared runtime for every graphic.  URL params:
 *  league=hvl|cup|supercup|<compId>  team=<name|id>  mode=auto|live|last|next  mid=<matchId>
 *  api=<worker url>  refresh=<sec>  bg=1 (preview background)  debug=1  noanim=1  demo=1
 *  lang=el (Greek labels)
 */
(function () {
  const P = new URLSearchParams(location.search);
  const CFG = window.HVL_CONFIG || {};
  const get = (k, d) => (P.has(k) ? P.get(k) : d);

  // Theme: novi (default) | cev.  Loaded synchronously so there is no flash of the other style.
  const THEME = get('theme', CFG.theme || 'novi');
  if (THEME && THEME !== 'cev') {
    document.documentElement.classList.add(THEME);
    const src = (document.currentScript && document.currentScript.src) || '';
    document.write(`<link rel="stylesheet" href="${src.replace(/js\/core\.js.*$/, `css/${THEME}.css`)}">`);
  }
  if (!window.HVL_TEAMS_EL) {
    const src = (document.currentScript && document.currentScript.src) || '';
    document.write(`<script src="${src.replace(/core\.js.*$/, 'teams-el.js')}"><\/script>`);
  }

  const HVL = (window.HVL = {
    P, get,
    api: (get('api', CFG.api || '') || '').replace(/\/$/, ''),
    league: get('league', CFG.league || 'hvl'),
    team: get('team', CFG.team || ''),
    mode: get('mode', 'auto'),
    mid: get('mid', ''),
    comp: get('comp', ''),
    lang: get('lang', CFG.lang || 'el'),
    demo: get('demo') === '1' || !(get('api', CFG.api || '')),
  });

  document.documentElement.lang = HVL.lang === 'el' ? 'el' : 'en';   // Greek uppercase without accents
  document.addEventListener('DOMContentLoaded', () => {
    if (get('bg') === '1') document.body.classList.add('bg');
    if (get('dim') === '1') document.body.classList.add('dim');
    if (get('debug') === '1') document.body.classList.add('debug');
    if (get('noanim') === '1') document.body.classList.add('noanim');
    // novi: full-frame background behind full-screen cards (?full=0 keeps them transparent over video)
    // only the game announcement (next-match) is full-frame by default; other cards use the artwork as their panel
    if (get('bgimg')) document.getElementById('stage')?.style.setProperty('--nv-card-img', `url("${get('bgimg').replace(/"/g, '')}")`);
    const fullDefault = /next-match/.test(location.pathname) ? '1' : '0';
    if (THEME === 'novi' && document.getElementById('box') && get('full', fullDefault) === '1') {
      document.body.classList.add('fullbg');
      const bg = document.createElement('div');
      bg.className = 'nv-bg';
      if (get('bgimg')) bg.style.backgroundImage = `url("${get('bgimg').replace(/"/g, '')}")`;
      document.getElementById('stage').prepend(bg);
    }
    fit();
    if (!document.getElementById('msg')) document.body.insertAdjacentHTML('beforeend', '<div id="msg"></div>');
  });
  window.addEventListener('resize', fit);
  function fit() {
    const s = document.getElementById('stage');
    if (!s) return;
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    s.style.transform = `scale(${k})`;
  }

  /* ---------- i18n ---------- */
  const L = {
    en: { results: 'Results', schedule: 'Schedule', kill: 'KILL', attS: 'ATT', blkS: 'BLK', aceS: 'ACE', cm: 'CM', born: 'BORN', referees: 'Referees', stats: 'Statistics', set: 'Set', after: 'after', final: 'Final result', live: 'Live', next: 'Next match', roster: 'Roster', coach: 'Head coach', standings: 'Standings', top: 'Top scorers', att: 'Winner attacks', blk: 'Blocks', ace: 'Aces', opp: 'Opponent errors', pts: 'Pts', vs: 'vs', match: 'Match', leaders: 'Season leaders', played: 'P', won: 'W', lost: 'L', sets: 'Sets', points: 'Points', srvErr: 'Serve errors', attPct: 'Attack %' },
    el: { results: 'Αποτελέσματα', schedule: 'Πρόγραμμα', kill: 'ΕΠΙΘ.%', attS: 'ΕΠΙΘ', blkS: 'ΜΠΛΟΚ', aceS: 'ΑΣΣ', cm: 'ΕΚ', born: 'ΓΕΝ.', referees: 'Διαιτητές', stats: 'Στατιστικά', set: 'Σετ', after: 'μετά το', final: 'Τελικό αποτέλεσμα', live: 'Ζωντανά', next: 'Επόμενος αγώνας', roster: 'Ρόστερ', coach: 'Προπονητής', standings: 'Βαθμολογία', top: 'Κορυφαίοι σκόρερ', att: 'Πόντοι επίθεσης', blk: 'Μπλοκ', ace: 'Άσσοι', opp: 'Λάθη αντιπάλου', pts: 'Πόντ.', vs: 'vs', match: 'Αγώνας', leaders: 'Κορυφαίοι σεζόν', played: 'Α', won: 'Ν', lost: 'Η', sets: 'Σετ', points: 'Πόντοι', srvErr: 'Λάθη σερβίς', attPct: 'Επίθεση %' },
  };
  HVL.t = (k) => (L[HVL.lang] || L.en)[k] || L.en[k] || k;
  HVL.ord = (n) => {
    if (HVL.lang === 'el') return `${n}<span class="ord">ο</span>`;
    const v = n % 100, sfx = ['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th';
    return `${n}<span class="ord">${sfx}</span>`;
  };

  /* ---------- DOM helpers ---------- */
  HVL.$ = (s, r = document) => r.querySelector(s);
  HVL.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // team code (aris, paok, kifisia…) → local logo site/logos/<code>.png, HVL logo as fallback
  const SLUGS = [['aris', /ΑΡΗΣ|ARIS/], ['rethimno', /ΡΕΘΥΜΝ|RETHIMN/], ['floisvos', /ΦΛΟΙΣΒ|FLOISV/], ['foinikas', /ΦΟΙΝΙΚ|FOINIK/], ['kalamata', /ΚΑΛΑΜΑΤ|KALAMAT/],
    ['kifisia', /ΚΗΦΙΣ|KIFIS/], ['milon', /ΜΙΛΩΝ|MILON/], ['olympiakos', /ΟΛΥΜΠΙΑΚ|OLYMPIA/], ['panathinaikos', /ΠΑΝΑΘΗΝ|PANATHIN/], ['panionios', /ΠΑΝΙΩΝ|PANIONI/], ['paok', /^ΠΑΟΚ|^PAOK/], ['ofi', /^ΟΦΗ|^OFI/]];
  const ukey = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9Α-Ω]/g, '');
  HVL.slug = (t) => { if (t?.slug) return t.slug; for (const n of [t?.orig, t?.name, t?.short]) { const k = ukey(n); const f = k && SLUGS.find(([, re]) => re.test(k)); if (f) return f[0]; } return ''; };
  HVL.root = (() => { try { return new URL('../', document.currentScript.src).href; } catch { return '../'; } })();
  HVL.logo = (team, cls = '') => {
    if (!team) return `<div class="logo fallback ${cls}">?</div>`;
    const init = HVL.esc((team.code || team.short || team.name || '?').slice(0, 4));
    const sl = HVL.slug(team), local = sl ? `${HVL.root}logos/${sl}.png` : '', remote = team.logo || '';
    const src = local || remote;
    if (!src) return `<div class="logo fallback ${cls}">${init}</div>`;
    return `<div class="logo ${cls}" data-init="${init}"><img src="${HVL.esc(src)}" data-alt="${HVL.esc(local ? remote : '')}" alt="" onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.dataset.alt=''}else{this.parentNode.classList.add('fallback');this.parentNode.textContent=this.parentNode.dataset.init}"></div>`;
  };
  HVL.photo = (p, cls = 'photo') => {
    const init = HVL.esc(((p?.last || p?.name || '?')[0] || '?') + (p?.first?.[0] || ''));
    if (!p?.photo) return `<div class="${cls} nophoto">${init}</div>`;
    return `<div class="${cls}" data-init="${init}"><img src="${HVL.esc(p.photo)}" alt="" onerror="this.parentNode.classList.add('nophoto');this.parentNode.textContent=this.parentNode.dataset.init"></div>`;
  };
  HVL.teamName = (t) => t?.name || t?.short || '';   // always the full (mapped) name
  HVL.dateLong = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const f = (o) => new Intl.DateTimeFormat(HVL.lang === 'el' ? 'el-GR' : 'en-GB', { timeZone: 'Europe/Athens', ...o }).format(d);
    return { date: f({ day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'), time: f({ hour: '2-digit', minute: '2-digit', hour12: false }), weekday: f({ weekday: 'long' }) };
  };
  HVL.msg = (s) => { const m = document.getElementById('msg'); if (m) { m.textContent = s || ''; m.style.display = s ? '' : 'none'; } };
  /** Shrink text until it fits its box: <div class="name fit"> */
  HVL.fit = (root = document) => {
    root.querySelectorAll('.fit').forEach((el) => {
      el.style.fontSize = '';
      let fs = parseFloat(getComputedStyle(el).fontSize);
      const min = fs * 0.36;
      while ((el.scrollWidth > el.clientWidth + 1) && fs > min) { fs -= 1; el.style.fontSize = fs + 'px'; }
    });
    // .uni: every team name in the same graphic gets the same (smallest needed) size – one line, no overlap
    const uni = [...root.querySelectorAll('.fit.uni')];
    if (uni.length > 1) {
      const m = Math.min(...uni.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      uni.forEach((e) => { e.style.fontSize = m + 'px'; });
    }
  };
  /** Count numbers up from 0 on first appearance */
  HVL.countUp = (root) => {
    if (document.body.classList.contains('noanim')) return;
    root.querySelectorAll('.val, .pts, .big b, .chip b, .v b').forEach((el) => {
      const m = el.textContent.trim().match(/^(\d+)(%?)$/);
      if (!m || +m[1] < 2) return;
      const to = +m[1], sfx = m[2], dur = 750, t0 = performance.now() + 280;
      el.textContent = '0' + sfx;
      const step = (t) => {
        const k = Math.min(1, Math.max(0, (t - t0) / dur));
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + sfx;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  /** Slanted bars sweeping across an element (novi theme entry motion) */
  const BAR_W = [6, 34, 10, 120, 6, 190, 10, 70, 6, 14];
  HVL.sweep = (el, { dur = .85, gap = 46 } = {}) => {
    if (!el || document.body.classList.contains('noanim')) return;
    el.querySelector(':scope > .nv-bars')?.remove();
    const w = el.offsetWidth + 300;
    const wrap = document.createElement('div');
    wrap.className = 'nv-bars';
    wrap.style.inset = getComputedStyle(el).position === 'static' ? '0' : '-40px -120px';
    let x = 0;
    wrap.innerHTML = BAR_W.map((bw, i) => {
      const off = x; x += bw + gap;
      return `<i style="left:0;width:${bw}px;--from:${-off - bw - 60}px;--to:${w + 400 - off}px;--d:${(i * 0.025).toFixed(3)}s;--t:${dur}s"></i>`;
    }).join('');
    el.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('go'));
    setTimeout(() => wrap.remove(), (dur + BAR_W.length * 0.025 + .2) * 1000);
  };
  /** keep a centred card (#box: left 50% + translateX(-50%)) inside 1920×1080: shrink it from the top centre when it is too tall or too wide */
  HVL.fitScreen = (el, margin = 36) => {
    if (!el || el.id !== 'box') return;
    el.style.transform = ''; el.style.transformOrigin = '';
    const top = el.offsetTop, h = el.scrollHeight, w = el.offsetWidth;
    const k = Math.min(1, (1080 - margin - Math.max(0, top)) / Math.max(1, h), (1920 - 2 * margin) / Math.max(1, w));
    if (k < 0.999) { el.style.transformOrigin = '50% 0'; el.style.transform = `translateX(-50%) scale(${k.toFixed(4)})`; }
  };
  HVL.animate = (el, first = true) => {
    if (!el) return;
    HVL.fit(el); HVL.fitScreen(el);
    if (document.fonts?.ready) document.fonts.ready.then(() => { HVL.fit(el); HVL.fitScreen(el); });
    el.querySelectorAll('img').forEach((im) => { if (!im.complete) im.addEventListener('load', () => HVL.fitScreen(el), { once: true }); });
    if (first) HVL.countUp(el);
    // slanted-bar sweep only on final score + team stats (or ?sweep=1); every other card slides in like the referees boxes
    if (first && THEME === 'novi' && el.id === 'box' && (get('sweep') === '1' || (get('sweep') !== '0' && /\/(result|stats)\.html/.test(location.pathname)))) HVL.sweep(el);
    el.classList.add('anim');
    if (!first) { el.classList.add('settled'); return; }
    el.classList.remove('in', 'settled');
    void el.offsetWidth;
    el.classList.add('in');
  };

  /* ---------- data ---------- */
  HVL.url = (path, extra = {}) => {
    const q = new URLSearchParams({ ...(HVL.team ? { team: HVL.team } : {}), ...(HVL.comp ? { comp: HVL.comp } : {}), ...extra });
    return `${HVL.api}/api/${encodeURIComponent(HVL.league)}/${path}?${q}`;
  };
  /* ---------- localisation: Greek team names (js/teams-el.js), NOVIBET competition names, Greek rounds/roles ---------- */
  const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9Α-Ω]/g, '').replace(/C(?!H)/g, 'K').replace(/Y/g, 'I').replace(/(.)\1/g, '$1');
  let TMAP = null;
  const tmap = () => {
    if (TMAP) return TMAP;
    TMAP = {};
    for (const [k, v] of Object.entries(window.HVL_TEAMS_EL || {})) TMAP[/^\d+$/.test(k) ? k : fold(k)] = typeof v === 'string' ? v : v.name;
    return TMAP;
  };
  HVL.teamEl = (t) => { const m = tmap(); return m[String(t?.id ?? t?.teamId)] || m[fold(t?.name)] || m[fold(t?.short)] || null; };
  HVL.compName = (n) => { n = String(n || '').trim(); return !n || /^NOVIBET\b/i.test(n) ? n : 'NOVIBET ' + n; };
  const ROUND_EL = [[/^(?:match ?day|game ?day|round|giornata|αγωνιστική)\s*#?\s*(\d+)$/i, (m) => `${m[1]}η Αγωνιστική`], [/^final\s*#?\s*(\d+)$/i, (m) => `Τελικός #${m[1]}`],
    [/^semi ?final\s*#?\s*(\d+)$/i, (m) => `Ημιτελικός #${m[1]}`], [/^quarter ?final\s*#?\s*(\d+)$/i, (m) => `Προημιτελικός #${m[1]}`], [/^(?:match\s*)?#\s*(\d+)$/i, (m) => `Αγώνας #${m[1]}`]];
  HVL.roundName = (r) => { if (HVL.lang !== 'el' || !r) return r; for (const [re, f] of ROUND_EL) { const m = String(r).trim().match(re); if (m) return f(m); } return r; };
  const POS_EL = { S: 'Πασαδόρος', OP: 'Διαγώνιος', OH: 'Ακραίος', MB: 'Κεντρικός', L: 'Λίμπερο', U: 'Universal' };
  const ROLE_EL = [[/head coach/i, 'Προπονητής'], [/assistant/i, 'Βοηθός προπονητή'], [/scout/i, 'Scoutman'], [/manager/i, 'Team manager'], [/physio/i, 'Φυσικοθεραπευτής'], [/doctor/i, 'Γιατρός']];
  HVL.localize = (data) => {
    const el = HVL.lang === 'el';
    const walk = (o, pk) => {
      if (Array.isArray(o)) { o.forEach((x) => walk(x, pk)); return; }
      if (!o || typeof o !== 'object') return;
      if (typeof o.name === 'string' && ('short' in o || 'teamId' in o && 'rankPts' in o)) {          // a team / standings row
        const g = HVL.teamEl(o);
        if (g) { o.hvlName = o.name; o.name = g; }
        o.short = o.name;                                                                         // full names everywhere
      }
      if (pk === 'league' && typeof o.name === 'string') o.name = HVL.compName(o.name);
      if (typeof o.comp === 'string') o.comp = HVL.compName(o.comp);
      if (typeof o.round === 'string') o.round = HVL.roundName(o.round);
      if (pk === 'round' && typeof o.label === 'string') o.label = HVL.roundName(o.label);
      if (el && pk === 'position' && o.code && POS_EL[o.code]) o.label = POS_EL[o.code];
      if (el && pk === 'leaders' && typeof o.title === 'string') {
        const T = [[/scorer.*sets/i, 'Σκόρερ (πόντοι/σετ)'], [/scorer/i, 'Κορυφαίοι σκόρερ'], [/server.*sets/i, 'Άσσοι (ανά σετ)'], [/server/i, 'Κορυφαίοι στο σερβίς'],
          [/blocker.*sets/i, 'Μπλοκ (ανά σετ)'], [/blocker/i, 'Κορυφαίοι στο μπλοκ'], [/reception/i, 'Υποδοχή – θετική %'], [/attack/i, 'Επίθεση – επιτυχία %']];
        const t = T.find(([re]) => re.test(o.title)); if (t) o.title = t[1];
      }
      if (el && typeof o.role === 'string') { const r = ROLE_EL.find(([re]) => re.test(o.role)); if (r) o.role = r[1]; }
      for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object') walk(v, k);
    };
    walk(data, '');
    return data;
  };
  HVL.load = async (path = 'match', extra = {}) => {
    if (HVL.demo) return HVL.localize(JSON.parse(JSON.stringify(HVL.DEMO(path, extra))));
    const q = { ...(path === 'match' ? { mode: HVL.mode, ...(HVL.mid ? { mid: HVL.mid } : {}) } : {}), ...extra };
    const r = await fetch(HVL.url(path, q), { cache: 'no-store' });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || r.status);
    return HVL.localize(j);
  };
  /** Poll `path` every `sec` seconds; call render(data, first). Re-renders only when data changed. */
  HVL.poll = (path, sec, render, extra) => {
    let last = '', first = true;
    const every = +get('refresh', sec) * 1000;
    const tick = async () => {
      try {
        const d = await HVL.load(path, typeof extra === 'function' ? extra() : extra);
        const sig = JSON.stringify(d, (k, v) => (k === 'updated' ? undefined : v));
        if (sig !== last) { last = sig; render(d, first); first = false; }
        HVL.msg('');
      } catch (e) { HVL.msg('⚠ ' + e.message); }
      if (get('once') !== '1') setTimeout(tick, every);
    };
    tick();
  };

  /** Manual operator overrides (control.html) applied on top of scraped data */
  HVL.scoreState = (d) => {
    const m = d.match || {};
    const man = d.state?.score;
    if (man && man.manual) {
      return { manual: true, setsH: +man.setsH || 0, setsA: +man.setsA || 0, h: +man.h || 0, a: +man.a || 0, set: (+man.setsH || 0) + (+man.setsA || 0) + 1, serve: man.serve || null, sets: man.sets || m.sets || [] };
    }
    const cur = m.current || { set: (m.sets?.length || 0) + 1, h: 0, a: 0 };
    return { manual: false, setsH: m.setsHome || 0, setsA: m.setsAway || 0, h: cur.h, a: cur.a, set: cur.set, serve: d.state?.score?.serve || null, sets: m.sets || [] };
  };

  /** Which side is the "selected" team (for single-team graphics). ?side=home|away overrides. */
  HVL.side = (d) => {
    const s = get('side');
    if (s === 'home' || s === 'away') return s;
    const mine = d.focusTeam && d.away?.id === d.focusTeam ? 'away' : 'home';
    return get('opp') === '1' ? (mine === 'home' ? 'away' : 'home') : mine;   // ?opp=1 → the opponent of ?team
  };

  /* ---------- demo data (used when no API is configured or ?demo=1) ---------- */
  const IMG = 'https://images.dataproject.com/hvl';
  const mkP = (team, id, number, last, first, pos, h, b, st) => ({
    playerId: id, number, name: `${last} ${first}`, last, first, position: pos, height: h, born: b,
    photo: `${IMG}/TeamPlayer/400/500/TeamPlayer_${team}_${id}.jpg`, stats: st ? { pts: st[0], att: st[1], blk: st[2], ace: st[3], attTot: st[4], attErr: 2, srvErr: 2, srvTot: 14, recTot: 10, recErr: 1, played: true } : null,
  });
  const P5 = (c, l) => ({ code: c, label: l });
  const S = P5('S', 'Setter'), OP = P5('OP', 'Opposite'), OH = P5('OH', 'Outside hitter'), MB = P5('MB', 'Middle blocker'), LI = P5('L', 'Libero');
  HVL.DEMO = (path, extra = {}) => {
    const home = { id: 205, name: 'AOP KIFISIAS', short: 'KIFISIAS', code: 'KIF', logo: `${IMG}/TeamLogo/200/200/TeamLogo_205.jpg` };
    const away = { id: 201, name: 'PANATHINAIKOS A.O.', short: 'PANATHINAIKOS', code: 'PAO', logo: `${IMG}/TeamLogo/200/200/TeamLogo_201.jpg` };
    home.players = [
      mkP(205, 4928, 1, 'KOTSAKIS', 'Frixos', OH, 195, 2001, [11, 9, 1, 1, 24]),
      mkP(205, 5271, 2, 'MPARNTAKTZIAN', 'Grigoris', S, 194, 2002, [2, 0, 1, 1, 2]),
      mkP(205, 5471, 4, 'KONIDIS', 'Vassilis', OH, 193, 2004, [8, 6, 1, 1, 19]),
      mkP(205, 5537, 5, 'BANNOV', 'Evgeniy', OP, 208, 1994, [19, 16, 2, 1, 33]),
      mkP(205, 5600, 9, 'PAPADOPOULOS', 'Nikos', MB, 203, 1999, [7, 4, 3, 0, 7]),
      mkP(205, 5601, 12, 'GEORGIOU', 'Alexis', MB, 201, 2000, [5, 3, 2, 0, 6]),
      mkP(205, 5602, 7, 'DIMITRIOU', 'Kostas', LI, 182, 1997, [0, 0, 0, 0, 0]),
      mkP(205, 5603, 14, 'NIKOLAOU', 'Petros', OH, 196, 2003, null),
    ];
    away.players = [
      mkP(201, 5545, 3, 'RANGEL', 'Lucas', MB, 205, 1990, [9, 5, 4, 0, 8]),
      mkP(201, 5546, 6, 'STEFANOU', 'Giorgos', OH, 194, 1996, [14, 12, 1, 1, 28]),
      mkP(201, 5547, 8, 'FROMM', 'Christian', OP, 200, 1990, [21, 18, 1, 2, 36]),
      mkP(201, 5548, 10, 'PROTOPSALTIS', 'Charalampos', S, 192, 1996, [3, 1, 1, 1, 3]),
      mkP(201, 5549, 11, 'TZIOUMAKAS', 'Giorgos', MB, 204, 1993, [8, 5, 3, 0, 9]),
      mkP(201, 5550, 15, 'MOUCHLIAS', 'Dimitris', OH, 198, 1997, [10, 8, 0, 2, 22]),
      mkP(201, 5551, 1, 'ANDREOPOULOS', 'Menelaos', LI, 183, 1995, [0, 0, 0, 0, 0]),
    ];
    // starting zones (set 1) + libero
    const z = (team, nums) => team.players.forEach((p) => { const i = nums.indexOf(p.number); p.zones = [i >= 0 ? String(i + 1) : '', '', '', '', '']; p.starter = i >= 0; if (p.position?.code === 'L') p.libero = true; });
    z(home, [2, 4, 9, 5, 1, 12]); z(away, [10, 6, 11, 8, 15, 3]);
    const cph = (team, id) => `${IMG}/TeamCoach/400/500/TeamCoach_${team}_${id}.jpg`;
    home.staff = [{ id: 1, name: 'ZALMAS Nikos', role: 'Head Coach', photo: cph(205, 1) }, { id: 2, name: 'KRETSIS Nikos', role: 'Assistant Coach', photo: cph(205, 2) }];
    away.staff = [{ id: 3, name: 'ANDREOPOULOS Kostas', role: 'Head Coach', photo: cph(201, 3) }, { id: 4, name: 'TSIAKIRIS Giorgos', role: 'Assistant Coach', photo: cph(201, 4) }];
    const F = (arr) => arr.map(([w, sc, oc]) => ({ win: w, score: sc, opp: { short: oc, code: oc.slice(0, 3) } }));
    home.form = F([[1, '3-1', 'OFI'], [0, '1-3', 'PAOK'], [1, '3-2', 'MILON'], [0, '0-3', 'OLYMPIAKOS'], [1, '3-0', 'IRAKLIS']]);
    away.form = F([[1, '3-0', 'PAOK'], [1, '3-1', 'OLYMPIAKOS'], [1, '3-0', 'FLOISVOS'], [0, '2-3', 'MILON'], [1, '3-1', 'OFI']]);
    home.coach = { name: 'ZALMAS Nikos', role: 'Head Coach' };
    away.coach = { name: 'ANDREOPOULOS Kostas', role: 'Head Coach' };
    home.totals = { points: 95, att: 38, blk: 10, ace: 4, oppErrors: 21, srvErr: 14, attPct: 45, attTot: 84, hasBox: true };
    away.totals = { points: 101, att: 49, blk: 13, ace: 6, oppErrors: 15, srvErr: 16, attPct: 52, attTot: 94, hasBox: true };
    const standings = [
      [201, 'PANATHINAIKOS A.O.', 'PANATHINAIKOS', 43, 18, 14, 4, 2.33], [210, 'AONS MILON', 'MILON', 42, 18, 15, 3, 2.3], [203, 'PAOK', 'PAOK', 36, 18, 14, 4, 1.57],
      [204, 'OLYMPIAKOS S.F.P.', 'OLYMPIAKOS', 34, 18, 11, 7, 1.4], [205, 'AOP KIFISIAS', 'KIFISIAS', 27, 18, 9, 9, 1.02], [206, 'O.F.I.', 'OFI', 22, 18, 8, 10, .85],
      [207, 'AO KALAMATA 80', "KALAMATA '80", 20, 18, 7, 11, .77], [208, 'AO FLOISVOS', 'FLOISVOS', 15, 18, 5, 13, .6], [202, 'A.O. FOINIKAS SIROU', 'FOINIKAS SIROU', 11, 18, 3, 15, .4], [209, 'AS ARIS', 'ARIS', 10, 18, 4, 14, .38], [211, 'NOPE RETHIMNOU', 'RETHIMNOU', 8, 18, 3, 15, .33], [212, 'PANIONIOS G.S.S.', 'PANIONIOS', 6, 18, 2, 16, .25],
    ].map(([id, name, short, rankPts, played, won, lost, setRatio], i) => ({ rank: i + 1, teamId: id, name, short, code: short.slice(0, 3), logo: `${IMG}/TeamLogo/200/200/TeamLogo_${id}.jpg`, rankPts, played, won, lost, setRatio, setsW: won * 3, setsL: lost * 3 }));
    home.standing = standings[4]; away.standing = standings[0];
    const st = HVL.get('status', 'live');
    const sets = st === 'upcoming' ? [] : [{ h: 25, a: 22 }, { h: 21, a: 25 }, { h: 23, a: 25 }, ...(st === 'finished' ? [{ h: 26, a: 29 }] : [{ h: 16, a: 14 }])];
    const d = {
      league: { key: 'hvl', id: 51, name: 'VOLLEY LEAGUE 2025-26', logo: `${IMG}/CompetitionLogo/200/200/CompetitionLogo_51.png` },
      focusTeam: 205,
      match: {
        mid: 1, status: st, date: '18/10/2026', time: '18:00', iso: '2026-10-18T15:00:00Z', venue: 'Kleisto Gymnastirio Kifisias', round: 'Game Day 2', phase: 'Regular season',
        referees: ['PAPADOPOULOS Nikos', 'GEORGIOU Kostas'],
        setStats: sets.map((x, i) => ({ h: { att: 12 + i, blk: 2 + (i % 2), ace: 1, attTot: 26, srvErr: 3 }, a: { att: 11 + (i % 3), blk: 3, ace: i % 2 ? 2 : 0, attTot: 27, srvErr: 4 } })),
        sets, setsHome: 1, setsAway: st === 'finished' ? 3 : 2, current: st === 'live' ? { set: 4, h: 16, a: 14 } : null,
      },
      home, away, standings, state: {},
    };
    if (path === 'standings') return { league: d.league, standings };
    if (path === 'leaders') return {
      league: d.league, leaders: [
        { title: 'best scorer (points)', players: [away.players[2], home.players[3], away.players[1], away.players[5], home.players[0]].map((p, i) => ({ ...p, name: `${p.first} ${p.last}`, teamId: i % 2 ? 205 : 201, value: [281, 276, 251, 243, 234][i] })) },
        { title: 'best server (aces)', players: [home.players[3], away.players[2], away.players[5]].map((p, i) => ({ ...p, name: `${p.first} ${p.last}`, teamId: 201, value: [30, 28, 26][i] })) },
      ],
    };
    if (path === 'state') return {};
    if (path === 'round') {
      const T = Object.fromEntries(standings.map((r) => [r.short, { id: r.teamId, name: r.name, short: r.short, code: r.code, logo: r.logo }]));
      const prev = /prev|last/.test(extra.which || HVL.get('which', 'current'));
      const games = [['PAOK', 'OFI', 3, 0], ['OLYMPIAKOS', 'MILON', 3, 2], ['KIFISIAS', 'PANATHINAIKOS', 1, 3], ['FLOISVOS', "KALAMATA '80", 1, 3], ['IRAKLIS', 'FOINIKAS SIROU', 2, 3]];
      const days = ['17/10/2026', '17/10/2026', '18/10/2026', '18/10/2026', '19/10/2026'], hrs = ['17:00', '19:30', '18:00', '18:00', '20:00'];
      return { league: d.league, round: { label: prev ? 'Game Day 1' : 'Game Day 2', phase: 'Regular season', matches: games.map(([h, a, sh, sa], i) => {
        const [dd, mm, yy] = days[i].split('/');
        return { mid: 10 + i, date: days[i], time: hrs[i], iso: `${yy}-${mm}-${dd}T${hrs[i]}:00+03:00`, venue: 'Hall', home: T[h], away: T[a], status: prev ? 'finished' : i < 2 ? 'finished' : i === 2 ? 'live' : 'upcoming', setsHome: prev || i < 3 ? sh : 0, setsAway: prev || i < 3 ? sa : 0, partials: [] };
      }) } };
    }
    if (path === 'h2h') {
      const ms = [['VOLLEY LEAGUE 2025-26', '07/03/2026', 1, 3, 1], ['LEAGUE CUP 2025-26', '14/01/2026', 3, 2, 0], ['VOLLEY LEAGUE 2025-26', '22/11/2025', 0, 3, 0], ['VOLLEY LEAGUE 2024-25', '15/03/2025', 2, 3, 1], ['VOLLEY LEAGUE 2024-25', '30/11/2024', 3, 1, 0], ['SUPER CUP 2024', '05/10/2024', 0, 3, 1]];
      const meetings = ms.map(([comp, date, a, b, aHome]) => ({ comp, date, iso: date.split('/').reverse().join('-'), setsA: a, setsB: b, aHome: !!aHome }));
      const winsA = meetings.filter((m) => m.setsA > m.setsB).length;
      return { league: d.league, a: { ...home, players: undefined }, b: { ...away, players: undefined }, total: 14, winsA: 5, winsB: 9, setsA: 24, setsB: 33, meetings };
    }
    return d;
  };
})();
