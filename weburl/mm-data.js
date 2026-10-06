/* Browser port of app.py's data shaping. Talks to the Cloudflare Worker instead of the local FastAPI server. */
window.MM = (() => {
  // Replace the URL below with your actual Cloudflare Worker URL:
  const API = () => new URLSearchParams(location.search).get("api") || "https://basket-cards-proxy.terzis-spy.workers.dev/";
  const api = async params => {
    const r = await fetch(`${API()}?${new URLSearchParams(params)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  const I = x => { const n = parseInt(x, 10); return Number.isFinite(n) ? n : null; };
  const mmss = c => (typeof c === "string" && c.length >= 5 ? c.slice(-5) : c);
  const norm = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const line = s => {
    s = s || {}; const g = k => I(s[k]) || 0;
    return { pts: g("points"), reb: g("rebounds"), oreb: g("offensiveRebounds"), dreb: g("defensiveRebounds"),
      ast: g("assists"), stl: g("steals"), blk: g("blocks"), tov: g("turnovers"), pf: g("fouls"), pir: g("pir"),
      m1: g("made1Pointers"), a1: g("attempted1Pointers"), m2: g("made2Pointers"), a2: g("attempted2Pointers"),
      m3: g("made3Pointers"), a3: g("attempted3Pointers") };
  };
  const byJersey = (a, b) => ((a.jersey == null) - (b.jersey == null)) || ((+a.jersey || 0) - (+b.jersey || 0));

  /* team fouls in the current period, from the play-by-play.
     FIBA: overtimes count as an extension of the 4th period. */
  function teamFouls(g) {
    const pbp = g.playByPlay || [];
    if (!pbp.length) return null;
    let cur = I((g.score || {}).quarter) || Math.max(...pbp.map(e => I(e.period) || 0));
    if (!cur) return null;
    const out = { home: 0, away: 0, period: cur };
    pbp.forEach(e => {
      if (e.tag !== "FOUL") return;
      const p = I(e.period);
      if (p === null || !(cur >= 5 ? p >= 4 : p === cur)) return;
      if (e.side === "h") out.home++; else if (e.side === "a") out.away++;
    });
    return out;
  }

  function summary(g) {
    g = g || {};
    const info = g.gameEventInfo || {}, ch = g.channel || {}, comp = info.competition || {}, sc = g.score || {};
    const teams = info.eventTeams || [g.homeTeam, g.awayTeam].filter(Boolean);
    const home = teams.find(t => t.isHomeTeam) || teams[0] || {};
    const away = teams.find(t => !t.isHomeTeam) || teams[teams.length - 1] || {};
    const scores = { [sc.team1EventTeamId]: sc.team1Score, [sc.team2EventTeamId]: sc.team2Score };
    const box = {}; ((g.gameStats || {}).teams || []).forEach(t => (box[t.eventTeamId] = t));
    const side = t => {
      const st = box[t.id] || {};
      const roster = (st.teamPlayerStats || []).map(p => ({ jersey: p.jersey, name: p.fullName, starter: !!p.isStarter,
        played: p.played === undefined ? true : !!p.played, min: mmss((p.stats || {}).minutes), ...line(p.stats) })).sort(byJersey);
      const players = roster.filter(p => p.played);
      const sc0 = scores[t.id];
      return { name: t.name || st.name, short: String(t.threeLetterIdentifier || st.threeLetterIdentifier || "").trim(),
        team_id: t.teamId || st.teamId, score: I(sc0 ?? st.score), logo: t.logoUrl || st.teamLogo, color: t.color,
        periods: st.periodScores || [], totals: st.totalStats ? line(st.totalStats) : null, roster, players,
        top_stats: [...players].sort((a, b) => b.pts - a.pts).slice(0, 3).map(p => ({ player_name: p.name, jersey: p.jersey, points: p.pts })) };
    };
    const h = side(home), a = side(away);
    const mv = g.gameMvp;
    return { source: "gameday", id: g.id, state: g.gameStatus || g.status, period: I(sc.quarter), period_raw: sc.gameState,
      clock: mmss(sc.clock), date: info.startsAt || g.startsAt, competition: comp.name || g.competitionName, stadium: info.court,
      home: h, visitor: a,
      quarters: h.periods.map((hs, i) => ({ period: i + 1, home_score: hs, visitor_score: a.periods[i] })).slice(0, Math.min(h.periods.length, a.periods.length)),
      team_fouls: teamFouls(g),
      channel_id: ch.id, org_id: info.orgId || g.orgId, group: info.groupName || g.groupName || info.stageName,
      competition_id: ch.competitionId || g.competitionId,
      competition_logo: comp.logoUrl || ch.logoUrl || g.competitionLogoUrl || info.orgLogoUrl || g.orgLogoUrl,
      season_id: info.seasonId,
      mvp: mv && mv.fullName ? { name: mv.fullName, jersey: mv.jerseyNumber, team: mv.teamName, logo: mv.teamLogo, min: mmss(mv.playTime), ...line(mv.mvpStats) } : null };
  }

  /* ---- season averages (rosters / comparison cards) ---- */
  const r1 = v => Math.round((parseFloat(v) || 0) * 10) / 10;
  const avg = s => { s = s || {}; const f = k => r1(s[k]);
    return { gp: I(s.gamesPlayed), pts: f("avgPoints"), reb: f("avgRebounds"), oreb: f("avgOffensiveRebounds"), ast: f("avgAssists"),
      stl: f("avgSteals"), blk: f("avgBlocks"), tov: f("avgTurnovers"), pf: f("avgFouls"), pir: f("avgPir"),
      m1: f("avgMade1Pointers"), a1: f("avgAttempted1Pointers"), m2: f("avgMade2Pointers"), a2: f("avgAttempted2Pointers"),
      m3: f("avgMade3Pointers"), a3: f("avgAttempted3Pointers") }; };
  const findAvg = (d, depth = 0) => {
    if (!d || typeof d !== "object" || Array.isArray(d) || depth > 3) return null;
    if ("avgPoints" in d) return d;
    for (const v of Object.values(d)) { const r = findAvg(v, depth + 1); if (r) return r; }
    return null;
  };
  const seasonSummary = d => {
    d = d || {};
    const players = (d.teamPlayerStats || d.players || d.playerStats || []).filter(p => p && typeof p === "object")
      .map(p => ({ jersey: p.jersey ?? p.jerseyNumber, name: p.fullName || p.name, ...avg(p.stats) })).sort(byJersey);
    const team = findAvg(Object.fromEntries(Object.entries(d).filter(([, v]) => !Array.isArray(v))));
    return { team: team ? avg(team) : null, players };
  };
  const seasonOf = async (s, t) => {
    if (!(s.channel_id && t.team_id && s.season_id)) return null;
    try { return seasonSummary(await api({ r: "season", channel: s.channel_id, team: t.team_id, season: s.season_id })); }
    catch { return null; }
  };

  async function game(id, withSeason) {
    if (!id) throw new Error("Λείπει το id αγώνα (?id=...)");
    const s = summary(await api({ r: "game", id }));
    if (withSeason) { const [h, a] = await Promise.all([seasonOf(s, s.home), seasonOf(s, s.visitor)]); s.season = { home: h, visitor: a }; }
    return s;
  }

  /* ---- standings (Mismatch widget endpoint) ---- */
  const ROWK = new Set(["wins", "losses", "won", "lost", "w", "l", "rank", "position", "pos", "points", "pts", "played", "gp", "gamesplayed", "standingpoints"]);
  const lists = (x, name, out = []) => {
    if (Array.isArray(x)) {
      if (x.length && x.every(i => i && typeof i === "object" && !Array.isArray(i))) {
        const keys = new Set(); x.slice(0, 3).forEach(i => Object.keys(i).forEach(k => keys.add(k.toLowerCase())));
        const ks = [...keys];
        if (ks.filter(k => ROWK.has(k)).length >= 2 && ks.some(k => k.includes("team") || k === "name")) out.push([name, x]);
        else x.forEach(i => lists(i, name, out));
      }
    } else if (x && typeof x === "object") {
      const nm = x.groupName || x.name || x.title || name;
      Object.values(x).forEach(v => lists(v, nm, out));
    }
    return out;
  };
  const row = (r, i) => {
    const t = r.team && typeof r.team === "object" ? r.team : {};
    const num = (...ks) => { for (const k of ks) { const v = I(r[k]); if (v !== null) return v; } return null; };
    const pf = num("pointsFor", "pointsScored", "scored", "pf"), pa = num("pointsAgainst", "conceded", "pa"), d = num("pointsDiff", "diff", "difference");
    return { pos: num("position", "rank", "pos") || i + 1, team: r.teamName || t.name || r.name, logo: r.teamLogo || r.logoUrl || t.logoUrl || t.logo,
      played: num("played", "gamesPlayed", "gp"), wins: num("wins", "won", "w"), losses: num("losses", "lost", "l"), pf, pa,
      diff: d !== null ? d : (pf !== null && pa !== null ? pf - pa : null), points: num("standingPoints", "points", "pts") };
  };
  async function standings(m) {
    if (!(m.org_id && m.competition_id && m.season_id)) return null;
    const d = await api({ r: "widget", org: m.org_id, comp: m.competition_id, season: m.season_id });
    return { competition: m.competition, logo: m.competition_logo, group: m.group,
      groups: lists(d).map(([name, rows]) => ({ name, rows: rows.map(row) })) };
  }

  /* ---- officials (basket.gr, matched by date + team names) ---- */
  const STOP = new Set(["αο", "γσ", "ασ", "ας", "γας", "κας", "καε", "αγσ", "γσα", "μγσ", "ακ", "ακα", "ομιλος", "σ", "κ", "ο", "αθλητικος", "συλλογος", "ακαδημια"]);
  const tokens = n => new Set(norm(n).replace(/[^\p{L}\p{N}_\s]/gu, " ").split(/\s+/).filter(w => w && !STOP.has(w) && w.length > 2));
  const sameTeam = (a, b) => { const A = tokens(a); return [...tokens(b)].some(w => A.has(w)); };
  const person = p => {
    if (typeof p === "string") return { name: p, role: null };
    if (!p || typeof p !== "object") return null;
    const inn = p.person || p.referee || p.user || {};
    const name = p.name || p.full_name || p.fullName || inn.name ||
      [p.first_name || p.firstName || inn.first_name, p.last_name || p.lastName || inn.last_name].filter(Boolean).join(" ");
    let role = p.role || p.type || (p.pivot || {}).role;
    if (role && typeof role === "object") role = role.name;
    return name ? { name, role: typeof role === "string" ? role : null } : null;
  };
  async function officials(m) {
    if (!m.date) return null;
    const day = new Date(m.date).toLocaleDateString("en-CA", { timeZone: "Europe/Athens" });
    for (let page = 1, last = 1; page <= last; page++) {
      const d = await api({ r: "bg", date: day, page });
      last = (d.meta || {}).last_page || 1;
      for (const x of d.data || []) {
        if (sameTeam(m.home.name, (x.home_team || {}).name) && sameTeam(m.visitor.name, (x.visitor_team || {}).name)) {
          const grab = k => (x[k] || []).map(person).filter(Boolean);
          return { referees: grab("referees"), judges: grab("judges"), commissioners: grab("commissioners"), referee_coaches: grab("referee_coaches") };
        }
      }
    }
    return null;
  }

  /* ---- schedule of one matchday: ch=<channelId> or comp=<name>, group=<name part>, md=<number or name> ---- */
  const DAY = 86400000;
  const utc = t => new Date(t).toISOString().replace(/\.\d{3}Z$/, ".000Z");
  async function channelGames(ch) {
    const start = Date.now() - 210 * DAY, wins = [];
    for (let i = 0; i < 15; i++) wins.push([start + i * 30 * DAY, start + (i + 1) * 30 * DAY - 1000]);
    const lists = await Promise.all(wins.map(([a, b]) =>
      api({ r: "feed", channel: ch, since: utc(a), until: utc(b) }).catch(() => [])));
    const seen = new Set(), out = [];
    lists.forEach(l => (Array.isArray(l) ? l : (l.data || l.items || l.games || l.feed || [])).forEach(it => {
      const g = it && typeof it.game === "object" ? it.game : it;
      if (g && g.id && !seen.has(g.id)) { seen.add(g.id); out.push(g); }
    }));
    return out;
  }
  // only ΕΚΑΣΘ competitions (name or organisation contains one of these words; ?filter=Α,Β to change)
  const SCHEDULE_FILTER = ["ΕΚΑΣΘ"];
  async function schedule(p) {
    const words = (p.get("filter") || SCHEDULE_FILTER.join(",")).split(",").map(w => norm(w.trim())).filter(Boolean);
    const all = await api({ r: "channels" });
    const allowed = (Array.isArray(all) ? all : (all.data || all.items || all.channels || []))
      .filter(c => words.some(w => norm(`${c.name || ""} ${c.orgName || ""}`).includes(w)));
    let ch = p.get("ch"), chInfo = null;
    if (ch) {
      chInfo = allowed.find(c => c.id === ch);
      if (!chInfo) throw new Error("Αυτή η διοργάνωση δεν είναι της ΕΚΑΣΘ");
    } else if (p.get("comp")) {
      chInfo = allowed.find(c => norm(c.name).includes(norm(p.get("comp"))));
      ch = chInfo && chInfo.id;
      if (!ch) throw new Error(`Δεν βρέθηκε διοργάνωση ΕΚΑΣΘ με "${p.get("comp")}". Διαθέσιμες: ${allowed.map(c => c.name).join(" · ")}`);
    }
    if (!ch) throw new Error("Λείπει η διοργάνωση (?ch=<id> ή ?comp=<όνομα>)");
    const games = (await channelGames(ch)).map(g => {
      const s = summary(g);
      s.id = g.id;
      s.matchday = g.matchdayName || (g.matchday || {}).name || g.stageName || "";
      s.group = s.group || g.stageName || "";
      return s;
    });
    const want = norm(p.get("group") || "");
    const inGroup = games.filter(g => !want || norm(g.group).includes(want));
    // matchdays in date order
    const mds = [];
    inGroup.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach(g => { if (!mds.includes(g.matchday)) mds.push(g.matchday); });
    const md = p.get("md");
    let pick;
    if (md && /^\d+$/.test(md)) pick = mds.find(n => parseInt(n, 10) === +md) || mds[+md - 1];
    else if (md) pick = mds.find(n => norm(n).includes(norm(md)));
    else {                                                     // no md: the next matchday not yet finished
      const now = new Date().toISOString();
      pick = mds.find(n => inGroup.some(g => g.matchday === n && !/complet|final|finish/i.test(g.state || "") && String(g.date) >= now.slice(0, 10))) || mds[mds.length - 1];
    }
    const list = inGroup.filter(g => g.matchday === pick).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const any = list[0] || games[0] || {};
    return { competition: (chInfo && chInfo.name) || any.competition || "", competition_logo: any.competition_logo || (chInfo && chInfo.logoUrl),
      group: (list[0] && list[0].group) || p.get("group") || "", matchday: pick || "", matchdays: mds, games: list };
  }

  return { game, standings, officials, schedule };
})();
