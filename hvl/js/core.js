/* Shared runtime for every graphic.  URL params:
 *  league=hvl|cup|supercup|<compId>  team=<name|id>  mode=auto|live|last|next  mid=<matchId>
 *  api=<worker url>  refresh=<sec>  bg=1 (preview background)  debug=1  noanim=1  demo=1
 *  lang=el (Greek labels)
 */
(function () {
  const P = new URLSearchParams(location.search);
  const CFG = window.HVL_CONFIG || {};
  const get = (k, d) => (P.has(k) ? P.get(k) : d);

  const HVL = (window.HVL = {
    P, get,
    api: (get('api', CFG.api || '') || '').replace(/\/$/, ''),
    league: get('league', CFG.league || 'hvl'),
    team: get('team', CFG.team || ''),
    mode: get('mode', 'auto'),
    mid: get('mid', ''),
    comp: get('comp', ''),
    lang: get('lang', CFG.lang || 'en'),
    demo: get('demo') === '1' || !(get('api', CFG.api || '')),
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (get('bg') === '1') document.body.classList.add('bg');
    if (get('dim') === '1') document.body.classList.add('dim');
    if (get('debug') === '1') document.body.classList.add('debug');
    if (get('noanim') === '1') document.body.classList.add('noanim');
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
    en: { stats: 'Statistics', set: 'Set', after: 'after', final: 'Final result', live: 'Live', next: 'Next match', roster: 'Roster', coach: 'Head coach', standings: 'Standings', top: 'Top scorers', att: 'Winner attacks', blk: 'Blocks', ace: 'Aces', opp: 'Opponent errors', pts: 'Pts', vs: 'vs', match: 'Match', leaders: 'Season leaders', played: 'P', won: 'W', lost: 'L', sets: 'Sets', points: 'Points', srvErr: 'Serve errors', attPct: 'Attack %' },
    el: { stats: 'Στατιστικά', set: 'Σετ', after: 'μετά το', final: 'Τελικό αποτέλεσμα', live: 'Ζωντανά', next: 'Επόμενος αγώνας', roster: 'Ρόστερ', coach: 'Προπονητής', standings: 'Βαθμολογία', top: 'Κορυφαίοι σκόρερ', att: 'Πόντοι επίθεσης', blk: 'Μπλοκ', ace: 'Άσσοι', opp: 'Λάθη αντιπάλου', pts: 'Πόντ.', vs: 'vs', match: 'Αγώνας', leaders: 'Κορυφαίοι σεζόν', played: 'Α', won: 'Ν', lost: 'Η', sets: 'Σετ', points: 'Πόντοι', srvErr: 'Λάθη σερβίς', attPct: 'Επίθεση %' },
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
  HVL.logo = (team, cls = '') => {
    if (!team) return `<div class="logo fallback ${cls}">?</div>`;
    const init = HVL.esc((team.code || team.short || team.name || '?').slice(0, 4));
    return `<div class="logo ${cls}" data-init="${init}"><img src="${HVL.esc(team.logo)}" alt="" onerror="this.parentNode.classList.add('fallback');this.parentNode.textContent=this.parentNode.dataset.init"></div>`;
  };
  HVL.photo = (p, cls = 'photo') => {
    const init = HVL.esc(((p?.last || p?.name || '?')[0] || '?') + (p?.first?.[0] || ''));
    if (!p?.photo) return `<div class="${cls} nophoto">${init}</div>`;
    return `<div class="${cls}" data-init="${init}"><img src="${HVL.esc(p.photo)}" alt="" onerror="this.parentNode.classList.add('nophoto');this.parentNode.textContent=this.parentNode.dataset.init"></div>`;
  };
  HVL.teamName = (t, long) => (long ? t?.name : t?.short || t?.name) || '';
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
      const min = fs * 0.5;
      while ((el.scrollWidth > el.clientWidth + 1) && fs > min) { fs -= 1; el.style.fontSize = fs + 'px'; }
    });
  };
  /** Animate pills in on first render; later data updates swap content without replaying. */
  HVL.animate = (el, first = true) => {
    if (!el) return;
    HVL.fit(el);
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
  HVL.load = async (path = 'match', extra = {}) => {
    if (HVL.demo) return HVL.DEMO(path);
    const q = { ...(path === 'match' ? { mode: HVL.mode, ...(HVL.mid ? { mid: HVL.mid } : {}) } : {}), ...extra };
    const r = await fetch(HVL.url(path, q), { cache: 'no-store' });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || r.status);
    return j;
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
      setTimeout(tick, every);
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
    if (d.focusTeam && d.away?.id === d.focusTeam) return 'away';
    return 'home';
  };

  /* ---------- demo data (used when no API is configured or ?demo=1) ---------- */
  const IMG = 'https://images.dataproject.com/hvl';
  const mkP = (team, id, number, last, first, pos, h, b, st) => ({
    playerId: id, number, name: `${last} ${first}`, last, first, position: pos, height: h, born: b,
    photo: `${IMG}/TeamPlayer/400/500/TeamPlayer_${team}_${id}.jpg`, stats: st ? { pts: st[0], att: st[1], blk: st[2], ace: st[3], attTot: st[4], attErr: 2, srvErr: 2, srvTot: 14, recTot: 10, recErr: 1, played: true } : null,
  });
  const P5 = (c, l) => ({ code: c, label: l });
  const S = P5('S', 'Setter'), OP = P5('OP', 'Opposite'), OH = P5('OH', 'Outside hitter'), MB = P5('MB', 'Middle blocker'), LI = P5('L', 'Libero');
  HVL.DEMO = (path) => {
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
    home.coach = { name: 'ZALMAS Nikos', role: 'Head Coach' };
    away.coach = { name: 'ANDREOPOULOS Kostas', role: 'Head Coach' };
    home.totals = { points: 95, att: 38, blk: 10, ace: 4, oppErrors: 21, srvErr: 14, attPct: 45, attTot: 84, hasBox: true };
    away.totals = { points: 101, att: 49, blk: 13, ace: 6, oppErrors: 15, srvErr: 16, attPct: 52, attTot: 94, hasBox: true };
    const standings = [
      [201, 'PANATHINAIKOS A.O.', 'PANATHINAIKOS', 43, 18, 14, 4, 2.33], [210, 'AONS MILON', 'MILON', 42, 18, 15, 3, 2.3], [203, 'PAOK', 'PAOK', 36, 18, 14, 4, 1.57],
      [204, 'OLYMPIAKOS S.F.P.', 'OLYMPIAKOS', 34, 18, 11, 7, 1.4], [205, 'AOP KIFISIAS', 'KIFISIAS', 27, 18, 9, 9, 1.02], [206, 'O.F.I.', 'OFI', 22, 18, 8, 10, .85],
      [207, 'AO KALAMATA 80', "KALAMATA '80", 20, 18, 7, 11, .77], [208, 'AO FLOISVOS', 'FLOISVOS', 15, 18, 5, 13, .6], [202, 'A.O. FOINIKAS SIROU', 'FOINIKAS SIROU', 11, 18, 3, 15, .4], [209, 'IRAKLIS', 'IRAKLIS', 10, 18, 4, 14, .38],
    ].map(([id, name, short, rankPts, played, won, lost, setRatio], i) => ({ rank: i + 1, teamId: id, name, short, code: short.slice(0, 3), logo: `${IMG}/TeamLogo/200/200/TeamLogo_${id}.jpg`, rankPts, played, won, lost, setRatio, setsW: won * 3, setsL: lost * 3 }));
    home.standing = standings[4]; away.standing = standings[0];
    const st = HVL.get('status', 'live');
    const sets = st === 'upcoming' ? [] : [{ h: 25, a: 22 }, { h: 21, a: 25 }, { h: 23, a: 25 }, ...(st === 'finished' ? [{ h: 26, a: 29 }] : [{ h: 16, a: 14 }])];
    const d = {
      league: { key: 'hvl', id: 51, name: 'VOLLEY LEAGUE 2025-26', logo: `${IMG}/CompetitionLogo/200/200/CompetitionLogo_51.png` },
      focusTeam: 205,
      match: {
        mid: 1, status: st, date: '18/10/2026', time: '18:00', iso: '2026-10-18T15:00:00Z', venue: 'Kleisto Gymnastirio Kifisias', round: 'Game Day 2', phase: 'Regular season',
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
    return d;
  };
})();
