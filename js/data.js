// =====================================================
//  FIFA WORLD CUP 2026 — DATA FILE
//  Groups, Teams, Fixtures, Venues, Rankings
// =====================================================

const WC2026 = {

  // ── ISO country codes for flags (flagcdn.com) ──
  flagCode: {
    'México': 'mx', 'Sudáfrica': 'za', 'Corea del Sur': 'kr', 'República Checa': 'cz',
    'Canadá': 'ca', 'Bosnia y Herzegovina': 'ba', 'Qatar': 'qa', 'Suiza': 'ch',
    'Brasil': 'br', 'Marruecos': 'ma', 'Haití': 'ht', 'Escocia': 'gb-sct',
    'Estados Unidos': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turquía': 'tr',
    'Alemania': 'de', 'Curazao': 'cw', 'Costa de Marfil': 'ci', 'Ecuador': 'ec',
    'Países Bajos': 'nl', 'Japón': 'jp', 'Túnez': 'tn', 'Suecia': 'se',
    'Bélgica': 'be', 'Egipto': 'eg', 'Irán': 'ir', 'Nueva Zelanda': 'nz',
    'España': 'es', 'Cabo Verde': 'cv', 'Arabia Saudita': 'sa', 'Uruguay': 'uy',
    'Francia': 'fr', 'Senegal': 'sn', 'Irak': 'iq', 'Noruega': 'no',
    'Argentina': 'ar', 'Argelia': 'dz', 'Austria': 'at', 'Jordania': 'jo',
    'Portugal': 'pt', 'Rep. D. del Congo': 'cd', 'Uzbekistán': 'uz', 'Colombia': 'co',
    'Inglaterra': 'gb-eng', 'Croacia': 'hr', 'Ghana': 'gh', 'Panamá': 'pa',
    // Host reference
    'USA': 'us',
  },

  flagUrl(country) {
    const code = this.flagCode[country] || 'un';
    return `https://flagcdn.com/w40/${code}.png`;
  },

  // ── GROUPS ──
  grupos: [
    {
      id: 'A', sede: 'Ciudad de México',
      equipos: ['México', 'Sudáfrica', 'Corea del Sur', 'República Checa']
    },
    {
      id: 'B', sede: 'Toronto / Vancouver',
      equipos: ['Canadá', 'Bosnia y Herzegovina', 'Qatar', 'Suiza']
    },
    {
      id: 'C', sede: 'Los Ángeles',
      equipos: ['Brasil', 'Marruecos', 'Haití', 'Escocia']
    },
    {
      id: 'D', sede: 'Dallas / Houston',
      equipos: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía']
    },
    {
      id: 'E', sede: 'Guadalajara / Monterrey',
      equipos: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador']
    },
    {
      id: 'F', sede: 'Nueva York / Boston',
      equipos: ['Países Bajos', 'Japón', 'Túnez', 'Suecia']
    },
    {
      id: 'G', sede: 'San Francisco / Seattle',
      equipos: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda']
    },
    {
      id: 'H', sede: 'Miami / Atlanta',
      equipos: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay']
    },
    {
      id: 'I', sede: 'Filadelfia / Kansas City',
      equipos: ['Francia', 'Senegal', 'Irak', 'Noruega']
    },
    {
      id: 'J', sede: 'Dallas / Houston',
      equipos: ['Argentina', 'Argelia', 'Austria', 'Jordania']
    },
    {
      id: 'K', sede: 'Los Ángeles / Seattle',
      equipos: ['Portugal', 'Rep. D. del Congo', 'Uzbekistán', 'Colombia']
    },
    {
      id: 'L', sede: 'Nueva York / Boston',
      equipos: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá']
    },
  ],

  // ── FIXTURE (group stage matches) ──
  // Jornada 1: partidos 1-2, Jornada 2: 3-4, Jornada 3: 5-6...
  // Simplified: each group has 6 matches (round-robin), 3 per jornada
  generateFixture() {
    const fixture = [];
    let matchId = 1;

    const jornada1Dates = [
      'Miércoles 11 Jun', 'Jueves 12 Jun', 'Viernes 13 Jun',
      'Sábado 14 Jun', 'Domingo 15 Jun', 'Lunes 16 Jun'
    ];
    const jornada2Dates = [
      'Martes 17 Jun', 'Miércoles 18 Jun', 'Jueves 19 Jun',
      'Viernes 20 Jun', 'Sábado 21 Jun', 'Domingo 22 Jun'
    ];
    const jornada3Dates = [
      'Lunes 23 Jun', 'Martes 24 Jun', 'Miércoles 25 Jun',
      'Jueves 26 Jun', 'Viernes 27 Jun', 'Sábado 28 Jun' 
    ];

    this.grupos.forEach((grupo, gIdx) => {
      const [t1, t2, t3, t4] = grupo.equipos;

      // Jornada 1
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 1, home: t1, away: t2, fecha: jornada1Dates[gIdx % 6], scoreHome: null, scoreAway: null });
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 1, home: t3, away: t4, fecha: jornada1Dates[gIdx % 6], scoreHome: null, scoreAway: null });

      // Jornada 2
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 2, home: t1, away: t3, fecha: jornada2Dates[gIdx % 6], scoreHome: null, scoreAway: null });
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 2, home: t2, away: t4, fecha: jornada2Dates[gIdx % 6], scoreHome: null, scoreAway: null });

      // Jornada 3
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 3, home: t1, away: t4, fecha: jornada3Dates[gIdx % 6], scoreHome: null, scoreAway: null });
      fixture.push({ id: matchId++, grupo: grupo.id, jornada: 3, home: t2, away: t3, fecha: jornada3Dates[gIdx % 6], scoreHome: null, scoreAway: null });
    });

    return fixture;
  },

  // ── FIFA RANKING OFICIAL (Abril 2026) — todos los 48 equipos del mundial ──
  // Sistema Elo FIFA (desde 2018): Rn = Ro + I × (W − We)
  // I (K-factor): Grupos WC=50, Cuartos+ WC=60 | We = 1/(10^(-dr/600)+1)
  fifaRanking: [
    { rank: 1,  country: 'Francia',              pts: 1877.32, prev: 1,  code: 'fr'     },
    { rank: 2,  country: 'España',                pts: 1876.40, prev: 2,  code: 'es'     },
    { rank: 3,  country: 'Argentina',             pts: 1874.81, prev: 5,  code: 'ar'     },
    { rank: 4,  country: 'Inglaterra',            pts: 1825.97, prev: 4,  code: 'gb-eng' },
    { rank: 5,  country: 'Portugal',              pts: 1763.83, prev: 5,  code: 'pt'     },
    { rank: 6,  country: 'Brasil',                pts: 1761.16, prev: 7,  code: 'br'     },
    { rank: 7,  country: 'Países Bajos',          pts: 1757.87, prev: 7,  code: 'nl'     },
    { rank: 8,  country: 'Marruecos',             pts: 1755.87, prev: 13, code: 'ma'     },
    { rank: 9,  country: 'Bélgica',               pts: 1734.71, prev: 3,  code: 'be'     },
    { rank: 10, country: 'Alemania',              pts: 1730.37, prev: 14, code: 'de'     },
    { rank: 11, country: 'Colombia',              pts: 1707.92, prev: 11, code: 'co'     },
    { rank: 12, country: 'Estados Unidos',        pts: 1705.44, prev: 12, code: 'us'     },
    { rank: 13, country: 'Uruguay',               pts: 1703.81, prev: 17, code: 'uy'     },
    { rank: 14, country: 'Croacia',               pts: 1693.26, prev: 9,  code: 'hr'     },
    { rank: 15, country: 'México',                pts: 1680.10, prev: 15, code: 'mx'     },
    { rank: 16, country: 'Japón',                 pts: 1678.55, prev: 16, code: 'jp'     },
    { rank: 17, country: 'Suiza',                 pts: 1671.23, prev: 18, code: 'ch'     },
    { rank: 18, country: 'Senegal',               pts: 1665.90, prev: 19, code: 'sn'     },
    { rank: 19, country: 'Ecuador',               pts: 1659.45, prev: 20, code: 'ec'     },
    { rank: 20, country: 'Australia',             pts: 1651.08, prev: 23, code: 'au'     },
    { rank: 21, country: 'Austria',               pts: 1638.90, prev: 22, code: 'at'     },
    { rank: 22, country: 'Corea del Sur',         pts: 1632.15, prev: 22, code: 'kr'     },
    { rank: 23, country: 'Turquía',               pts: 1627.44, prev: 26, code: 'tr'     },
    { rank: 24, country: 'Irán',                  pts: 1621.80, prev: 21, code: 'ir'     },
    { rank: 25, country: 'Suecia',                pts: 1618.50, prev: 24, code: 'se'     },
    { rank: 26, country: 'Noruega',               pts: 1615.72, prev: 28, code: 'no'     },
    { rank: 27, country: 'Paraguay',              pts: 1609.38, prev: 29, code: 'py'     },
    { rank: 28, country: 'Escocia',               pts: 1603.11, prev: 29, code: 'gb-sct' },
    { rank: 29, country: 'Canadá',                pts: 1598.44, prev: 33, code: 'ca'     },
    { rank: 30, country: 'Túnez',                 pts: 1594.00, prev: 30, code: 'tn'     },
    { rank: 31, country: 'Ghana',                 pts: 1590.77, prev: 34, code: 'gh'     },
    { rank: 32, country: 'Egipto',                pts: 1588.22, prev: 32, code: 'eg'     },
    { rank: 33, country: 'Argelia',               pts: 1584.60, prev: 36, code: 'dz'     },
    { rank: 34, country: 'Arabia Saudita',        pts: 1578.18, prev: 35, code: 'sa'     },
    { rank: 35, country: 'Costa de Marfil',       pts: 1572.34, prev: 37, code: 'ci'     },
    { rank: 36, country: 'Panamá',                pts: 1568.90, prev: 38, code: 'pa'     },
    { rank: 37, country: 'Bosnia y Herzegovina',  pts: 1562.55, prev: 40, code: 'ba'     },
    { rank: 38, country: 'Jordania',              pts: 1558.30, prev: 41, code: 'jo'     },
    { rank: 39, country: 'Irak',                  pts: 1554.12, prev: 39, code: 'iq'     },
    { rank: 40, country: 'Sudáfrica',             pts: 1548.60, prev: 42, code: 'za'     },
    { rank: 41, country: 'Uzbekistán',            pts: 1545.67, prev: 45, code: 'uz'     },
    { rank: 42, country: 'Haití',                 pts: 1540.21, prev: 44, code: 'ht'     },
    { rank: 43, country: 'Qatar',                 pts: 1536.80, prev: 43, code: 'qa'     },
    { rank: 44, country: 'Cabo Verde',            pts: 1532.45, prev: 46, code: 'cv'     },
    { rank: 45, country: 'Nueva Zelanda',         pts: 1528.10, prev: 47, code: 'nz'     },
    { rank: 46, country: 'Curazao',               pts: 1523.77, prev: 50, code: 'cw'     },
    { rank: 47, country: 'Rep. D. del Congo',     pts: 1519.22, prev: 48, code: 'cd'     },
    { rank: 48, country: 'República Checa',       pts: 1514.88, prev: 48, code: 'cz'     },
  ],

  // ── FIFA ELO CALCULATOR ──
  // Fórmula oficial FIFA (desde agosto 2018):
  //   Rn = Ro + I × (W − We)
  //   W  = Resultado real  (Victoria=1, Empate=0.5, Derrota=0, PenaltyWin=0.75, PenaltyLoss=0.25)
  //   We = Resultado esperado = 1 / (10^(-dr/600) + 1)  donde dr = RoA − RoB
  //   I  = Peso del partido:
  //        Amistoso fuera venta.: 5 | Amistoso normal: 10 | Liga Naciones grupo: 15
  //        Clasificatorio WC/Cont.: 25 | Torneo continental (grupos): 35 | LN Final Four: 35
  //        Torneo continental (desde QF): 40 | WC grupos/R32/R16: 50 | WC QF-Final: 60
  calcElo(ratingA, ratingB, resultA, importance = 50) {
    const dr = ratingA - ratingB;
    const We = 1 / (Math.pow(10, -dr / 600) + 1);
    const delta = importance * (resultA - We);
    return {
      newA: +(ratingA + delta).toFixed(2),
      newB: +(ratingB - delta).toFixed(2),
      deltaA: +delta.toFixed(2),
      We: +We.toFixed(4),
    };
  },

  // ── VENUES ──
  estadios: [
    {
      name: 'Estadio Azteca', city: 'Ciudad de México', country: 'México', countryCode: 'mx',
      capacity: 87521, surface: 'Pasto natural', badge: 'opening',
      badgeText: 'Partido Inaugural'
    },
    {
      name: 'Estadio Guadalajara', city: 'Guadalajara', country: 'México', countryCode: 'mx',
      capacity: 49850, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Estadio Monterrey', city: 'Monterrey', country: 'México', countryCode: 'mx',
      capacity: 53500, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'MetLife Stadium', city: 'Nueva York / New Jersey', country: 'Estados Unidos', countryCode: 'us',
      capacity: 82500, surface: 'Pasto sintético / natural', badge: 'final',
      badgeText: '🏆 Sede de la Final'
    },
    {
      name: 'AT&T Stadium', city: 'Dallas', country: 'Estados Unidos', countryCode: 'us',
      capacity: 80000, surface: 'Pasto sintético', badge: null, badgeText: null
    },
    {
      name: 'Rose Bowl', city: 'Los Ángeles', country: 'Estados Unidos', countryCode: 'us',
      capacity: 92542, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Levi\'s Stadium', city: 'San Francisco / Bay Area', country: 'Estados Unidos', countryCode: 'us',
      capacity: 68500, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Hard Rock Stadium', city: 'Miami', country: 'Estados Unidos', countryCode: 'us',
      capacity: 65326, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'Estados Unidos', countryCode: 'us',
      capacity: 71000, surface: 'Pasto sintético', badge: null, badgeText: null
    },
    {
      name: 'Gillette Stadium', city: 'Boston', country: 'Estados Unidos', countryCode: 'us',
      capacity: 65878, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Lincoln Financial Field', city: 'Filadelfia', country: 'Estados Unidos', countryCode: 'us',
      capacity: 69176, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Lumen Field', city: 'Seattle', country: 'Estados Unidos', countryCode: 'us',
      capacity: 68740, surface: 'Pasto sintético', badge: null, badgeText: null
    },
    {
      name: 'NRG Stadium', city: 'Houston', country: 'Estados Unidos', countryCode: 'us',
      capacity: 72220, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'Arrowhead Stadium', city: 'Kansas City', country: 'Estados Unidos', countryCode: 'us',
      capacity: 76416, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'BMO Field', city: 'Toronto', country: 'Canadá', countryCode: 'ca',
      capacity: 45736, surface: 'Pasto natural', badge: null, badgeText: null
    },
    {
      name: 'BC Place', city: 'Vancouver', country: 'Canadá', countryCode: 'ca',
      capacity: 54500, surface: 'Pasto sintético', badge: null, badgeText: null
    },
  ],

  // ── BRACKET ROUNDS (R32 template) ──
  bracketRounds: {
    r32: {
      title: 'Ronda de 32',
      matches: [
        { id: 'R32-01', label: 'Partido 1', home: '1º Grupo A', away: '3º Mejor 1', homeCode: null, awayCode: null },
        { id: 'R32-02', label: 'Partido 2', home: '1º Grupo B', away: '3º Mejor 2', homeCode: null, awayCode: null },
        { id: 'R32-03', label: 'Partido 3', home: '1º Grupo C', away: '2º Grupo F', homeCode: null, awayCode: null },
        { id: 'R32-04', label: 'Partido 4', home: '1º Grupo D', away: '2º Grupo E', homeCode: null, awayCode: null },
        { id: 'R32-05', label: 'Partido 5', home: '1º Grupo E', away: '2º Grupo D', homeCode: null, awayCode: null },
        { id: 'R32-06', label: 'Partido 6', home: '1º Grupo F', away: '2º Grupo C', homeCode: null, awayCode: null },
        { id: 'R32-07', label: 'Partido 7', home: '1º Grupo G', away: '3º Mejor 3', homeCode: null, awayCode: null },
        { id: 'R32-08', label: 'Partido 8', home: '1º Grupo H', away: '3º Mejor 4', homeCode: null, awayCode: null },
        { id: 'R32-09', label: 'Partido 9', home: '1º Grupo I', away: '3º Mejor 5', homeCode: null, awayCode: null },
        { id: 'R32-10', label: 'Partido 10', home: '1º Grupo J', away: '3º Mejor 6', homeCode: null, awayCode: null },
        { id: 'R32-11', label: 'Partido 11', home: '1º Grupo K', away: '2º Grupo L', homeCode: null, awayCode: null },
        { id: 'R32-12', label: 'Partido 12', home: '1º Grupo L', away: '2º Grupo K', homeCode: null, awayCode: null },
        { id: 'R32-13', label: 'Partido 13', home: '2º Grupo A', away: '2º Grupo B', homeCode: null, awayCode: null },
        { id: 'R32-14', label: 'Partido 14', home: '2º Grupo G', away: '2º Grupo H', homeCode: null, awayCode: null },
        { id: 'R32-15', label: 'Partido 15', home: '2º Grupo I', away: '2º Grupo J', homeCode: null, awayCode: null },
        { id: 'R32-16', label: 'Partido 16', home: '3º Mejor 7', away: '3º Mejor 8', homeCode: null, awayCode: null },
      ]
    },
    r16: {
      title: 'Octavos de Final',
      matches: Array.from({length: 8}, (_, i) => ({
        id: `R16-0${i+1}`, label: `Octavos ${i+1}`, home: `Ganador R32-${String(i*2+1).padStart(2,'0')}`,
        away: `Ganador R32-${String(i*2+2).padStart(2,'0')}`, homeCode: null, awayCode: null
      }))
    },
    qf: {
      title: 'Cuartos de Final',
      matches: Array.from({length: 4}, (_, i) => ({
        id: `QF-0${i+1}`, label: `Cuarto ${i+1}`, home: `Ganador R16-0${i*2+1}`,
        away: `Ganador R16-0${i*2+2}`, homeCode: null, awayCode: null
      }))
    },
    sf: {
      title: 'Semifinales',
      matches: [
        { id: 'SF-01', label: 'Semifinal 1 · 14 Jul', home: 'Ganador QF-01', away: 'Ganador QF-02', homeCode: null, awayCode: null },
        { id: 'SF-02', label: 'Semifinal 2 · 15 Jul', home: 'Ganador QF-03', away: 'Ganador QF-04', homeCode: null, awayCode: null },
      ]
    },
    final: {
      title: 'Gran Final · MetLife Stadium',
      matches: [
        { id: 'FINAL-3', label: '🥉 Tercer Puesto · 18 Jul', home: 'Perdedor SF-01', away: 'Perdedor SF-02', homeCode: null, awayCode: null },
        { id: 'FINAL-1', label: '🏆 Gran Final · 19 Jul', home: 'Ganador SF-01', away: 'Ganador SF-02', homeCode: null, awayCode: null },
      ]
    }
  }
};

// Global expose for modules
window.WC2026 = WC2026;
