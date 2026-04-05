// =====================================================
//  FIFA WORLD CUP 2026 — FIREBASE FIRESTORE DATABASE
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzfw3FS39YWksydkzuum9vXRy_VpnnnKQ",
  authDomain: "mundial2026-a200b.firebaseapp.com",
  projectId: "mundial2026-a200b",
  storageBucket: "mundial2026-a200b.firebasestorage.app",
  messagingSenderId: "170936426494",
  appId: "1:170936426494:web:60cc416bf353867ddfaaaf",
  measurementId: "G-RGKPRC2CDC"
};

// Initialize
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const DB = (() => {
  const COLLECTIONS = {
    MATCHES: 'matches',
    BRACKET: 'bracket',
    SETTINGS: 'settings',
    RANKING: 'ranking',
  };

  // ── INIT FIRESTORE ──
  async function init() {
    // Check if initial data exists, if not seed it once
    const matchesCol = await getDocs(collection(firestore, COLLECTIONS.MATCHES));
    if (matchesCol.empty) {
      console.log('🌱 Seeding Firestore with initial matches...');
      const batch = writeBatch(firestore);
      WC2026.generateFixture().forEach(m => {
        const ref = doc(firestore, COLLECTIONS.MATCHES, m.id);
        batch.set(ref, m);
      });
      await batch.commit();
    }

    const bracketCol = await getDocs(collection(firestore, COLLECTIONS.BRACKET));
    if (bracketCol.empty) {
      console.log('🌱 Seeding Firestore with initial bracket...');
      const batch = writeBatch(firestore);
      Object.entries(WC2026.bracketRounds).forEach(([round, data]) => {
        data.matches.forEach(m => {
          const ref = doc(firestore, COLLECTIONS.BRACKET, m.id);
          batch.set(ref, { ...m, round, scoreHome: null, scoreAway: null });
        });
      });
      await batch.commit();
    }
    
    // Seed ranking if empty
    const rankingCol = await getDocs(collection(firestore, COLLECTIONS.RANKING));
    if (rankingCol.empty) {
      await seedRanking(WC2026.fifaRanking);
    }
  }

  // ── MATCHES ──
  async function getAllMatches() {
    const snap = await getDocs(collection(firestore, COLLECTIONS.MATCHES));
    return snap.docs.map(d => d.data());
  }

  async function updateMatch(match) {
    const ref = doc(firestore, COLLECTIONS.MATCHES, match.id);
    return setDoc(ref, match, { merge: true });
  }

  async function resetMatches() {
    const batch = writeBatch(firestore);
    WC2026.generateFixture().forEach(m => {
      const ref = doc(firestore, COLLECTIONS.MATCHES, m.id);
      batch.set(ref, m);
    });
    return batch.commit();
  }

  // ── BRACKET ──
  async function getAllBracket() {
    const snap = await getDocs(collection(firestore, COLLECTIONS.BRACKET));
    return snap.docs.map(d => d.data());
  }

  async function updateBracketMatch(match) {
    const ref = doc(firestore, COLLECTIONS.BRACKET, match.id);
    return setDoc(ref, match, { merge: true });
  }

  async function resetBracket() {
    const batch = writeBatch(firestore);
    Object.entries(WC2026.bracketRounds).forEach(([round, data]) => {
      data.matches.forEach(m => {
        const ref = doc(firestore, COLLECTIONS.BRACKET, m.id);
        batch.set(ref, { ...m, round, scoreHome: null, scoreAway: null, penHome: null, penAway: null });
      });
    });
    return batch.commit();
  }

  // ── RANKING ──
  async function seedRanking(data) {
    const batch = writeBatch(firestore);
    data.forEach(r => {
      const ref = doc(firestore, COLLECTIONS.RANKING, r.rank.toString());
      batch.set(ref, r);
    });
    await batch.commit();
  }

  async function saveRanking(data) {
    // Only update if needed or rewrite all
    await seedRanking(data);
    await setSetting('ranking_updated', new Date().toISOString());
  }

  async function getCachedRanking() {
    const snap = await getDocs(collection(firestore, COLLECTIONS.RANKING));
    const data = snap.docs.map(d => d.data()).sort((a,b) => a.rank - b.rank);
    const updated = await getSetting('ranking_updated');
    return { data, updatedAt: updated };
  }

  // ── SETTINGS ──
  async function getSetting(key) {
    const snap = await getDoc(doc(firestore, COLLECTIONS.SETTINGS, key));
    return snap.exists() ? snap.data().value : null;
  }

  async function setSetting(key, value) {
    return setDoc(doc(firestore, COLLECTIONS.SETTINGS, key), { value });
  }

  return {
    init,
    getAllMatches, updateMatch, resetMatches,
    getAllBracket, updateBracketMatch, resetBracket,
    saveRanking, getCachedRanking,
    getSetting, setSetting,
  };
})();

// Export globally for app.js
window.DB = DB;
