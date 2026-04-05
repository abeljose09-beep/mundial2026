// =====================================================
//  FIFA WORLD CUP 2026 — IndexedDB DATABASE LAYER
//  Provides persistent storage for scores and results
// =====================================================

const DB = (() => {
  const DB_NAME = 'WorldCup2026';
  const DB_VERSION = 2;   // bumped: forces re-seed of ranking with corrected 48 WC teams
  let db = null;

  const STORES = {
    MATCHES: 'matches',
    BRACKET: 'bracket',
    SETTINGS: 'settings',
    RANKING: 'ranking',
  };

  // ── OPEN / INIT ──
  function open() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const idb = e.target.result;

        if (!idb.objectStoreNames.contains(STORES.MATCHES)) {
          const matchStore = idb.createObjectStore(STORES.MATCHES, { keyPath: 'id' });
          matchStore.createIndex('grupo', 'grupo', { unique: false });
          matchStore.createIndex('jornada', 'jornada', { unique: false });
        }

        if (!idb.objectStoreNames.contains(STORES.BRACKET)) {
          idb.createObjectStore(STORES.BRACKET, { keyPath: 'id' });
        }

        if (!idb.objectStoreNames.contains(STORES.SETTINGS)) {
          idb.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        if (!idb.objectStoreNames.contains(STORES.RANKING)) {
          idb.createObjectStore(STORES.RANKING, { keyPath: 'rank' });
        }
      };

      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };

      req.onerror = () => reject(req.error);
    });
  }

  // ── GENERIC HELPERS ──
  function tx(storeName, mode = 'readonly') {
    return db.transaction([storeName], mode).objectStore(storeName);
  }

  function getAll(storeName) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function getOne(storeName, key) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function putOne(storeName, obj) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName, 'readwrite').put(obj);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function putMany(storeName, items) {
    return new Promise((resolve, reject) => {
      const store = tx(storeName, 'readwrite');
      let count = 0;
      if (items.length === 0) { resolve(); return; }
      items.forEach(item => {
        const req = store.put(item);
        req.onsuccess = () => { count++; if (count === items.length) resolve(); };
        req.onerror = () => reject(req.error);
      });
    });
  }

  function clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName, 'readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ── MATCHES ──
  async function initMatches() {
    const existing = await getAll(STORES.MATCHES);
    if (existing.length === 0) {
      const fixture = WC2026.generateFixture();
      await putMany(STORES.MATCHES, fixture);
    }
  }

  async function getAllMatches() {
    return getAll(STORES.MATCHES);
  }

  async function updateMatch(match) {
    return putOne(STORES.MATCHES, match);
  }

  async function resetMatches() {
    await clearStore(STORES.MATCHES);
    const fixture = WC2026.generateFixture();
    await putMany(STORES.MATCHES, fixture);
  }

  // ── BRACKET ──
  async function initBracket() {
    const existing = await getAll(STORES.BRACKET);
    if (existing.length === 0) {
      const allMatches = [];
      Object.entries(WC2026.bracketRounds).forEach(([round, data]) => {
        data.matches.forEach(m => allMatches.push({ ...m, round, scoreHome: null, scoreAway: null }));
      });
      await putMany(STORES.BRACKET, allMatches);
    }
  }

  async function getAllBracket() {
    return getAll(STORES.BRACKET);
  }

  async function updateBracketMatch(match) {
    return putOne(STORES.BRACKET, match);
  }

  async function resetBracket() {
    await clearStore(STORES.BRACKET);
    await initBracket();
  }

  // ── RANKING CACHE ──
  async function saveRanking(data) {
    await clearStore(STORES.RANKING);
    await putMany(STORES.RANKING, data);
    await putOne(STORES.SETTINGS, { key: 'ranking_updated', value: new Date().toISOString() });
  }

  async function getCachedRanking() {
    const data = await getAll(STORES.RANKING);
    const meta = await getOne(STORES.SETTINGS, 'ranking_updated');
    return { data: data.sort((a, b) => a.rank - b.rank), updatedAt: meta?.value };
  }

  // ── SETTINGS ──
  async function getSetting(key) {
    const r = await getOne(STORES.SETTINGS, key);
    return r?.value;
  }

  async function setSetting(key, value) {
    return putOne(STORES.SETTINGS, { key, value });
  }

  // ── INIT ALL ──
  async function init() {
    await open();
    await initMatches();
    await initBracket();
    // Always reseed ranking if empty or count differs from expected 48
    const ranking = await getCachedRanking();
    if (ranking.data.length !== WC2026.fifaRanking.length) {
      await saveRanking(WC2026.fifaRanking);
    }
  }

  return {
    init,
    getAllMatches, updateMatch, resetMatches,
    getAllBracket, updateBracketMatch, resetBracket,
    saveRanking, getCachedRanking,
    getSetting, setSetting,
  };
})();
