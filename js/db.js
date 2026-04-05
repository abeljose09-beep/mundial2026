// =====================================================
//  FIFA WORLD CUP 2026 — IndexedDB DATABASE LAYER
//  Provides persistent storage for scores and results
// =====================================================

const DB = (() => {
  const DB_NAME = 'WorldCup2026';
  const DB_VERSION = 2;
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

  function tx(storeName, mode) {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  function getAll(storeName) {
    return new Promise((resolve, reject) => {
      const q = tx(storeName, 'readonly').getAll();
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(q.error);
    });
  }

  function getOne(storeName, key) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName, 'readonly').get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function putOne(storeName, item) {
    return new Promise((resolve, reject) => {
      const req = tx(storeName, 'readwrite').put(item);
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
  async function getAllMatches() { return getAll(STORES.MATCHES); }
  async function updateMatch(match) { return putOne(STORES.MATCHES, match); }
  async function resetMatches() {
    await clearStore(STORES.MATCHES);
    await putMany(STORES.MATCHES, WC2026.generateFixture());
  }

  // ── BRACKET ──
  async function getAllBracket() { return getAll(STORES.BRACKET); }
  async function updateBracketMatch(match) { return putOne(STORES.BRACKET, match); }
  async function resetBracket() {
    await clearStore(STORES.BRACKET);
    const bracketMatches = [];
    Object.entries(WC2026.bracketRounds).forEach(([round, data]) => {
      data.matches.forEach(m => bracketMatches.push({ ...m, round, scoreHome: null, scoreAway: null, penHome: null, penAway: null }));
    });
    await putMany(STORES.BRACKET, bracketMatches);
  }

  // ── RANKING ──
  async function saveRanking(data) {
    await clearStore(STORES.RANKING);
    await putMany(STORES.RANKING, data);
    await putOne(STORES.SETTINGS, { key: 'ranking_updated', value: new Date().toISOString() });
  }

  async function getCachedRanking() {
    const data = await getAll(STORES.RANKING);
    const meta = await getOne(STORES.SETTINGS, 'ranking_updated');
    return { data: data.sort((a,b) => a.rank - b.rank), updatedAt: meta?.value };
  }

  // ── SETTINGS ──
  async function getSetting(key) {
    const r = await getOne(STORES.SETTINGS, key);
    return r?.value;
  }
  async function setSetting(key, value) {
    return putOne(STORES.SETTINGS, { key, value });
  }

  // ── INIT ──
  async function init() {
    await open();
    const matches = await getAllMatches();
    if (matches.length === 0) await resetMatches();
    const bracket = await getAllBracket();
    if (bracket.length === 0) await resetBracket();
    const rank = await getAll(STORES.RANKING);
    if (rank.length === 0) await saveRanking(WC2026.fifaRanking);
  }

  return { init, getAllMatches, updateMatch, resetMatches, getAllBracket, updateBracketMatch, resetBracket, saveRanking, getCachedRanking, getSetting, setSetting };
})();
