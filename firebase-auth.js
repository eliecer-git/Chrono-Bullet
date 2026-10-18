// ============================================================
// CHRONO BULLET - MÓDULO DE AUTENTICACIÓN Y NUBE (FIREBASE)
// ============================================================
(function () {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyDx1eeBMn58i89zGUhzUGp-HLhj1Bu448w",
    authDomain: "chrono-bullet.firebaseapp.com",
    databaseURL: "https://chrono-bullet-default-rtdb.firebaseio.com",
    projectId: "chrono-bullet",
    storageBucket: "chrono-bullet.firebasestorage.app",
    messagingSenderId: "206046446629",
    appId: "1:206046446629:web:34a544dc59890e052babcc",
    measurementId: "G-BWWX78QRPT"
  };

  let app = null;
  let auth = null;
  let db = null;

  try {
    if (typeof firebase !== 'undefined') {
      app = firebase.apps && firebase.apps.length > 0
        ? firebase.app()
        : firebase.initializeApp(firebaseConfig);
      if (firebase.auth) auth = firebase.auth();
      if (firebase.firestore) db = firebase.firestore();
    }
  } catch (err) {
    console.warn('[ChronoAuth] No se pudo inicializar Firebase:', err);
  }

  function translateAuthError(err) {
    const code = (err && err.code) ? String(err.code) : '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return 'Se cerró la ventana de Google antes de completar el acceso.';
    }
    if (code === 'auth/popup-blocked') {
      return 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.';
    }
    if (code === 'auth/operation-not-supported-in-this-environment') {
      return 'Google requiere abrir el juego desde un servidor web (usa iniciar_servidor.bat o GitHub Pages, no archivo local file://).';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Este dominio no está autorizado en Firebase Authentication > Settings > Dominios autorizados.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Error de red. Verifica tu conexión a internet.';
    }
    return (err && err.message) ? err.message : 'No se pudo iniciar sesión con Google.';
  }

  function extractDisplayName(user) {
    if (!user) return 'JUGADOR';
    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim().split(/\s+/)[0].toUpperCase();
    }
    if (user.email) {
      return user.email.split('@')[0].toUpperCase();
    }
    return 'JUGADOR';
  }

  async function loginWithGoogle() {
    if (window.location.protocol === 'file:') {
      const e = new Error('Google requiere abrir el juego desde http://localhost (ejecuta iniciar_servidor.bat) o desde internet.');
      e.code = 'auth/operation-not-supported-in-this-environment';
      throw e;
    }
    if (!auth || typeof firebase === 'undefined') {
      throw new Error('El servicio de Firebase no está disponible. Revisa tu conexión a internet.');
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await auth.signInWithPopup(provider);
      const user = cred.user;
      const isNewUser = !!(cred.additionalUserInfo && cred.additionalUserInfo.isNewUser);
      return {
        uid: user.uid,
        displayName: extractDisplayName(user),
        email: user.email || '',
        isNewUser: isNewUser
      };
    } catch (err) {
      const friendly = new Error(translateAuthError(err));
      friendly.code = err && err.code ? err.code : 'auth/unknown';
      throw friendly;
    }
  }

  function validateChronoCredentials(username, password) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '');
    if (!cleanUser) {
      throw new Error('Escribe tu nombre de usuario.');
    }
    if (cleanUser.length < 3 || cleanUser.length > 24 || !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      throw new Error('El usuario debe tener entre 3 y 24 caracteres (solo letras, números o _).');
    }
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    return {
      username: cleanUser.toLowerCase(),
      displayName: cleanUser.toUpperCase(),
      syntheticEmail: cleanUser.toLowerCase() + '@chrono.local',
      password: cleanPass
    };
  }

  function translateChronoError(err, mode) {
    const code = (err && err.code) ? String(err.code) : '';
    if (code === 'auth/email-already-in-use') {
      return 'Ese nombre de usuario ya está registrado. Elige otro o pulsa INICIAR SESIÓN.';
    }
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials'
    ) {
      return 'Usuario o contraseña incorrectos. Si es tu primera vez, pulsa CREAR CUENTA.';
    }
    if (code === 'auth/weak-password') {
      return 'La contraseña es muy débil (mínimo 6 caracteres).';
    }
    if (code === 'auth/too-many-requests') {
      return 'Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Error de red. Verifica tu conexión a internet.';
    }
    return (err && err.message)
      ? err.message
      : (mode === 'register' ? 'No se pudo crear la Cuenta Chrono.' : 'No se pudo iniciar sesión en Cuenta Chrono.');
  }

  async function loginWithChrono(username, password) {
    const creds = validateChronoCredentials(username, password);
    if (!auth || typeof firebase === 'undefined') {
      throw new Error('El servicio de Firebase no está disponible. Revisa tu conexión a internet.');
    }
    try {
      const res = await auth.signInWithEmailAndPassword(creds.syntheticEmail, creds.password);
      const user = res.user;
      return {
        uid: user.uid,
        username: creds.username,
        displayName: creds.displayName,
        isNewUser: false
      };
    } catch (err) {
      const friendly = new Error(translateChronoError(err, 'login'));
      friendly.code = err && err.code ? err.code : 'auth/unknown';
      throw friendly;
    }
  }

  async function registerWithChrono(username, password) {
    const creds = validateChronoCredentials(username, password);
    if (!auth || typeof firebase === 'undefined') {
      throw new Error('El servicio de Firebase no está disponible. Revisa tu conexión a internet.');
    }
    try {
      const res = await auth.createUserWithEmailAndPassword(creds.syntheticEmail, creds.password);
      const user = res.user;
      try {
        if (user && typeof user.updateProfile === 'function') {
          await user.updateProfile({ displayName: creds.displayName });
        }
      } catch (e) {}
      return {
        uid: user.uid,
        username: creds.username,
        displayName: creds.displayName,
        isNewUser: true
      };
    } catch (err) {
      const friendly = new Error(translateChronoError(err, 'register'));
      friendly.code = err && err.code ? err.code : 'auth/unknown';
      throw friendly;
    }
  }

  function sanitizeEconomyData(raw) {
    const src = raw || {};
    const coins = Math.max(0, parseInt(src.coins, 10) || 0);
    const weapons = Array.isArray(src.unlockedWeapons)
      ? src.unlockedWeapons.filter(function (w) { return typeof w === 'string'; })
      : ['pistol'];
    if (!weapons.includes('pistol')) weapons.push('pistol');

    const startWeapon = (typeof src.equippedStartWeapon === 'string' && src.equippedStartWeapon)
      ? src.equippedStartWeapon
      : 'default';

    const skins = Array.isArray(src.unlockedSkins)
      ? src.unlockedSkins.filter(function (s) { return typeof s === 'string'; })
      : ['skin_default'];
    if (!skins.includes('skin_default')) skins.push('skin_default');

    const activeSkin = (typeof src.activeSkin === 'string' && src.activeSkin)
      ? src.activeSkin
      : 'skin_default';

    const hardMedkits = Math.max(0, parseInt(src.hardMedkitsReserve, 10) || 0);

    return {
      coins: coins,
      unlockedWeapons: weapons,
      equippedStartWeapon: startWeapon,
      unlockedSkins: skins,
      activeSkin: activeSkin,
      hardMedkitsReserve: hardMedkits
    };
  }

  function writeCloudCache(uid, state) {
    if (!uid) return;
    try {
      localStorage.setItem('chrono_cloud_cache_' + uid, JSON.stringify(sanitizeEconomyData(state)));
    } catch (e) {}
  }

  function readCloudCache(uid) {
    if (!uid) return null;
    try {
      const raw = localStorage.getItem('chrono_cloud_cache_' + uid);
      if (!raw) return null;
      return sanitizeEconomyData(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  // Carga el progreso de Firestore users/{uid}. Si el documento no existe todavía
  // (cuenta recién creada), inicializa la nube con el progreso local que tenía como invitado.
  async function loadOrInitCloudProfile(uid, initialGuestData, meta) {
    const fallbackState = sanitizeEconomyData(initialGuestData);
    if (!uid || !db) {
      return readCloudCache(uid) || fallbackState;
    }
    try {
      const docRef = db.collection('users').doc(uid);
      const snap = await docRef.get();
      if (snap.exists) {
        const cloudState = sanitizeEconomyData(snap.data());
        writeCloudCache(uid, cloudState);
        return cloudState;
      } else {
        const payload = Object.assign({}, fallbackState, {
          provider: (meta && meta.provider) || 'unknown',
          displayName: (meta && meta.displayName) || 'JUGADOR',
          updatedAt: (firebase.firestore && firebase.firestore.FieldValue)
            ? firebase.firestore.FieldValue.serverTimestamp()
            : Date.now()
        });
        await docRef.set(payload, { merge: true });
        writeCloudCache(uid, fallbackState);
        return fallbackState;
      }
    } catch (err) {
      console.warn('[ChronoAuth] No se pudo leer/inicializar Firestore, usando caché local de la cuenta:', err);
      const cached = readCloudCache(uid);
      if (cached) return cached;
      writeCloudCache(uid, fallbackState);
      return fallbackState;
    }
  }

  async function saveCloudProfile(uid, economyData) {
    if (!uid) return;
    const clean = sanitizeEconomyData(economyData);
    writeCloudCache(uid, clean);
    if (!db) return;
    try {
      const payload = Object.assign({}, clean, {
        updatedAt: (firebase.firestore && firebase.firestore.FieldValue)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : Date.now()
      });
      await db.collection('users').doc(uid).set(payload, { merge: true });
    } catch (err) {
      console.warn('[ChronoAuth] Error al guardar progreso en Firestore:', err);
    }
  }

  async function logout() {
    if (!auth) return;
    try {
      await auth.signOut();
    } catch (err) {
      console.warn('[ChronoAuth] Error al cerrar sesión en Firebase:', err);
    }
  }

  function onAuthChange(callback) {
    if (!auth || typeof callback !== 'function') return function () {};
    return auth.onAuthStateChanged(callback);
  }

  function getCurrentUser() {
    return auth ? auth.currentUser : null;
  }

  function isAvailable() {
    return !!(auth && db);
  }

  window.chronoAuth = {
    isAvailable: isAvailable,
    getCurrentUser: getCurrentUser,
    loginWithGoogle: loginWithGoogle,
    loginWithChrono: loginWithChrono,
    registerWithChrono: registerWithChrono,
    loadOrInitCloudProfile: loadOrInitCloudProfile,
    saveCloudProfile: saveCloudProfile,
    readCloudCache: readCloudCache,
    logout: logout,
    onAuthChange: onAuthChange,
    getDb: function () { return db; }
  };
})();
