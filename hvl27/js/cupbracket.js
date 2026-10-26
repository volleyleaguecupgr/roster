/* League Cup bracket from data/cup.txt (structure, dates, courts, optional scores) – shared by posts.html and graphics/bracket.html.
   Scores missing in the file are taken from the Worker's League Cup games (same two teams), when given.
   CUPB.parse(text) → model · CUPB.scores(model, workerMatches) · CUPB.resolve(model) · CUPB.html(model, geometry, logo) */
(function () {
  const caps = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC').toUpperCase().replace(/\s+/g, ' ').trim();
  const key = (s) => caps(s).replace(/[^A-Z0-9Α-Ω]/g, '');
  const SC = /\s+(\d)\s*[-:–]\s*(\d)\s*$/;                    // optional score at the end of a line
  const team = (txt) => {
    const t = String(txt).trim(), q = t.match(/νικητ\S*\s+(\d+)\S*\s+προκρ/i);
    return q ? { ref: 'Q', n: +q[1] } : { name: caps(t), raw: t };
  };

  function parse(txt) {
    const M = { Q: [], QF: [], SF: [], F: { refs: ['A', 'B'], wins: 2, games: [] } };
    let sec = '';
    for (let l of String(txt || '').split(/\r?\n/)) {
      l = l.trim();
      if (!l || l.startsWith('#')) continue;
      const isRow = /^\d{1,2}\/\d{1,2}\/\d{4}/.test(l) || /^(\d+|[Α-ΩA-Z])\s*[.)]/.test(l) || /^νικητ/i.test(l) || /^τελικ\S*\s*\d/i.test(l);
      if (!isRow) {
        if (/προκριματικ/i.test(l)) { sec = 'Q'; continue; }
        if (/προημιτελικ/i.test(l)) { sec = 'QF'; continue; }
        if (/ημιτελικ/i.test(l)) { sec = 'SF'; continue; }
        if (/τελικ/i.test(l)) { sec = 'F'; const w = l.match(/(\d)\s*νίκ/i); if (w) M.F.wins = +w[1]; continue; }
      }
      let sa = null, sb = null; const s = l.match(SC); if (s) { sa = +s[1]; sb = +s[2]; l = l.replace(SC, ''); }
      if (sec === 'Q') {
        const m = l.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[–-]?\s*(\d{1,2})[:.](\d{2})\s*(?:\(([^)]*)\))?\s*:?\s*(.+?)\s+-\s+(.+)$/);
        if (m) M.Q.push({ n: M.Q.length + 1, date: `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}`, time: `${m[4].padStart(2, '0')}:${m[5]}`, court: caps(m[6] || ''), a: team(m[7]), b: team(m[8]), sa, sb });
      } else if (sec === 'QF') {
        const m = l.match(/^(\d+)\s*[.)]\s*(.+?)\s+-\s+(.+)$/);
        if (m) M.QF.push({ n: +m[1], a: team(m[2]), b: team(m[3]), sa, sb });
      } else if (sec === 'SF') {
        const m = l.match(/^([Α-ΩA-Z])\s*[.)]\s*(.+)$/), nn = m && m[2].match(/(\d+)\s*(?:και|&|,)\s*(\d+)/i);
        if (m) M.SF.push({ id: caps(m[1]).replace('Α', 'A').replace('Β', 'B'), a: { ref: 'QF', n: nn ? +nn[1] : M.SF.length * 2 + 1 }, b: { ref: 'QF', n: nn ? +nn[2] : M.SF.length * 2 + 2 }, sa, sb });
      } else if (sec === 'F') {
        const w = l.match(/(\d)\s*νίκ/i); if (w) M.F.wins = +w[1];
        if (sa != null && /^τελικ/i.test(l)) M.F.games.push({ sa, sb });
      }
    }
    return M;
  }

  const winner = (x) => (x && x.sa != null && x.sb != null && x.sa !== x.sb ? (x.sa > x.sb ? x.a : x.b) : null);
  /** fill the teams that come from earlier rounds, and the final's series */
  function resolve(M) {
    const get = (side) => {
      if (!side || !side.ref) return side;
      const src = side.ref === 'Q' ? M.Q.find((g) => g.n === side.n) : side.ref === 'QF' ? M.QF.find((g) => g.n === side.n) : M.SF.find((g) => g.id === side.n);
      const w = src && winner({ ...src, a: get(src.a), b: get(src.b) });
      return w && w.name ? { ...w, from: side } : side;
    };
    for (const g of [...M.Q, ...M.QF, ...M.SF]) { g.A = get(g.a); g.B = get(g.b); }
    M.F.A = get({ ref: 'SF', n: 'A' }); M.F.B = get({ ref: 'SF', n: 'B' });
    const wa = M.F.games.filter((g) => g.sa > g.sb).length, wb = M.F.games.filter((g) => g.sb > g.sa).length;
    M.F.wa = wa; M.F.wb = wb; M.F.champ = wa >= M.F.wins ? M.F.A : wb >= M.F.wins ? M.F.B : null;
    return M;
  }

  /** scores from the Worker's League Cup games for ties the file leaves empty (match on the two teams' names) */
  function scores(M, matches, nameKey) {
    const k = nameKey || key;
    const find = (A, B) => (matches || []).filter((m) => m.setsHome != null && m.status === 'finished' && A && B && A.name && B.name &&
      ((k(m.home?.name) === k(A.name) && k(m.away?.name) === k(B.name)) || (k(m.home?.name) === k(B.name) && k(m.away?.name) === k(A.name))));
    const fill = (g) => {
      if (g.sa != null) return;
      const m = find(g.A, g.B)[0]; if (!m) return;
      const aHome = k(m.home?.name) === k(g.A.name); g.sa = aHome ? m.setsHome : m.setsAway; g.sb = aHome ? m.setsAway : m.setsHome;
    };
    resolve(M); M.Q.forEach(fill); resolve(M); M.QF.forEach(fill); resolve(M); M.SF.forEach(fill); resolve(M);
    if (!M.F.games.length && M.F.A?.name && M.F.B?.name) {
      for (const m of find(M.F.A, M.F.B).sort((x, y) => String(x.iso).localeCompare(String(y.iso)))) {
        const aHome = k(m.home?.name) === k(M.F.A.name); M.F.games.push({ sa: aHome ? m.setsHome : m.setsAway, sb: aHome ? m.setsAway : m.setsHome });
      }
    }
    return resolve(M);
  }

  const ORD = ['', '1ου', '2ου', '3ου', '4ου', '5ου', '6ου', '7ου', '8ου'];
  const label = (s) => (s?.name ? s.name : s?.ref === 'Q' ? `ΝΙΚΗΤΗΣ ${ORD[s.n] || s.n} ΠΡΟΚΡΙΜΑΤΙΚΟΥ` : s?.ref === 'QF' ? `ΝΙΚΗΤΗΣ ${s.n}ου ΠΡΟΗΜΙΤΕΛΙΚΟΥ` : s?.ref === 'SF' ? `ΝΙΚΗΤΗΣ ΗΜΙΤΕΛΙΚΟΥ ${s.n === 'A' ? 'Α' : 'Β'}` : '—');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /** absolutely positioned bracket: G = { W, top, bottom, x0?, gapX, colW?, cardH?, pad }, logo(team) → html, name(team) → display name */
  function html(M, G, logo, name) {
    const disp = (s) => (s?.name ? (name ? name(s) : s.name) : label(s));
    // qualifying games next to the quarter-final they feed
    const qTo = (q) => { for (const f of M.QF) for (const [side, pos] of [[f.a, 0], [f.b, 1]]) if (side?.ref === 'Q' && side.n === q.n) return f.n * 2 + pos; return 99; };
    const Q = [...M.Q].sort((x, y) => qTo(x) - qTo(y)), QF = [...M.QF].sort((x, y) => x.n - y.n), SF = [...M.SF];
    const cols = [['ΠΡΟΚΡΙΜΑΤΙΚΗ ΦΑΣΗ', Q], ['ΠΡΟΗΜΙΤΕΛΙΚΗ ΦΑΣΗ', QF], ['ΗΜΙΤΕΛΙΚΗ ΦΑΣΗ', SF], ['ΤΕΛΙΚΟΙ', [M.F]]];
    const NC = 4, gapX = G.gapX, colW = Math.floor((G.W - 2 * G.pad - gapX * (NC - 1)) / NC), x0 = Math.round((G.W - (colW * NC + gapX * (NC - 1))) / 2);
    const rows = Math.max(1, ...cols.map((c) => c[1].length)), area = G.bottom - G.top - 56;
    const cardH = Math.min(G.cardMax || 150, Math.floor(area / rows) - (G.capH || 24) - 10);
    const yOf = (c, i) => { const n = cols[c][1].length || 1, span = area / n; return Math.round(G.top + 56 + span * i + span / 2 - cardH / 2); };
    const X = (c) => x0 + c * (colW + gapX);
    const row = (s, sc, win, lose) => `<div class="bt ${lose ? 'l' : ''} ${win ? 'w' : ''} ${s?.name ? '' : 'tbd'}"><div class="lo2">${s?.name ? logo(s) : ''}</div><span class="fit">${esc(disp(s))}</span><b>${sc ?? ''}</b></div>`;
    const card = (g, c, i, cap) => {
      const W = winner({ ...g, a: g.A, b: g.B }), aw = W && W === g.A, bw = W && W === g.B;
      return `<div class="bc par" style="left:${X(c)}px;top:${yOf(c, i)}px;width:${colW}px;height:${cardH}px">${row(g.A, g.sa, aw, bw)}${row(g.B, g.sb, bw, aw)}</div>
        ${cap ? `<div class="bcap" style="left:${X(c)}px;top:${yOf(c, i) + cardH + 4}px;width:${colW}px">${esc(cap)}</div>` : ''}`;
    };
    const fin = M.F, fs = fin.games.length ? fin.games : [];
    const fcard = `<div class="bc par fin" style="left:${X(3)}px;top:${yOf(3, 0)}px;width:${colW}px;height:${cardH}px">
        ${row(fin.A, fs.length ? fin.wa : '', fin.champ && fin.champ === fin.A, fin.champ && fin.champ !== fin.A)}${row(fin.B, fs.length ? fin.wb : '', fin.champ && fin.champ === fin.B, fin.champ && fin.champ !== fin.B)}</div>
      <div class="bcap" style="left:${X(3)}px;top:${yOf(3, 0) + cardH + 4}px;width:${colW}px">${fs.length ? fs.map((g) => `${g.sa}-${g.sb}`).join(' · ') + ' · ' : ''}ΣΕ ${fin.wins} ΝΙΚΕΣ</div>
      ${fin.champ ? `<div class="bchamp" style="left:${X(3)}px;top:${yOf(3, 0) + cardH + 44}px;width:${colW}px">ΚΥΠΕΛΛΟΥΧΟΣ<b>${esc(disp(fin.champ))}</b></div>` : ''}`;
    // connectors (elbow lines) from each game to the card it feeds
    const line = (c, i, c2, j) => {
      const x1 = X(c) + colW, y1 = yOf(c, i) + cardH / 2, x2 = X(c2), y2 = yOf(c2, j) + cardH / 2, xm = x1 + gapX / 2;
      return `<i class="bl" style="left:${x1}px;top:${y1 - 1}px;width:${xm - x1}px"></i><i class="bl v" style="left:${xm - 1}px;top:${Math.min(y1, y2)}px;height:${Math.max(2, Math.abs(y2 - y1))}px"></i><i class="bl" style="left:${xm}px;top:${y2 - 1}px;width:${x2 - xm}px"></i>`;
    };
    const L = [];
    Q.forEach((q, i) => { const j = QF.findIndex((f) => [f.a, f.b].some((s) => s?.ref === 'Q' && s.n === q.n)); if (j >= 0) L.push(line(0, i, 1, j)); });
    QF.forEach((f, i) => { const j = SF.findIndex((s) => [s.a, s.b].some((x) => x?.ref === 'QF' && x.n === f.n)); if (j >= 0) L.push(line(1, i, 2, j)); });
    SF.forEach((s, i) => L.push(line(2, i, 3, 0)));
    const heads = cols.map(([t], c) => `<div class="bh" style="left:${X(c)}px;top:${G.top}px;width:${colW}px">${t}</div>`).join('');
    return `<div class="bk">${heads}${L.join('')}
      ${Q.map((g, i) => card(g, 0, i, `${g.date} · ${g.time}${g.court ? ' · ' + g.court : ''}`)).join('')}
      ${QF.map((g, i) => card(g, 1, i)).join('')}${SF.map((g, i) => card(g, 2, i, `ΗΜΙΤΕΛΙΚΟΣ ${g.id === 'A' ? 'Α' : 'Β'}`)).join('')}${fcard}</div>`;
  }

  async function load(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('cup.txt ' + r.status);
    return parse(await r.text());
  }
  window.CUPB = { parse, resolve, scores, html, load, key, caps };
})();
