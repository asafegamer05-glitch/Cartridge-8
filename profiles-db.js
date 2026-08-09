/* ============================================
   CARTRIDGE-8 � Profile Database (IndexedDB)
   Estrutura extens�vel para perfis e saves por jogo
   ============================================ */

'use strict';

const C8_DB = {
  NAME:    'cartridge8',
  VERSION: 1,
  MAX_PROFILES: 5,
  COIN_INTERVAL_MS: 30_000,
  GAME_PRICE: 10,

  STORES: {
    META:         'meta',
    PROFILES:     'profiles',
    PROFILE_GAMES:'profileGames',
  },
};

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(C8_DB.NAME, C8_DB.VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(C8_DB.STORES.META)) {
        db.createObjectStore(C8_DB.STORES.META, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(C8_DB.STORES.PROFILES)) {
        const ps = db.createObjectStore(C8_DB.STORES.PROFILES, { keyPath: 'id' });
        ps.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(C8_DB.STORES.PROFILE_GAMES)) {
        const gs = db.createObjectStore(C8_DB.STORES.PROFILE_GAMES, { keyPath: 'key' });
        gs.createIndex('profileId', 'profileId', { unique: false });
        gs.createIndex('gameId', 'gameId', { unique: false });
      }
    };
  });
}

function tx(storeNames, mode = 'readonly') {
  return openDB().then(db => {
    const t = db.transaction(storeNames, mode);
    return { t, stores: storeNames.map(n => t.objectStore(n)) };
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function gameKey(profileId, gameId) {
  return `${profileId}::${gameId}`;
}

function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

/** Registro padr�o de save por jogo � extens�vel via saves/stats/settings/meta */
function createEmptyGameRecord(profileId, gameId) {
  const now = Date.now();
  return {
    key:       gameKey(profileId, gameId),
    profileId,
    gameId,
    saves:     {},
    stats:     {},
    settings:  {},
    meta:      {},
    createdAt: now,
    updatedAt: now,
  };
}

/** Perfil novo */
function createProfileRecord(name, mode, firstGameId) {
  const now = Date.now();
  const id = generateId();
  const unlocked = mode === 'hardcore' && firstGameId ? [firstGameId] : [];

  return {
    id,
    name: name.trim().slice(0, 24) || 'Jogador',
    mode,
    economy: {
      coins:      mode === 'hardcore' ? 0 : 0,
      lastCoinAt: now,
    },
    progress: {
      unlockedGameIds: unlocked,
    },
    meta:      {},
    createdAt: now,
    updatedAt: now,
  };
}

async function getMeta(key) {
  const { stores } = await tx([C8_DB.STORES.META]);
  return reqToPromise(stores[0].get(key));
}

async function setMeta(key, value) {
  const { stores } = await tx([C8_DB.STORES.META], 'readwrite');
  return reqToPromise(stores[0].put({ key, value }));
}

async function getLastActiveProfileId() {
  const row = await getMeta('session');
  return row?.value?.lastActiveProfileId ?? null;
}

async function setLastActiveProfileId(profileId) {
  return setMeta('session', { lastActiveProfileId: profileId });
}

async function listProfiles() {
  const { stores } = await tx([C8_DB.STORES.PROFILES]);
  const all = await reqToPromise(stores[0].getAll());
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function getProfile(id) {
  const { stores } = await tx([C8_DB.STORES.PROFILES]);
  return reqToPromise(stores[0].get(id));
}

async function saveProfile(profile) {
  profile.updatedAt = Date.now();
  const { stores } = await tx([C8_DB.STORES.PROFILES], 'readwrite');
  return reqToPromise(stores[0].put(profile));
}

async function deleteProfile(id) {
  const games = await listProfileGames(id);
  const storeNames = [C8_DB.STORES.PROFILES, C8_DB.STORES.PROFILE_GAMES];
  const { t, stores } = await tx(storeNames, 'readwrite');
  stores[0].delete(id);
  games.forEach(g => stores[1].delete(g.key));
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

async function countProfiles() {
  const { stores } = await tx([C8_DB.STORES.PROFILES]);
  return reqToPromise(stores[0].count());
}

async function getProfileGame(profileId, gameId) {
  const { stores } = await tx([C8_DB.STORES.PROFILE_GAMES]);
  return reqToPromise(stores[0].get(gameKey(profileId, gameId)));
}

async function saveProfileGame(record) {
  record.updatedAt = Date.now();
  const { stores } = await tx([C8_DB.STORES.PROFILE_GAMES], 'readwrite');
  return reqToPromise(stores[0].put(record));
}

async function listProfileGames(profileId) {
  const { stores } = await tx([C8_DB.STORES.PROFILE_GAMES]);
  const idx = stores[0].index('profileId');
  return reqToPromise(idx.getAll(profileId));
}

async function getOrCreateProfileGame(profileId, gameId) {
  let rec = await getProfileGame(profileId, gameId);
  if (!rec) {
    rec = createEmptyGameRecord(profileId, gameId);
    await saveProfileGame(rec);
  }
  return rec;
}

/** N�o acumula moedas offline para perfis hardcore. */
function applyPendingCoins(profile) {
  return profile;
}

async function tickCoin(profile) {
  if (profile.mode !== 'hardcore') return profile;
  await saveProfile(profile);
  return profile;
}

async function addCoin(profile) {
  if (profile.mode !== 'hardcore') return profile;
  profile.economy.coins += 1;
  profile.economy.lastCoinAt = Date.now();
  await saveProfile(profile);
  return profile;
}

async function purchaseGame(profile, gameId) {
  if (profile.mode !== 'hardcore') return { ok: false, reason: 'sandbox' };
  if (profile.progress.unlockedGameIds.includes(gameId)) {
    return { ok: false, reason: 'already' };
  }
  if (profile.economy.coins < C8_DB.GAME_PRICE) {
    return { ok: false, reason: 'coins', profile };
  }
  profile.economy.coins -= C8_DB.GAME_PRICE;
  profile.progress.unlockedGameIds.push(gameId);
  await saveProfile(profile);
  await getOrCreateProfileGame(profile.id, gameId);
  return { ok: true, profile };
}

function isGameUnlocked(profile, gameId, allGameIds) {
  if (!profile) return false;
  if (profile.mode === 'sandbox') return true;
  return profile.progress.unlockedGameIds.includes(gameId);
}

async function createProfile(name, mode, firstGameId) {
  const count = await countProfiles();
  if (count >= C8_DB.MAX_PROFILES) {
    return { ok: false, reason: 'max' };
  }
  const profile = createProfileRecord(name, mode, firstGameId);
  await saveProfile(profile);
  if (mode === 'hardcore' && firstGameId) {
    await getOrCreateProfileGame(profile.id, firstGameId);
  }
  await setLastActiveProfileId(profile.id);
  return { ok: true, profile };
}

async function updateProfile(profileId, updates) {
  const profile = await getProfile(profileId);
  if (!profile) return { ok: false, reason: 'missing' };
  if (updates.name !== undefined) {
    profile.name = String(updates.name).trim().slice(0, 24) || profile.name;
  }
  if (updates.mode !== undefined && updates.mode !== profile.mode) {
    profile.mode = updates.mode;
    if (updates.mode === 'sandbox') {
      profile.progress.unlockedGameIds = [];
    } else if (updates.mode === 'hardcore' && !profile.progress.unlockedGameIds.length) {
      /* caller should pass firstGameId via meta if needed */
    }
  }
  await saveProfile(profile);
  return { ok: true, profile };
}

/** Exporta perfil + todos os saves de jogos para objeto serializ�vel */
async function exportProfileData(profileId) {
  const profile = await getProfile(profileId);
  if (!profile) return null;
  const games = await listProfileGames(profileId);
  return {
    format:     'cartridge8-profile',
    version:    1,
    exportedAt: new Date().toISOString(),
    profile,
    games,
  };
}

/** Importa perfil de dados exportados; gera novo id se conflito */
async function importProfileData(data, options = {}) {
  if (!data || data.format !== 'cartridge8-profile' || !data.profile) {
    return { ok: false, reason: 'invalid' };
  }
  const count = await countProfiles();
  if (count >= C8_DB.MAX_PROFILES) {
    return { ok: false, reason: 'max' };
  }

  const src = data.profile;
  const profile = { ...src };
  profile.id = generateId();
  profile.createdAt = Date.now();
  profile.updatedAt = Date.now();
  profile.meta = { ...(src.meta || {}), importedAt: Date.now() };

  await saveProfile(profile);

  const games = data.games || [];
  for (const g of games) {
    const rec = {
      ...g,
      key:       gameKey(profile.id, g.gameId),
      profileId: profile.id,
      updatedAt: Date.now(),
    };
    await saveProfileGame(rec);
  }

  if (options.activate) await setLastActiveProfileId(profile.id);
  return { ok: true, profile };
}

window.C8ProfileDB = {
  C8_DB,
  openDB,
  listProfiles,
  getProfile,
  saveProfile,
  deleteProfile,
  countProfiles,
  getLastActiveProfileId,
  setLastActiveProfileId,
  getProfileGame,
  saveProfileGame,
  getOrCreateProfileGame,
  listProfileGames,
  applyPendingCoins,
  tickCoin,
  addCoin,
  purchaseGame,
  isGameUnlocked,
  createProfile,
  updateProfile,
  exportProfileData,
  importProfileData,
  gameKey,
};
