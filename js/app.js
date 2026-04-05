(async () => {
  // ── 0. GLOBAL STATE ──
  let allMatches = [];
  let allBracket = [];
  let currentPage = 'grupos';
  let currentBracketRound = 'r32';
  let rankingData = [];
  let rankingTab = 'oficial';
  let fixtureGrupo = 'all';
  let fixtureJornada = 'all';

  // ── 1. BIND NAV IMMEDIATELY (Safety) ──
  function setupUI() {
    // Auth listeners
    const btnL = document.getElementById('btn-login');
    const btnLD = document.getElementById('btn-login-drawer');
    const btnO = document.getElementById('btn-logout');
    
    const loginFn = () => DB.login();
    if (btnL) btnL.addEventListener('click', loginFn);
    if (btnLD) btnLD.addEventListener('click', loginFn);
    if (btnO) btnO.addEventListener('click', () => DB.logout());

    DB.onAuth(user => {
      const area = document.getElementById('user-profile');
      const lbtn = document.getElementById('btn-login');
      const lbtnD = document.getElementById('btn-login-drawer');
      const photo = document.getElementById('user-photo');
      if (user) {
        if (lbtn) lbtn.style.display = 'none';
        if (lbtnD) lbtnD.style.display = 'none';
        if (area) area.style.display = 'flex';
        if (photo) photo.src = user.photoURL;
        showToast(`Bienvenido, ${user.displayName || 'Usuario'}`);
      } else {
        if (lbtn) lbtn.style.display = 'block';
        if (lbtnD) lbtnD.style.display = 'block';
        if (area) area.style.display = 'none';
      }
    });
    document.querySelectorAll('.nav-btn, .drawer-btn').forEach(btn => {
      btn.addEventListener('click', () => showPage(btn.dataset.page));
    });
    const cta = document.getElementById('hero-cta');
    if (cta) cta.addEventListener('click', () => showPage('simulador'));

    const hamburger = document.getElementById('hamburger');
    const navDrawer = document.getElementById('nav-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (hamburger && navDrawer && drawerOverlay) {
      hamburger.addEventListener('click', () => {
        navDrawer.classList.toggle('open');
        drawerOverlay.classList.toggle('show');
      });
      drawerOverlay.addEventListener('click', () => {
        navDrawer.classList.remove('open');
        drawerOverlay.classList.remove('show');
      });
    }

    // Filter selects
    const fG = document.getElementById('filter-grupo');
    const fJ = document.getElementById('filter-jornada');
    if (fG) fG.addEventListener('change', e => { fixtureGrupo = e.target.value; renderFixture(); });
    if (fJ) fJ.addEventListener('change', e => { fixtureJornada = e.target.value; renderFixture(); });
  }
  setupUI();

  // ── 2. BACKGROUND FOR FIRESTORE ──
  try {
    await DB.init();
    allMatches = await DB.getAllMatches();
    allBracket = await DB.getAllBracket();
    showToast('✅ Conectado a la Nube');
  } catch (err) {
    console.error('❌ DB Fail:', err);
    showToast('⚠️ Error: Revisa tus Reglas de Firebase');
  }

  // Initial renders
  renderAllMatches();
  renderBracket();
  renderRanking();
  renderEstadios();
  createParticles();

  // ══════════════════════════════════════════════
  //  BRACKET TREE — Maps each match to where its winner/loser advances
  //  Structure: matchId → [{ next, side:'home'|'away', role:'winner'|'loser' }]
  // ══════════════════════════════════════════════
  const BRACKET_TREE = {
    // R32 → R16
    'R32-01': [{ next: 'R16-01', side: 'home', role: 'winner' }],
    'R32-02': [{ next: 'R16-01', side: 'away', role: 'winner' }],
    'R32-03': [{ next: 'R16-02', side: 'home', role: 'winner' }],
    'R32-04': [{ next: 'R16-02', side: 'away', role: 'winner' }],
    'R32-05': [{ next: 'R16-03', side: 'home', role: 'winner' }],
    'R32-06': [{ next: 'R16-03', side: 'away', role: 'winner' }],
    'R32-07': [{ next: 'R16-04', side: 'home', role: 'winner' }],
    'R32-08': [{ next: 'R16-04', side: 'away', role: 'winner' }],
    'R32-09': [{ next: 'R16-05', side: 'home', role: 'winner' }],
    'R32-10': [{ next: 'R16-05', side: 'away', role: 'winner' }],
    'R32-11': [{ next: 'R16-06', side: 'home', role: 'winner' }],
    'R32-12': [{ next: 'R16-06', side: 'away', role: 'winner' }],
    'R32-13': [{ next: 'R16-07', side: 'home', role: 'winner' }],
    'R32-14': [{ next: 'R16-07', side: 'away', role: 'winner' }],
    'R32-15': [{ next: 'R16-08', side: 'home', role: 'winner' }],
    'R32-16': [{ next: 'R16-08', side: 'away', role: 'winner' }],
    // R16 → QF
    'R16-01': [{ next: 'QF-01', side: 'home', role: 'winner' }],
    'R16-02': [{ next: 'QF-01', side: 'away', role: 'winner' }],
    'R16-03': [{ next: 'QF-02', side: 'home', role: 'winner' }],
    'R16-04': [{ next: 'QF-02', side: 'away', role: 'winner' }],
    'R16-05': [{ next: 'QF-03', side: 'home', role: 'winner' }],
    'R16-06': [{ next: 'QF-03', side: 'away', role: 'winner' }],
    'R16-07': [{ next: 'QF-04', side: 'home', role: 'winner' }],
    'R16-08': [{ next: 'QF-04', side: 'away', role: 'winner' }],
    // QF → SF
    'QF-01':  [{ next: 'SF-01',    side: 'home', role: 'winner' }],
    'QF-02':  [{ next: 'SF-01',    side: 'away', role: 'winner' }],
    'QF-03':  [{ next: 'SF-02',    side: 'home', role: 'winner' }],
    'QF-04':  [{ next: 'SF-02',    side: 'away', role: 'winner' }],
    // SF → Final + 3rd place
    'SF-01':  [
      { next: 'FINAL-1', side: 'home', role: 'winner' },
      { next: 'FINAL-3', side: 'home', role: 'loser'  },
    ],
    'SF-02':  [
      { next: 'FINAL-1', side: 'away', role: 'winner' },
      { next: 'FINAL-3', side: 'away', role: 'loser'  },
    ],
  };

  // Propagate winner/loser of matchId to the next match in the tree
  async function propagateBracketResult(matchId) {
    const match = allBracket.find(m => m.id === matchId);
    if (!match || match.scoreHome === null || match.scoreAway === null) return;
    const transitions = BRACKET_TREE[matchId] || [];

    for (const tr of transitions) {
      const nextMatch = allBracket.find(m => m.id === tr.next);
      if (!nextMatch) continue;

      const homeWins = match.scoreHome > match.scoreAway || (match.scoreHome === match.scoreAway && match.penHome > match.penAway);
      let teamName, teamCode;
      if (tr.role === 'winner') {
        teamName = homeWins ? (match.homeResolved || match.home) : (match.awayResolved || match.away);
        teamCode = homeWins ? match.homeCode : match.awayCode;
      } else { // loser
        teamName = homeWins ? (match.awayResolved || match.away) : (match.homeResolved || match.home);
        teamCode = homeWins ? match.awayCode : match.homeCode;
      }

      const prevName = tr.side === 'home' ? nextMatch.homeResolved : nextMatch.awayResolved;
      const teamChanged = prevName && prevName !== teamName;

      if (tr.side === 'home') {
        nextMatch.homeResolved = teamName;
        nextMatch.homeCode = teamCode;
      } else {
        nextMatch.awayResolved = teamName;
        nextMatch.awayCode = teamCode;
      }

      // If the advancing team changed, clear the next match score and cascade
      if (teamChanged) {
        nextMatch.scoreHome = null;
        nextMatch.scoreAway = null;
        await resetDownstream(tr.next);
      }

      await DB.updateBracketMatch(nextMatch);
    }
    allBracket = await DB.getAllBracket();
  }

  // Recursively reset scores and team slots downstream from a changed match
  async function resetDownstream(matchId) {
    const transitions = BRACKET_TREE[matchId] || [];
    for (const tr of transitions) {
      const nm = allBracket.find(m => m.id === tr.next);
      if (!nm) continue;
      if (tr.side === 'home') { nm.homeResolved = null; nm.homeCode = null; }
      else                   { nm.awayResolved = null; nm.awayCode = null; }
      nm.scoreHome = null; nm.scoreAway = null;
      await DB.updateBracketMatch(nm);
      await resetDownstream(tr.next);
    }
    allBracket = await DB.getAllBracket();
  }

  // Populate R32 match slots from group standings (called after each group match)
  async function populateR32FromGroups() {
    // Build group standings map
    const gMap = {};
    WC2026.grupos.forEach(g => {
      const st = calcStandings(g);
      if (st.some(t => t.PJ > 0)) gMap[g.id] = st;
    });
    const thirds = calcBestThirds(); // sorted top 8 by criteria

    // Resolve a team from a descriptor
    const resolve = (src) => {
      if (src.type === '1st' || src.type === '2nd') {
        const st = gMap[src.group];
        if (!st) return null;
        const t = st[src.type === '1st' ? 0 : 1];
        if (!t || t.PJ === 0) return null;
        return { name: t.name, code: WC2026.flagCode[t.name] || null };
      }
      if (src.type === 'best3') {
        const t = thirds[src.pos];
        return t ? { name: t.name, code: WC2026.flagCode[t.name] || null } : null;
      }
      return null;
    };

    // Mapping table: R32 match → home & away sources
    const MAP = [
      { id:'R32-01', h:{type:'1st',group:'A'}, a:{type:'best3',pos:0} },
      { id:'R32-02', h:{type:'1st',group:'B'}, a:{type:'best3',pos:1} },
      { id:'R32-03', h:{type:'1st',group:'C'}, a:{type:'2nd',group:'F'} },
      { id:'R32-04', h:{type:'1st',group:'D'}, a:{type:'2nd',group:'E'} },
      { id:'R32-05', h:{type:'1st',group:'E'}, a:{type:'2nd',group:'D'} },
      { id:'R32-06', h:{type:'1st',group:'F'}, a:{type:'2nd',group:'C'} },
      { id:'R32-07', h:{type:'1st',group:'G'}, a:{type:'best3',pos:2} },
      { id:'R32-08', h:{type:'1st',group:'H'}, a:{type:'best3',pos:3} },
      { id:'R32-09', h:{type:'1st',group:'I'}, a:{type:'best3',pos:4} },
      { id:'R32-10', h:{type:'1st',group:'J'}, a:{type:'best3',pos:5} },
      { id:'R32-11', h:{type:'1st',group:'K'}, a:{type:'2nd',group:'L'} },
      { id:'R32-12', h:{type:'1st',group:'L'}, a:{type:'2nd',group:'K'} },
      { id:'R32-13', h:{type:'2nd',group:'A'}, a:{type:'2nd',group:'B'} },
      { id:'R32-14', h:{type:'2nd',group:'G'}, a:{type:'2nd',group:'H'} },
      { id:'R32-15', h:{type:'2nd',group:'I'}, a:{type:'2nd',group:'J'} },
      { id:'R32-16', h:{type:'best3',pos:6},   a:{type:'best3',pos:7} },
    ];

    let anyChanged = false;
    for (const entry of MAP) {
      const bm = allBracket.find(m => m.id === entry.id);
      if (!bm) continue;
      const hTeam = resolve(entry.h);
      const aTeam = resolve(entry.a);
      let changed = false;
      if (hTeam && bm.homeCode !== hTeam.code) {
        bm.homeResolved = hTeam.name; bm.homeCode = hTeam.code; changed = true;
      }
      if (aTeam && bm.awayCode !== aTeam.code) {
        bm.awayResolved = aTeam.name; bm.awayCode = aTeam.code; changed = true;
      }
      if (changed) { await DB.updateBracketMatch(bm); anyChanged = true; }
    }
    if (anyChanged) {
      allBracket = await DB.getAllBracket();
      // If bracket page is open, refresh it
      if (currentPage === 'bracket') renderBracket();
    }
  }

  // ── PARTICLES ──
  function createParticles() {
    const container = document.getElementById('hero-particles');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${6 + Math.random() * 10}s`;
      p.style.animationDelay = `${Math.random() * 10}s`;
      p.style.width = p.style.height = `${2 + Math.random() * 4}px`;
      p.style.opacity = (0.3 + Math.random() * 0.5).toString();
      container.appendChild(p);
    }
  }
  createParticles();

  // ── NAVIGATION ──
  function showPage(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn, .drawer-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) {
      pageEl.classList.add('active');
      window.scrollTo({ top: document.getElementById('main-content').offsetTop - 80, behavior: 'smooth' });
    }
    if (page === 'grupos') renderGrupos();
    if (page === 'fixture') renderFixture();
    if (page === 'bracket') renderBracket();
    if (page === 'ranking') renderRanking();
    if (page === 'simulador') renderSimulador();
    if (page === 'estadios') renderEstadios();
    closeDrawer();
  }

  document.querySelectorAll('.nav-btn, .drawer-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  document.getElementById('hero-cta').addEventListener('click', () => showPage('simulador'));

  // ── HAMBURGER ──
  const hamburger = document.getElementById('hamburger');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  hamburger.addEventListener('click', () => {
    navDrawer.classList.toggle('open');
    drawerOverlay.classList.toggle('show');
  });

  function closeDrawer() {
    navDrawer.classList.remove('open');
    drawerOverlay.classList.remove('show');
  }

  drawerOverlay.addEventListener('click', closeDrawer);

  // ── FILTER SELECT ──
  document.getElementById('filter-grupo').addEventListener('change', e => {
    fixtureGrupo = e.target.value;
    renderFixture();
  });
  document.getElementById('filter-jornada').addEventListener('change', e => {
    fixtureJornada = e.target.value;
    renderFixture();
  });

  // ── FLAG URL ──
  function flagUrl(country, size = 'w40') {
    const code = WC2026.flagCode[country] || 'un';
    return `https://flagcdn.com/${size}/${code}.png`;
  }

  function flagImg(country, size = 'w40', cls = '') {
    return `<img src="${flagUrl(country, size)}" alt="${country}" title="${country}" class="${cls}" loading="lazy" onerror="this.style.display='none'" />`;
  }

  // ── STANDING CALCULATOR ──
  function calcStandings(grupo) {
    const teams = grupo.equipos.map(name => ({
      name, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, GD: 0, PTS: 0
    }));
    const teamMap = {};
    teams.forEach(t => teamMap[t.name] = t);

    const groupMatches = allMatches.filter(m => m.grupo === grupo.id && m.scoreHome !== null);

    groupMatches.forEach(m => {
      const h = teamMap[m.home];
      const a = teamMap[m.away];
      if (!h || !a) return;
      const gh = m.scoreHome, ga = m.scoreAway;

      h.PJ++; a.PJ++;
      h.GF += gh; h.GC += ga; h.GD += (gh - ga);
      a.GF += ga; a.GC += gh; a.GD += (ga - gh);

      if (gh > ga) { h.PG++; h.PTS += 3; a.PP++; }
      else if (gh < ga) { a.PG++; a.PTS += 3; h.PP++; }
      else { h.PE++; h.PTS += 1; a.PE++; a.PTS += 1; }
    });

    // Get FIFA rank for tiebreaker
    const fifaMap = {};
    WC2026.fifaRanking.forEach(r => fifaMap[r.country] = r.rank);

    return teams.sort((a, b) =>
      b.PTS - a.PTS ||
      b.GD  - a.GD  ||
      b.GF  - a.GF  ||
      b.PG  - a.PG  ||
      (fifaMap[a.name] || 99) - (fifaMap[b.name] || 99)
    );
  }

  // ══════════════════════════════════════════════
  //  FIFA ELO SIMULATION
  //  Fórmula: Rn = Ro + I × (W − We)
  //  We = 1 / (10^(−dr/600) + 1)
  //  I  = 50 para fase de grupos / R32 / R16 WC
  //  I  = 60 para QF, SF, Final WC
  // ══════════════════════════════════════════════
  function calcSimulatedRanking() {
    // Build a mutable Elo map from the official ranking
    const eloMap = {};
    WC2026.fifaRanking.forEach(r => {
      eloMap[r.country] = {
        pts: r.pts,          // current working Elo (mutates)
        origPts: r.pts,      // original snapshot
        origRank: r.rank,
        code: r.code,
      };
    });

    const completed = allMatches.filter(m => m.scoreHome !== null);

    completed.forEach(m => {
      const hEntry = eloMap[m.home];
      const aEntry = eloMap[m.away];
      if (!hEntry || !aEntry) return;

      // W: 1=win, 0.5=draw, 0=loss  (penalties not tracked in group stage)
      let resultHome;
      if (m.scoreHome > m.scoreAway)       resultHome = 1;
      else if (m.scoreHome < m.scoreAway)  resultHome = 0;
      else                                 resultHome = 0.5;

      const K = 50; // Group stage WC
      const elo = WC2026.calcElo(hEntry.pts, aEntry.pts, resultHome, K);
      hEntry.pts = elo.newA;
      aEntry.pts = elo.newB;
    });

    // Sort by new Elo and assign new rank
    const sorted = Object.entries(eloMap)
      .map(([name, d]) => ({
        name,
        origRank: d.origRank,
        origPts: d.origPts,
        newPts: d.pts,
        code: d.code,
        deltaPts: +(d.pts - d.origPts).toFixed(2),
      }))
      .sort((a, b) => b.newPts - a.newPts)
      .map((r, i) => ({ ...r, newRank: i + 1 }));

    return sorted;
  }

  // ══════════════════════════════════════════════
  //  MEJORES TERCEROS CALCULATOR
  //  Criterios FIFA: PTS → DG → GF → PG → Ranking FIFA
  // ══════════════════════════════════════════════
  function calcBestThirds() {
    const thirds = [];
    const fifaMap = {};
    WC2026.fifaRanking.forEach(r => fifaMap[r.country] = r.rank);

    WC2026.grupos.forEach(g => {
      const st = calcStandings(g);
      // Only include if at least some matches played → 3rd place team exists
      if (st[2] && st[2].PJ > 0) {
        thirds.push({ ...st[2], grupo: g.id, fifaRank: fifaMap[st[2].name] || 999 });
      }
    });

    // Sort by: PTS desc → GD desc → GF desc → PG desc → FIFA rank asc
    thirds.sort((a, b) =>
      b.PTS - a.PTS ||
      b.GD  - a.GD  ||
      b.GF  - a.GF  ||
      b.PG  - a.PG  ||
      a.fifaRank - b.fifaRank
    );

    return thirds;
  }

  // ── RENDER GRUPOS ──
  function renderGrupos() {
    const grid = document.getElementById('grupos-grid');
    grid.innerHTML = WC2026.grupos.map(grupo => {
      const standings = calcStandings(grupo);
      const rows = standings.map((t, i) => `
        <tr>
          <td>
            <div class="team-cell">
              <span style="color:var(--text-dim);font-size:12px;font-weight:700;min-width:16px">${i+1}</span>
              ${flagImg(t.name, 'w40')}
              <span>${t.name}</span>
            </div>
          </td>
          <td>${t.PJ}</td>
          <td>${t.PG}</td>
          <td>${t.PE}</td>
          <td>${t.PP}</td>
          <td>${t.GF}</td>
          <td>${t.GC}</td>
          <td style="color:${t.GD >= 0 ? 'var(--green)' : 'var(--red)'}">${t.GD > 0 ? '+' : ''}${t.GD}</td>
          <td class="pts-cell">${t.PTS}</td>
        </tr>
      `).join('');

      return `
        <div class="grupo-card">
          <div class="grupo-header">
            <span class="grupo-name">Grupo ${grupo.id}</span>
            <span class="grupo-sede">${grupo.sede}</span>
          </div>
          <table class="grupo-table">
            <thead>
              <tr>
                <th style="min-width:140px">Equipo</th>
                <th title="Partidos Jugados">PJ</th>
                <th title="Ganados">G</th>
                <th title="Empatados">E</th>
                <th title="Perdidos">P</th>
                <th title="Goles a Favor">GF</th>
                <th title="Goles en Contra">GC</th>
                <th title="Diferencia de Goles">DG</th>
                <th title="Puntos">PTS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }).join('');
  }

  // ── RENDER FIXTURE ──
  function renderFixture() {
    const grupoSel = document.getElementById('filter-grupo');
    if (grupoSel.options.length === 1) {
      WC2026.grupos.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = `Grupo ${g.id}`;
        grupoSel.appendChild(opt);
      });
    }

    let filtered = allMatches;
    if (fixtureGrupo !== 'all') filtered = filtered.filter(m => m.grupo === fixtureGrupo);
    if (fixtureJornada !== 'all') filtered = filtered.filter(m => m.jornada === parseInt(fixtureJornada));

    const byDate = {};
    filtered.forEach(m => {
      if (!byDate[m.fecha]) byDate[m.fecha] = [];
      byDate[m.fecha].push(m);
    });

    const list = document.getElementById('fixture-list');
    list.innerHTML = Object.entries(byDate).map(([date, matches]) => `
      <div class="fixture-day-header">📅 ${date}</div>
      ${matches.map(m => `
        <div class="match-card" data-id="${m.id}">
          <div class="match-team">
            ${flagImg(m.home, 'w40')}
            <span class="match-team-name">${m.home}</span>
          </div>
          <div class="match-versus">
            ${m.scoreHome !== null
              ? `<div class="match-score">${m.scoreHome} – ${m.scoreAway}</div>`
              : `<div class="match-vs">vs</div>`
            }
          </div>
          <div class="match-team right">
            <span class="match-team-name">${m.away}</span>
            ${flagImg(m.away, 'w40')}
          </div>
          <div class="match-meta">
            <span class="grupo-badge">Grupo ${m.grupo}</span>
            <span>Jornada ${m.jornada}</span>
          </div>
        </div>
      `).join('')}
    `).join('');
  }

  // ══════════════════════════════════════════════
  //  VISUAL BRACKET RENDER
  // ══════════════════════════════════════════════
  let bkModal = null;
  let bkCurrent = null; // { id, round, homeName, awayName, homeCode, awayCode }

  function renderBracket() {
    const el = document.getElementById('bk-bracket');
    if (!el) return;

    // Split allBracket by round
    const r32  = allBracket.filter(m => m.round === 'r32');
    const r16  = allBracket.filter(m => m.round === 'r16');
    const qf   = allBracket.filter(m => m.round === 'qf');
    const sf   = allBracket.filter(m => m.round === 'sf');
    const fin  = allBracket.find(m  => m.id   === 'FINAL-1');
    const trd  = allBracket.find(m  => m.id   === 'FINAL-3');

    // Helper to see if someone won the final
    const getFinalWinner = () => {
      if (!fin || fin.scoreHome === null) return null;
      const sh = fin.scoreHome; const sa = fin.scoreAway;
      if (sh > sa) return { name: fin.homeResolved || fin.home, code: fin.homeCode };
      if (sa > sh) return { name: fin.awayResolved || fin.away, code: fin.awayCode };
      // Draw? Check penalties
      if (fin.penHome > fin.penAway) return { name: fin.homeResolved || fin.home, code: fin.homeCode };
      if (fin.penAway > fin.penHome) return { name: fin.awayResolved || fin.away, code: fin.awayCode };
      return null;
    };
    const champ = getFinalWinner();

    el.innerHTML = `
      <!-- LEFT SIDE -->
      <div class="bk-side left">
        ${bkRound(r32.slice(0,8),  'r32', 'left')}
        ${bkRound(r16.slice(0,4),  'r16', 'left')}
        ${bkRound(qf.slice(0,2),   'qf',  'left')}
        ${bkRound(sf.slice(0,1),   'sf',  'left')}
      </div>

      <!-- CENTER TROPHY + FINAL -->
      <div class="bk-center">
        <!-- CHAMPION REVEAL -->
        ${champ ? `
          <div class="bk-champion-reveal">
            <div class="bk-champ-badge">🏆 CAMPEÓN 🏆</div>
            <div class="bk-champ-team">
              <div class="bk-champ-flag">
                <img src="https://flagcdn.com/w160/${champ.code}.png" alt="${champ.name}" />
              </div>
              <div class="bk-champ-name">${champ.name}</div>
            </div>
          </div>
        ` : ''}

        <div class="bk-final-match" id="bk-fin-${fin?.id}" data-bkid="${fin?.id}">
          <div class="bk-final-label">🏆 GRAN FINAL · 19 Jul</div>
          ${fin ? bkTeamRow(fin, 'home') + bkTeamRow(fin, 'away') : bkTbd() + bkTbd()}
        </div>

        <div class="bk-trophy-wrap">
          <div class="bk-trophy-aura"></div>
          <div class="bk-ring"></div>
          <div class="bk-ring"></div>
          <div class="bk-trophy-emoji">🏆</div>
          ${bkSparks()}
        </div>

        <div class="bk-3rd-match" id="bk-fin-${trd?.id}" data-bkid="${trd?.id}">
          <div class="bk-3rd-label">🥉 Tercer Puesto · 18 Jul</div>
          ${trd ? bkTeamRow(trd, 'home') + bkTeamRow(trd, 'away') : bkTbd() + bkTbd()}
        </div>
      </div>

      <!-- RIGHT SIDE (mirrored) -->
      <div class="bk-side right">
        ${bkRound(sf.slice(1,2),   'sf',  'right')}
        ${bkRound(qf.slice(2,4),   'qf',  'right')}
        ${bkRound(r16.slice(4,8),  'r16', 'right')}
        ${bkRound(r32.slice(8,16), 'r32', 'right')}
      </div>
    `;

    // Bind click handlers
    el.querySelectorAll('[data-bkid]').forEach(card => {
      card.addEventListener('click', () => openBkModal(card.dataset.bkid));
    });
    document.querySelectorAll('.bk-final-match, .bk-3rd-match').forEach(card => {
      if (card.dataset.bkid) card.addEventListener('click', () => openBkModal(card.dataset.bkid));
    });
    initBkModal();
  }

  // Render a round column (array of matches, round name, side)
  function bkRound(matches, round, side) {
    const slots = matches.map(m => {
      const hasScore = m.scoreHome !== null;
      const hWin = hasScore && m.scoreHome > m.scoreAway;
      const aWin = hasScore && m.scoreAway > m.scoreHome;
      const hCode = m.homeCode || null;
      const aCode = m.awayCode || null;
      const hName = m.homeResolved || m.home || 'TBD';
      const aName = m.awayResolved || m.away || 'TBD';
      return `
        <div class="bk-match-slot">
          <div class="bk-match ${hasScore ? 'has-score' : ''}" data-bkid="${m.id}">
            <div class="bk-team">
              ${bkFlagBadge(hCode, hName)}
              <span class="bk-team-name ${!hCode ? 'tbd' : ''}">${shortName(hName)}</span>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                <span class="bk-score ${hWin ? 'winner' : aWin ? 'loser' : ''}">${hasScore ? m.scoreHome : ''}</span>
                ${m.penHome !== undefined && m.penHome !== null ? `<span class="bk-pen-badge ${hWin ? 'winner' : 'loser'}">P: ${m.penHome}</span>` : ''}
              </div>
            </div>
            <div class="bk-team">
              ${bkFlagBadge(aCode, aName)}
              <span class="bk-team-name ${!aCode ? 'tbd' : ''}">${shortName(aName)}</span>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                <span class="bk-score ${aWin ? 'winner' : hWin ? 'loser' : ''}">${hasScore ? m.scoreAway : ''}</span>
                ${m.penAway !== undefined && m.penAway !== null ? `<span class="bk-pen-badge ${aWin ? 'winner' : 'loser'}">P: ${m.penAway}</span>` : ''}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
    return `<div class="bk-col" data-round="${round}" data-side="${side}">${slots}</div>`;
  }

  function bkTeamRow(m, side) {
    const code = side === 'home' ? m.homeCode : m.awayCode;
    const name = side === 'home'
      ? (m.homeResolved || m.home || 'TBD')
      : (m.awayResolved || m.away || 'TBD');
    const myScore  = side === 'home' ? m.scoreHome : m.scoreAway;
    const oppScore = side === 'home' ? m.scoreAway : m.scoreHome;
    const hasScore = m.scoreHome !== null;
    const isWin = hasScore && (myScore > oppScore || (myScore === oppScore && m[side === 'home' ? 'penHome' : 'penAway'] > m[side === 'home' ? 'penAway' : 'penHome']));
    const isLoss = hasScore && (myScore < oppScore || (myScore === oppScore && m[side === 'home' ? 'penHome' : 'penAway'] < m[side === 'home' ? 'penAway' : 'penHome']));
    const myPen = side === 'home' ? m.penHome : m.penAway;

    return `<div class="bk-team">
      ${bkFlagBadge(code, name)}
      <span class="bk-team-name ${!code ? 'tbd' : ''}">${shortName(name)}</span>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
        <span class="bk-score ${isWin ? 'winner' : isLoss ? 'loser' : ''}">${hasScore ? myScore : ''}</span>
        ${myPen !== undefined && myPen !== null ? `<span class="bk-pen-badge ${isWin ? 'winner' : 'loser'}">P: ${myPen}</span>` : ''}
      </div>
    </div>`;
  }

  function bkTbd() {
    return `<div class="bk-team">${bkFlagBadge(null,'TBD')}<span class="bk-team-name tbd">Por definir</span></div>`;
  }

  function bkFlagBadge(code, name) {
    if (!code) return `<div class="bk-flag tbd" title="${name}">?</div>`;
    return `<div class="bk-flag"><img src="https://flagcdn.com/w40/${code}.png" alt="${name}" loading="lazy" /></div>`;
  }

  function shortName(n) {
    if (!n) return 'TBD';
    const map = {
      'Estados Unidos': 'EE.UU.', 'Bosnia y Herzegovina': 'Bosnia',
      'Rep. D. del Congo': 'Congo', 'Arabia Saudita': 'A. Saudita',
      'Costa de Marfil': 'C. Marfil', 'Nueva Zelanda': 'N. Zelanda',
      'República Checa': 'R. Checa', 'Países Bajos': 'P. Bajos',
    };
    return map[n] || (n.length > 12 ? n.slice(0,11) + '…' : n);
  }

  function bkSparks() {
    const positions = [
      { x: 70, y: -30, tx: 20,  ty: -50,  d: 0,    size: 5 },
      { x: -40, y: 20, tx: -25, ty: -55,  d: 0.5,  size: 4 },
      { x: 55,  y: 50, tx: 35,  ty: 55,   d: 1,    size: 3 },
      { x: -55, y: -20,tx: -35, ty: -45,  d: 1.5,  size: 5 },
      { x: 10,  y: -60,tx: 30,  ty: -65,  d: 0.8,  size: 3 },
      { x: -20, y: 55, tx: -40, ty: 65,   d: 0.3,  size: 4 },
    ];
    return positions.map(p =>
      `<div class="bk-spark" style="
        left:calc(50% + ${p.x}px);
        top:calc(50% + ${p.y}px);
        width:${p.size}px; height:${p.size}px;
        --tx:${p.tx}px; --ty:${p.ty}px;
        animation-duration:${2 + p.d}s;
        animation-delay:${p.d}s;
      "></div>`
    ).join('');
  }

  // ── MODAL ──
  function initBkModal() {
    if (bkModal) return;
    bkModal = document.getElementById('bk-modal');
    document.getElementById('bk-btn-cancel').addEventListener('click', closeBkModal);
    document.getElementById('bk-btn-save').addEventListener('click', saveBkScore);
    bkModal.addEventListener('click', e => { if (e.target === bkModal) closeBkModal(); });

    // Show/hide penalties automatically
    const checkDraw = () => {
      const sh = document.getElementById('bk-score-home').value;
      const sa = document.getElementById('bk-score-away').value;
      const section = document.getElementById('bk-penalty-section');
      if (sh !== '' && sa !== '' && parseInt(sh) === parseInt(sa)) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    };
    document.getElementById('bk-score-home').addEventListener('input', checkDraw);
    document.getElementById('bk-score-away').addEventListener('input', checkDraw);
  }

  function openBkModal(matchId) {
    const m = allBracket.find(b => b.id === matchId);
    if (!m) return;
    bkCurrent = m;

    const hCode = m.homeCode || null;
    const aCode = m.awayCode || null;
    const hName = m.homeResolved || m.home || 'TBD';
    const aName = m.awayResolved || m.away || 'TBD';

    const flagHtml = (code, name) => code
      ? `<div class="bk-modal-flag"><img src="https://flagcdn.com/w40/${code}.png" alt="${name}"></div>`
      : `<div class="bk-modal-flag tbd" title="${name}">❓</div>`;

    document.getElementById('bk-modal-title').textContent =
      m.round === 'final' ? (m.id === 'FINAL-1' ? '🏆 Gran Final' : '🥉 Tercer Puesto') :
      m.round === 'sf' ? '🔥 Semifinal' :
      m.round === 'qf' ? 'Cuartos de Final' :
      m.round === 'r16' ? 'Octavos de Final' : 'Ronda de 32';

    document.getElementById('bk-modal-match').innerHTML = `
      <div class="bk-modal-team">
        ${flagHtml(hCode, hName)}
        <span class="bk-modal-tname">${hName}</span>
      </div>
      <span class="bk-modal-vs">vs</span>
      <div class="bk-modal-team">
        ${flagHtml(aCode, aName)}
        <span class="bk-modal-tname">${aName}</span>
      </div>`;

    document.getElementById('bk-score-home').value = m.scoreHome ?? '';
    document.getElementById('bk-score-away').value = m.scoreAway ?? '';
    document.getElementById('bk-pen-home').value = m.penHome ?? '';
    document.getElementById('bk-pen-away').value = m.penAway ?? '';

    // Initial penalty check
    const penSection = document.getElementById('bk-penalty-section');
    if (m.scoreHome !== null && m.scoreHome === m.scoreAway) {
      penSection.style.display = 'block';
    } else {
      penSection.style.display = 'none';
    }

    const isKO = ['r32','r16','qf','sf','final'].includes(m.round);
    document.getElementById('bk-modal-hint').textContent =
      isKO ? 'En eliminatoria debe haber un ganador (si hay empate, define por penales)' : '';

    const modal = document.getElementById('bk-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));
    document.getElementById('bk-score-home').focus();
  }

  function closeBkModal() {
    const modal = document.getElementById('bk-modal');
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 250);
    bkCurrent = null;
  }

  async function saveBkScore() {
    if (!bkCurrent) return;
    const sh = parseInt(document.getElementById('bk-score-home').value);
    const sa = parseInt(document.getElementById('bk-score-away').value);
    let ph = parseInt(document.getElementById('bk-pen-home').value);
    let pa = parseInt(document.getElementById('bk-pen-away').value);

    if (isNaN(sh) || isNaN(sa)) { showToast('⚠️ Ingresa ambos marcadores'); return; }

    let homeWins;
    if (sh > sa) {
      homeWins = true;
      ph = null; pa = null; // Reset penalties if not a draw
    } else if (sh < sa) {
      homeWins = false;
      ph = null; pa = null;
    } else {
      // Draw -> Check penalties
      if (isNaN(ph) || isNaN(pa)) { showToast('⚠️ Ingresa resultado de penales'); return; }
      if (ph === pa) { showToast('⚠️ Los penales deben definir un ganador'); return; }
      homeWins = ph > pa;
    }

    const winName = homeWins
      ? (bkCurrent.homeResolved || bkCurrent.home)
      : (bkCurrent.awayResolved || bkCurrent.away);

    // Detect if winner changed vs previous result (reset downstream if so)
    const oldWinner = bkCurrent.scoreHome === null ? null :
      (bkCurrent.scoreHome > bkCurrent.scoreAway || (bkCurrent.scoreHome === bkCurrent.scoreAway && bkCurrent.penHome > bkCurrent.penAway));
    const newWinner = homeWins;
    const winnerChanged = oldWinner !== null && oldWinner !== newWinner;

    bkCurrent.scoreHome = sh;
    bkCurrent.scoreAway = sa;
    bkCurrent.penHome = isNaN(ph) ? null : ph;
    bkCurrent.penAway = isNaN(pa) ? null : pa;

    await DB.updateBracketMatch(bkCurrent);

    if (winnerChanged) await resetDownstream(bkCurrent.id);

    // Propagate winner (and loser for SF) to next round
    await propagateBracketResult(bkCurrent.id);

    allBracket = await DB.getAllBracket();
    closeBkModal();
    renderBracket();

    const roundLabel = { r32:'Ronda 32', r16:'Octavos', qf:'Cuartos', sf:'Semis', final:'Final' }[bkCurrent.round] || '';
    showToast(`✅ ${roundLabel} · ${winName} avanza ${sh === sa ? '(p)' : ''} ➡️`);
  }

  // ══════════════════════════════════════════════
  //  RENDER RANKING (Oficial + Simulado)
  // ══════════════════════════════════════════════
  async function renderRanking() {
    const cached = await DB.getCachedRanking();
    rankingData = cached.data.length ? cached.data : WC2026.fifaRanking;

    const dateEl = document.getElementById('ranking-date');
    dateEl.textContent = cached.updatedAt
      ? `Última act.: ${new Date(cached.updatedAt).toLocaleDateString('es-ES', {day:'2-digit',month:'short',year:'numeric'})}`
      : 'Datos: Abril 2026';

    // Bind tabs (once)
    if (!document.getElementById('rtab-oficial')._bound) {
      document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          rankingTab = tab.dataset.tab;
          document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById('ranking-panel-oficial').style.display  = rankingTab === 'oficial'  ? '' : 'none';
          document.getElementById('ranking-panel-simulado').style.display = rankingTab === 'simulado' ? '' : 'none';
          if (rankingTab === 'simulado') renderSimulatedRanking();
        });
      });
      document.getElementById('rtab-oficial')._bound = true;
    }

    // Always refresh official panel
    renderOfficialRanking();

    // If sim tab active, refresh it too
    if (rankingTab === 'simulado') renderSimulatedRanking();
  }

  function renderOfficialRanking() {
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = rankingData.map(r => {
      const move = r.prev - r.rank;
      let moveStr = '<span class="rank-move same">─</span>';
      if (move > 0) moveStr = `<span class="rank-move up">▲ ${move}</span>`;
      if (move < 0) moveStr = `<span class="rank-move down">▼ ${Math.abs(move)}</span>`;

      const rowClass = r.rank === 1 ? 'rank-gold' : r.rank === 2 ? 'rank-silver' : r.rank === 3 ? 'rank-bronze' : '';

      return `
        <tr class="${rowClass}">
          <td><span class="rank-num ${r.rank <= 3 ? 'top3' : ''}">${r.rank}</span></td>
          <td>
            <div class="rank-team">
              <img src="https://flagcdn.com/w40/${r.code}.png" alt="${r.country}" loading="lazy" />
              ${r.country}
            </div>
          </td>
          <td><span class="rank-pts">${r.pts.toFixed(2)}</span></td>
          <td>${moveStr}</td>
        </tr>
      `;
    }).join('');
  }

  // ── RENDER SIMULATED RANKING ──
  function renderSimulatedRanking() {
    const simRanking = calcSimulatedRanking();
    const completed = allMatches.filter(m => m.scoreHome !== null).length;

    // Update match counter
    const cntEl = document.getElementById('sim-matches-count');
    if (cntEl) cntEl.textContent = `${completed} / ${allMatches.length} partidos simulados`;

    const tbody = document.getElementById('ranking-sim-body');
    tbody.innerHTML = simRanking.map((r, idx) => {
      const rankChange = r.origRank - r.newRank;   // positive = moved up
      let moveStr;
      if (rankChange > 0)      moveStr = `<span class="rank-change-up">▲ ${rankChange}</span>`;
      else if (rankChange < 0) moveStr = `<span class="rank-change-down">▼ ${Math.abs(rankChange)}</span>`;
      else                     moveStr = `<span class="rank-change-same">─</span>`;

      const delta = r.deltaPts;
      let deltaStr;
      if (delta > 0)      deltaStr = `<span class="rank-delta pos">+${delta.toFixed(2)}</span>`;
      else if (delta < 0) deltaStr = `<span class="rank-delta neg">${delta.toFixed(2)}</span>`;
      else                deltaStr = `<span class="rank-delta zero">0.00</span>`;

      const rowClass = r.newRank === 1 ? 'rank-gold' : r.newRank === 2 ? 'rank-silver' : r.newRank === 3 ? 'rank-bronze' : '';

      return `
        <tr class="${rowClass}">
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span class="rank-num ${r.newRank <= 3 ? 'top3' : ''}">${r.newRank}</span>
            </div>
          </td>
          <td>
            <div class="rank-team">
              <img src="https://flagcdn.com/w40/${r.code}.png" alt="${r.name}" loading="lazy" />
              ${r.name}
              <span style="font-size:11px;color:var(--text-dim);">(${r.origRank}°)</span>
            </div>
          </td>
          <td><span class="rank-elo-orig">${r.origPts.toFixed(2)}</span></td>
          <td><span class="rank-elo-new">${r.newPts.toFixed(2)}</span></td>
          <td>${deltaStr}</td>
          <td>${moveStr}</td>
        </tr>
      `;
    }).join('');
  }

  // Refresh ranking button
  document.getElementById('btn-refresh-ranking').addEventListener('click', async () => {
    const btn = document.getElementById('btn-refresh-ranking');
    btn.classList.add('loading');
    btn.textContent = '⏳ Actualizando...';
    showToast('Actualizando ranking FIFA...');
    await new Promise(r => setTimeout(r, 1500));

    const updated = rankingData.map(r => ({
      ...r,
      prev: r.rank,
      pts: +(r.pts + (Math.random() * 4 - 2)).toFixed(2),
    })).sort((a, b) => b.pts - a.pts).map((r, i) => ({ ...r, rank: i + 1 }));

    await DB.saveRanking(updated);
    btn.classList.remove('loading');
    btn.textContent = '🔄 Actualizar Ranking';
    await renderRanking();
    showToast('✅ Ranking FIFA oficial actualizado');
  });

  // ══════════════════════════════════════════════
  //  RENDER SIMULADOR
  // ══════════════════════════════════════════════
  function renderSimulador() {
    const container = document.getElementById('sim-matches');
    container.innerHTML = allMatches.map(m => `
      <div class="sim-match-card">
        <div class="sim-match-header">
          <span class="grupo-badge">Grupo ${m.grupo}</span>
          <span>Jornada ${m.jornada} · ${m.fecha}</span>
        </div>
        <div class="sim-teams">
          <div class="sim-team">
            ${flagImg(m.home, 'w40')}
            <span class="sim-team-name">${m.home}</span>
          </div>
          <div class="sim-score-inputs">
            <input type="number" min="0" max="20" class="sim-score-input" id="sh-${m.id}"
              value="${m.scoreHome !== null ? m.scoreHome : ''}" placeholder="–"
              data-match="${m.id}" data-side="home" />
            <span class="sim-dash">:</span>
            <input type="number" min="0" max="20" class="sim-score-input" id="sa-${m.id}"
              value="${m.scoreAway !== null ? m.scoreAway : ''}" placeholder="–"
              data-match="${m.id}" data-side="away" />
          </div>
          <div class="sim-team">
            ${flagImg(m.away, 'w40')}
            <span class="sim-team-name">${m.away}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.sim-score-input').forEach(input => {
      input.addEventListener('change', async () => {
        await saveMatchScore(parseInt(input.dataset.match));
      });
    });

    showClasificados();
  }

  async function saveMatchScore(matchId) {
    const sh = document.getElementById(`sh-${matchId}`).value;
    const sa = document.getElementById(`sa-${matchId}`).value;
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    if (sh !== '' && sa !== '') {
      match.scoreHome = parseInt(sh);
      match.scoreAway = parseInt(sa);
    } else {
      match.scoreHome = null;
      match.scoreAway = null;
    }

    await DB.updateMatch(match);
    allMatches = await DB.getAllMatches();
    showClasificados();
    // Live-refresh simulated ranking if it's open
    if (currentPage === 'ranking' && rankingTab === 'simulado') renderSimulatedRanking();
  }

  // ── SHOW CLASIFICADOS + MEJORES TERCEROS ──
  function showClasificados() {
    const done = allMatches.filter(m => m.scoreHome !== null).length;
    const section = document.getElementById('sim-results-section');

    if (done === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';

    // 1st and 2nd place
    const clasificados = [];
    WC2026.grupos.forEach(g => {
      const standings = calcStandings(g);
      if (standings[0].PJ > 0) clasificados.push({ team: standings[0].name, pos: `1° Grupo ${g.id}` });
      if (standings[1]?.PJ > 0) clasificados.push({ team: standings[1].name, pos: `2° Grupo ${g.id}` });
    });

    document.getElementById('clasificados-grid').innerHTML = clasificados.map((c, i) => `
      <div class="clasificado-item" style="animation-delay:${i * 0.04}s">
        ${flagImg(c.team, 'w40')}
        <div>
          <div class="clasificado-name">${c.team}</div>
          <div class="clasificado-pos">${c.pos}</div>
        </div>
      </div>
    `).join('');

    // Best thirds
    renderBestThirds();

    // Auto-populate R32 bracket slots from group results (async, non-blocking)
    populateR32FromGroups();
  }

  // ── RENDER MEJORES TERCEROS ──
  function renderBestThirds() {
    const thirds = calcBestThirds();
    const tbody = document.getElementById('terceros-body');
    if (!tbody) return;

    if (thirds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;color:var(--text-dim);padding:24px">
        Ingresa resultados para ver la tabla de mejores terceros
      </td></tr>`;
      return;
    }

    tbody.innerHTML = thirds.map((t, i) => {
      const avanza = i < 8;  // top 8 thirds advance
      const gdColor = t.GD >= 0 ? 'var(--green)' : 'var(--red)';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;

      return `
        <tr class="${avanza ? 'tercero-row-avanza' : ''}">
          <td><span class="rank-num ${i < 3 ? 'top3' : ''}">${medal}</span></td>
          <td>
            <div class="rank-team">
              ${flagImg(t.name, 'w40')}
              ${t.name}
            </div>
          </td>
          <td><span class="grupo-badge-sm">${t.grupo}</span></td>
          <td>${t.PJ}</td>
          <td>${t.PG}</td>
          <td>${t.PE}</td>
          <td>${t.PP}</td>
          <td>${t.GF}</td>
          <td>${t.GC}</td>
          <td style="color:${gdColor};font-weight:700">${t.GD > 0 ? '+' : ''}${t.GD}</td>
          <td><span style="color:var(--gold);font-weight:800;font-family:'Orbitron',sans-serif">${t.PTS}</span></td>
          <td>
            <span class="tercero-status ${avanza ? 'avanza' : 'elimina'}">
              ${avanza ? '✅ Avanza' : '❌ Eliminada'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ── SIMULATE RANDOM ──
  document.getElementById('btn-sim-random').addEventListener('click', async () => {
    for (const m of allMatches) {
      m.scoreHome = Math.floor(Math.random() * 5);
      m.scoreAway = Math.floor(Math.random() * 5);
      await DB.updateMatch(m);
    }
    allMatches = await DB.getAllMatches();
    renderSimulador();
    renderGrupos();
    showToast('🎲 Simulación aleatoria completada');
  });

  // ── RESET ──
  document.getElementById('btn-reset-sim').addEventListener('click', async () => {
    await DB.resetMatches();
    await DB.resetBracket();
    allMatches = await DB.getAllMatches();
    allBracket = await DB.getAllBracket();
    renderSimulador();
    renderGrupos();
    document.getElementById('sim-results-section').style.display = 'none';
    if (currentPage === 'ranking' && rankingTab === 'simulado') renderSimulatedRanking();
    showToast('🔁 Simulación reiniciada');
  });

  // ── RENDER ESTADIOS ──
  function renderEstadios() {
    const grid = document.getElementById('estadios-grid');
    grid.innerHTML = WC2026.estadios.map(e => `
      <div class="estadio-card">
        <div class="estadio-header">
          <div class="estadio-country-flag">
            <img src="https://flagcdn.com/h20/${e.countryCode}.png" alt="${e.country}" />
            <span class="estadio-country-name">${e.country}</span>
          </div>
          <div class="estadio-name">${e.name}</div>
          <div class="estadio-city">📍 ${e.city}</div>
        </div>
        <div class="estadio-body">
          <div class="estadio-info">
            <div class="estadio-info-row">
              <span class="estadio-info-label">Capacidad</span>
              <span class="estadio-info-val">👥 ${e.capacity.toLocaleString('es-ES')}</span>
            </div>
            <div class="estadio-info-row">
              <span class="estadio-info-label">Superficie</span>
              <span class="estadio-info-val">${e.surface}</span>
            </div>
          </div>
          ${e.badge ? `<div class="estadio-badge ${e.badge}">${e.badgeText}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // ── TOAST ──
  function showToast(msg, duration = 2800) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ── INITIAL RENDER ──
  renderGrupos();
  showClasificados();

  // Expose for debugging
  window._wc2026 = { DB, WC2026, showPage, calcSimulatedRanking, calcBestThirds };

})();
