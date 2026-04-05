// =====================================================
//  FIFA WORLD CUP 2026 — FIREBASE FIRESTORE DATABASE
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const DB = (() => {
  const COLLECTIONS = {
    MATCHES: 'matches',
    BRACKET: 'bracket',
    SETTINGS: 'settings',
    RANKING: 'ranking',
  };

  let currentUser = null;

  async function login() {
    try {
      const res = await signInWithPopup(auth, provider);
      return res.user;
    } catch (e) { console.error('Login Fail', e); return null; }
  }

  async function logout() { await signOut(auth); }

  function onAuth(cb) {
    onAuthStateChanged(auth, user => {
      currentUser = user;
      cb(user);
    });
  }

  // ── INIT FIRESTORE ──
  async function init() {
    try {
      console.log('📡 Conectando a Firebase...');
      
      const matchesCol = await getDocs(collection(firestore, COLLECTIONS.MATCHES));
      if (matchesCol.empty) {
        console.log('🌱 Cloud Seeding: Matches...');
        const batch = writeBatch(firestore);
        WC2026.generateFixture().forEach(m => {
          batch.set(doc(firestore, COLLECTIONS.MATCHES, m.id), m);
        });
        await batch.commit();
      }

      const bracketCol = await getDocs(collection(firestore, COLLECTIONS.BRACKET));
      if (bracketCol.empty) {
        console.log('🌱 Cloud Seeding: Bracket...');
        const batch = writeBatch(firestore);
        Object.entries(WC2026.bracketRounds).forEach(([round, data]) => {
          data.matches.forEach(m => {
            batch.set(doc(firestore, COLLECTIONS.BRACKET, m.id), { 
              ...m, round, scoreHome: null, scoreAway: null, penHome: null, penAway: null 
            });
          });
        });
        await batch.commit();
      }
      
      const rankingCol = await getDocs(collection(firestore, COLLECTIONS.RANKING));
      if (rankingCol.empty) {
        await saveRanking(WC2026.fifaRanking);
      }
      
      console.log('✅ Firebase conectado y sincronizado.');
    } catch (error) {
      console.error('❌ Firebase Error detallado:', error);
      throw error;
    }
  }

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
      batch.set(doc(firestore, COLLECTIONS.MATCHES, m.id), m);
    });
    return batch.commit();
  }

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
        batch.set(doc(firestore, COLLECTIONS.BRACKET, m.id), { 
          ...m, round, scoreHome: null, scoreAway: null, penHome: null, penAway: null 
        });
      });
    });
    return batch.commit();
  }

  async function saveRanking(data) {
    const batch = writeBatch(firestore);
    data.forEach(r => {
      batch.set(doc(firestore, COLLECTIONS.RANKING, r.rank.toString()), r);
    });
    await batch.commit();
    await setSetting('ranking_updated', new Date().toISOString());
  }

  async function getCachedRanking() {
    const snap = await getDocs(collection(firestore, COLLECTIONS.RANKING));
    const data = snap.docs.map(d => d.data()).sort((a,b) => a.rank - b.rank);
    const updated = await getSetting('ranking_updated');
    return { data, updatedAt: updated };
  }

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
    login, logout, onAuth
  };
})();

window.DB = DB;
