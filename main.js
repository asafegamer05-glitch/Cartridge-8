/* ============================================
   CARTRIDGE-8 — Engine Principal v1.3
   Console OS v1.3, 3D Cartridge Rack, Synthesizer & Pixel Art Studio
   ============================================ */

'use strict';

const STATE = {
  BOOT:             'BOOT',
  PROFILE_SELECT:   'PROFILE_SELECT',
  MENU:             'MENU',
  CARTRIDGE_SELECT: 'CARTRIDGE_SELECT',
  APPS:             'APPS',
  LIBRARY:          'LIBRARY',
  PROFILES:         'PROFILES',
  CONTROLLER:       'CONTROLLER',
  OPTIONS:          'OPTIONS',
  ABOUT:            'ABOUT',
  GAME:             'GAME',
};

const MODE_INFO = {
  sandbox: 'SANDBOX: Todos os jogos da biblioteca ficam desbloqueados desde o início. Ideal para explorar livremente.',
  hardcore: 'HARDCORE: Apenas o primeiro jogo começa desbloqueado. Você ganha 1 moeda a cada 30 segundos (mesmo no menu). Cada jogo custa 10 moedas e pode ser comprado na biblioteca.',
};

// Metadados dos jogos são carregados exclusivamente via games/<id>/info.txt
// Esta lista é usada apenas como fallback quando os fetchs falham (ex: protocolo file://).
// Contém só id + color — único dado visual necessário sem rede (o restante vem do info.txt).
const FALLBACK_GAMES = [
  { id: 'demo',                                color: '#0d1f3c' },
  { id: 'airsoft simulator',                   color: '#2a4d36' },
  { id: 'super aventureiro',                   color: '#3a2050' },
  { id: 'super aventureiro 2',                 color: '#502030' },
  { id: 'super aventureiro 2 beach expansion', color: '#48CAE4' },
  { id: 'super aventureiro 2 agent edition',   color: '#1a1a2e' },
  { id: 'zombie rush',                         color: '#2d4a27' },
  { id: 'sekiverse',                           color: '#1a0a1a' },
];

const C8 = {
  state: STATE.BOOT,

  settings: {
    crtEnabled:       true,
    scanlinesEnabled: true,
    noiseEnabled:     true,
    brightness:       100,
  },

  profile: {
    active:        null,
    list:          [],
    selectedIndex: 0,
    editorOpen:    false,
    editorMode:    'create',
    editingId:     null,
    nameInput:     '',
    selectedMode:  'sandbox',
    infoVisible:   null,
    editorSelectedIndex: 0,
    managerSelected: 0,
    managerSelectionIndex: 0,
  },

  menu: {
    selectedIndex: 0,
    items: ['play', 'apps', 'library', 'profiles', 'controller', 'options', 'about'],
  },

  cartridgeSelect: {
    selectedIndex: 0,
    games: [],
  },

  apps: {
    activeApp: 'synth', // 'synth' ou 'pixel'
    synthWave: 'square',
    pixelColor: '#5de4ff',
    pixelTool: 'pencil',
  },

  options: {
    selectedIndex: 0,
    items: ['crt', 'scanlines', 'noise', 'brightness', 'export-profile', 'import-profile'],
  },

  coinTimer: null,
  gameIdsCache: [],

  terminal: {
    input:   '',
    waiting: false,
  },

  gamepad: {
    index:       null,
    prevButtons: [],
    lastNavTime: 0,
    comboTriggered: false,
  },

  virtualCursor: {
    x: 120,
    y: 100,
    visible: false,
    isDown: false,
  },
};

const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const dom = {
  body:           document.body,
  screen:         $('screen'),
  screenWrapper:  $('screen-wrapper'),
  virtualCursor:  $('virtual-cursor'),

  views: {
    BOOT:             $('view-terminal'),
    PROFILE_SELECT:   $('view-profile-select'),
    MENU:             $('view-menu'),
    CARTRIDGE_SELECT: $('view-cartridge'),
    APPS:             $('view-apps'),
    LIBRARY:          $('view-library'),
    PROFILES:         $('view-profiles'),
    CONTROLLER:       $('view-controller'),
    OPTIONS:          $('view-options'),
    ABOUT:            $('view-about'),
    GAME:             $('game-frame'),
  },

  profileSelectList:   $('profile-select-list'),
  profileSelectEmpty:  $('profile-select-empty'),
  profileSelectCreate: $('profile-select-create'),
  profileSelectCreateFirst: $('profile-select-create-first'),
  profilesManagerList: $('profiles-manager-list'),
  profilesCountBadge:  $('profiles-count-badge'),
  profilesBtnCreate:   $('profiles-btn-create'),
  profilesBtnEdit:     $('profiles-btn-edit'),
  profileEditorOverlay:$('profile-editor-overlay'),
  profileEditorTitle:  $('profile-editor-title'),
  profileNameText:     $('profile-name-text'),
  profileNameInput:    $('profile-name-input'),
  profileEditorSave:   $('profile-editor-save'),
  profileEditorDelete: $('profile-editor-delete'),
  profileEditorClose:  $('profile-editor-close'),
  modeSandbox:        $('mode-sandbox'),
  modeHardcore:       $('mode-hardcore'),
  profileModeInfo:     $('profile-mode-info'),
  profileMobileKb:     $('profile-mobile-keyboard'),
  profileImportFile:   $('profile-import-file'),
  menuProfileBadge:    $('menu-profile-badge'),

  termOut:        $('terminal-output'),
  termInputText:  $('terminal-input-text'),
  termInputLine:  $('terminal-input-line'),
  termStatus:     $('term-status'),

  menuCards:      $$('.menu-card'),
  menuDots:       $$('.menu-dot'),
  navLeft:        $('menu-nav-left'),
  navRight:       $('menu-nav-right'),

  cartridgeRack:  $('cartridge-rack'),
  rackPrev:       $('rack-prev'),
  rackNext:       $('rack-next'),
  cartDetailsTitle:$('cart-details-title'),
  cartDetailsDesc: $('cart-details-desc'),
  cartSpecDev:    $('cart-spec-dev'),
  cartSpecGenre:  $('cart-spec-genre'),
  cartSpecYear:   $('cart-spec-year'),
  cartSpecVer:    $('cart-spec-ver'),
  btnInsertPlay:  $('btn-insert-play'),
  cartCount:      $('cart-count'),
  noCarts:        $('no-cartridges-msg'),

  libraryGrid:    $('library-grid'),

  noGamepadMsg:   $('no-gamepad-msg'),
  gamepadVisual:  $('gamepad-visual'),
  gamepadName:    $('gamepad-name'),
  axesDisplay:    $('axes-display'),

  optionItems:    $$('.option-item'),
  toggleCrt:      $('toggle-crt'),
  toggleScanlines:$('toggle-scanlines'),
  toggleNoise:    $('toggle-noise'),
  brightSlider:   $('brightness-slider'),
  crtValue:       $('crt-value'),
  scanlinesValue: $('scanlines-value'),
  noiseValue:     $('noise-value'),
  brightValue:    $('brightness-value'),

  crtScanlines:   $('crt-scanlines'),
  crtVignette:    $('crt-vignette'),
  crtNoise:       $('crt-noise'),
  crtGlare:       $('crt-glare'),

  gameFrame:      $('game-frame'),
  slotLabel:      $('slot-label'),
  cartSlot:       $('cartridge-slot'),
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

const isMobileInput = () =>
  ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
  window.matchMedia('(max-width: 1024px)').matches;

// ============================================================
//  PROFILE SYSTEM (IndexedDB)
// ============================================================
const PDB = () => window.C8ProfileDB;

async function refreshGameIdsCache() {
  C8.gameIdsCache = await fetchGamesManifest();
  return C8.gameIdsCache;
}

function getFirstGameId() {
  return C8.gameIdsCache[0] || FALLBACK_GAMES[0]?.id || 'demo';
}

function profileUnlocked(gameId) {
  if (!C8.profile.active) return false;
  return PDB().isGameUnlocked(C8.profile.active, gameId, C8.gameIdsCache);
}

function updateMenuProfileBadge() {
  if (!dom.menuProfileBadge) return;
  const p = C8.profile.active;
  if (!p) {
    dom.menuProfileBadge.textContent = '';
    return;
  }
  const modeLabel = p.mode === 'hardcore' ? 'HARDCORE' : 'SANDBOX';
  let html = `👤 ${p.name} · ${modeLabel}`;
  if (p.mode === 'hardcore') {
    html += `<span class="badge-coins">🪙 ${p.economy.coins}</span>`;
  }
  dom.menuProfileBadge.innerHTML = html;
}

function stopCoinTimer() {
  if (C8.coinTimer) {
    clearInterval(C8.coinTimer);
    C8.coinTimer = null;
  }
}

function startCoinTimer() {
  stopCoinTimer();
  const p = C8.profile.active;
  if (!p || p.mode !== 'hardcore') return;
  C8.coinTimer = setInterval(async () => {
    if (!C8.profile.active || C8.profile.active.mode !== 'hardcore') return;
    C8.profile.active = await PDB().addCoin(C8.profile.active);
    updateMenuProfileBadge();
    if (C8.state === STATE.LIBRARY) onEnterLibrary();
  }, PDB().C8_DB.COIN_INTERVAL_MS);
}

async function activateProfile(profile) {
  await PDB().saveProfile(profile);
  await PDB().setLastActiveProfileId(profile.id);
  C8.profile.active = profile;
  updateMenuProfileBadge();
  startCoinTimer();
}

async function loadProfilesList() {
  C8.profile.list = await PDB().listProfiles();
  return C8.profile.list;
}

function renderProfileCard(profile, opts = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'profile-card';
  if (opts.active) el.classList.add('active-profile');
  if (opts.selected) el.classList.add('selected');
  el.dataset.profileId = profile.id;
  const initial = (profile.name || '?').charAt(0).toUpperCase();
  const modeCls = profile.mode === 'hardcore' ? 'mode-hardcore' : '';
  el.innerHTML = `
    <div class="profile-avatar">${initial}</div>
    <div class="profile-card-name">${escapeHtml(profile.name)}</div>
    <div class="profile-card-mode ${modeCls}">${profile.mode.toUpperCase()}</div>
  `;
  return el;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function onEnterProfileSelect() {
  await refreshGameIdsCache();
  await loadProfilesList();
  renderProfileSelectScreen();
}

function renderProfileSelectScreen() {
  const list = C8.profile.list;
  dom.profileSelectList.innerHTML = '';
  C8.profile.selectedIndex = 0;

  if (!list.length) {
    dom.profileSelectEmpty.style.display = 'flex';
    dom.profileSelectCreate.style.display = 'none';
    C8.profile.selectedIndex = 0;
    syncProfileSelectSelectionUI();
    return;
  }

  dom.profileSelectEmpty.style.display = 'none';
  list.forEach((p, i) => {
    const card = renderProfileCard(p, {
      active: C8.profile.active?.id === p.id,
      selected: i === C8.profile.selectedIndex,
    });
    card.addEventListener('click', () => selectProfileFromBoot(p.id));
    dom.profileSelectList.appendChild(card);
  });

  if (list.length < PDB().C8_DB.MAX_PROFILES) {
    dom.profileSelectCreate.style.display = 'block';
  } else {
    dom.profileSelectCreate.style.display = 'none';
  }

  syncProfileSelectSelectionUI();
}

function syncProfileSelectSelectionUI() {
  const list = C8.profile.list;
  const listLen = list.length;

  dom.profileSelectList.querySelectorAll('.profile-card').forEach((c, i) => {
    c.classList.toggle('selected', i === C8.profile.selectedIndex);
  });

  const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
  const createIndex = listLen;
  const createFocused = canCreate && C8.profile.selectedIndex === createIndex && listLen > 0;
  const createFirstFocused = listLen === 0 && C8.profile.selectedIndex === 0;

  if (dom.profileSelectCreate) dom.profileSelectCreate.classList.toggle('focused', createFocused);
  if (dom.profileSelectCreateFirst) dom.profileSelectCreateFirst.classList.toggle('focused', createFirstFocused);
}

async function selectProfileFromBoot(profileId) {
  const profile = await PDB().getProfile(profileId);
  if (!profile) return;
  playSelectSound();
  await activateProfile(profile);
  setState(STATE.MENU);
}

async function onEnterProfilesManager() {
  await loadProfilesList();
  renderProfilesManager();
}

function renderProfilesManager() {
  const list = C8.profile.list;
  dom.profilesManagerList.innerHTML = '';
  dom.profilesCountBadge.textContent = `${list.length}/${PDB().C8_DB.MAX_PROFILES}`;

  if (!list.length) {
    dom.profilesManagerList.innerHTML =
      '<div class="profile-empty-msg"><p>Nenhum perfil. Crie um para começar.</p></div>';
    C8.profile.managerSelected = -1;
    C8.profile.managerSelectionIndex = 0;
    syncProfilesManagerSelectionUI();
    return;
  }

  const canCreate = list.length < PDB().C8_DB.MAX_PROFILES;
  const total = list.length + (canCreate ? 2 : 1);
  if (C8.profile.managerSelectionIndex < 0 || C8.profile.managerSelectionIndex >= total) {
    C8.profile.managerSelectionIndex = 0;
  }

  list.forEach((p, i) => {
    const card = renderProfileCard(p, {
      active: C8.profile.active?.id === p.id,
      selected: i === C8.profile.managerSelectionIndex,
    });
    card.addEventListener('click', () => {
      C8.profile.managerSelectionIndex = i;
      playNavSound();
      renderProfilesManager();
    });
    card.addEventListener('dblclick', () => switchToProfile(p.id));
    dom.profilesManagerList.appendChild(card);
  });

  dom.profilesBtnCreate.disabled = !canCreate;
  dom.profilesBtnCreate.style.opacity = canCreate ? '1' : '0.45';
  syncProfilesManagerSelectionUI();
}

function syncProfilesManagerSelectionUI() {
  const listLen = C8.profile.list.length;
  const activeCard = dom.profilesManagerList.querySelectorAll('.profile-card');
  activeCard.forEach((c, i) => {
    c.classList.toggle('selected', i === C8.profile.managerSelectionIndex && C8.profile.managerSelectionIndex < listLen);
  });

  const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
  const createFocused = listLen === 0 ? C8.profile.managerSelectionIndex === 0 : C8.profile.managerSelectionIndex === listLen && canCreate;
  const editFocused = listLen === 0 ? false : (!canCreate && C8.profile.managerSelectionIndex === listLen) || (canCreate && C8.profile.managerSelectionIndex === listLen + 1);

  if (dom.profilesBtnCreate) dom.profilesBtnCreate.classList.toggle('focused', createFocused);
  if (dom.profilesBtnEdit) dom.profilesBtnEdit.classList.toggle('focused', editFocused);
}

async function switchToProfile(profileId) {
  const profile = await PDB().getProfile(profileId);
  if (!profile) return;
  playSelectSound();
  await activateProfile(profile);
  setState(STATE.MENU);
}

function openProfileEditor(mode, profileId = null) {
  C8.profile.editorOpen = true;
  C8.profile.editorMode = mode;
  C8.profile.editingId = profileId;
  C8.profile.nameInput = '';
  C8.profile.selectedMode = 'sandbox';
  C8.profile.infoVisible = null;

  if (mode === 'edit' && profileId) {
    const p = C8.profile.list.find(x => x.id === profileId);
    if (p) {
      C8.profile.nameInput = p.name;
      C8.profile.selectedMode = p.mode;
    }
    dom.profileEditorTitle.textContent = 'EDITAR PERFIL';
    dom.profileEditorDelete.style.display = 'block';
  } else {
    dom.profileEditorTitle.textContent = 'CRIAR PERFIL';
    dom.profileEditorDelete.style.display = 'none';
  }

  C8.profile.editorSelectedIndex = 0;
  syncProfileEditorUI();
  syncProfileEditorSelectionUI();
  dom.profileEditorOverlay.classList.add('open');
  dom.profileEditorOverlay.setAttribute('aria-hidden', 'false');

  if (isMobileInput()) {
    document.body.classList.add('profile-mobile-input');
    dom.profileMobileKb.setAttribute('aria-hidden', 'false');
    if (dom.profileNameInput) {
      dom.profileNameInput.value = C8.profile.nameInput;
      setTimeout(() => dom.profileNameInput.focus(), 100);
    }
  } else {
    document.body.classList.remove('profile-mobile-input');
    dom.profileMobileKb.setAttribute('aria-hidden', 'true');
  }
}

function closeProfileEditor() {
  C8.profile.editorOpen = false;
  dom.profileEditorOverlay.classList.remove('open');
  dom.profileEditorOverlay.setAttribute('aria-hidden', 'true');
  dom.profileModeInfo.style.display = 'none';
  document.body.classList.remove('profile-mobile-input');
  if (dom.profileNameInput) dom.profileNameInput.blur();
}

function syncProfileEditorUI() {
  dom.profileNameText.textContent = C8.profile.nameInput;
  if (dom.profileNameInput) dom.profileNameInput.value = C8.profile.nameInput;

  $$('.profile-mode-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.mode === C8.profile.selectedMode);
  });

  if (C8.profile.infoVisible) {
    dom.profileModeInfo.textContent = MODE_INFO[C8.profile.infoVisible] || '';
    dom.profileModeInfo.style.display = 'block';
  } else {
    dom.profileModeInfo.style.display = 'none';
  }
}

function getProfileEditorNavItems() {
  const items = [dom.modeSandbox, dom.modeHardcore, dom.profileEditorSave];
  if (C8.profile.editorMode === 'edit') items.push(dom.profileEditorDelete);
  items.push(dom.profileEditorClose);
  return items.filter(Boolean);
}

function syncProfileEditorSelectionUI() {
  const items = getProfileEditorNavItems();
  items.forEach((el, i) => {
    el.classList.toggle('focused', i === C8.profile.editorSelectedIndex);
  });
}

function profileEditorNavigate(dir) {
  const items = getProfileEditorNavItems();
  if (!items.length) return;
  C8.profile.editorSelectedIndex = (C8.profile.editorSelectedIndex + dir + items.length) % items.length;
  playNavSound();
  syncProfileEditorSelectionUI();
}

function profileEditorConfirm() {
  const items = getProfileEditorNavItems();
  const current = items[C8.profile.editorSelectedIndex];
  if (!current) return;

  if (current === dom.modeSandbox || current === dom.modeHardcore) {
    C8.profile.selectedMode = current.dataset.mode;
    playNavSound();
    syncProfileEditorUI();
    syncProfileEditorSelectionUI();
    return;
  }

  if (current === dom.profileEditorSave) {
    saveProfileEditor();
    return;
  }

  if (current === dom.profileEditorDelete) {
    deleteProfileEditor();
    return;
  }

  if (current === dom.profileEditorClose) {
    closeProfileEditor();
  }
}

function profileNameKey(key) {
  if (key === 'Backspace') {
    C8.profile.nameInput = C8.profile.nameInput.slice(0, -1);
  } else if (key.length === 1 && C8.profile.nameInput.length < 24) {
    C8.profile.nameInput += key;
  }
  syncProfileEditorUI();
  if (dom.profileNameInput) dom.profileNameInput.value = C8.profile.nameInput;
}

async function saveProfileEditor() {
  const name = C8.profile.nameInput.trim();
  if (!name) {
    playBeep(180, 0.1, 'sawtooth', 0.12);
    return;
  }

  if (C8.profile.editorMode === 'create') {
    await refreshGameIdsCache();
    const result = await PDB().createProfile(name, C8.profile.selectedMode, getFirstGameId());
    if (!result.ok) {
      playBeep(180, 0.1, 'sawtooth', 0.12);
      return;
    }
    playSelectSound();
    await activateProfile(result.profile);
    closeProfileEditor();
    if (C8.state === STATE.PROFILE_SELECT || C8.state === STATE.PROFILES) {
      if (C8.state === STATE.PROFILE_SELECT) setState(STATE.MENU);
      else renderProfilesManager();
    }
  } else if (C8.profile.editingId) {
    const result = await PDB().updateProfile(C8.profile.editingId, {
      name,
      mode: C8.profile.selectedMode,
    });
    if (!result.ok) return;
    let profile = result.profile;
    if (profile.mode === 'hardcore' && !profile.progress.unlockedGameIds.length) {
      profile.progress.unlockedGameIds = [getFirstGameId()];
      await PDB().saveProfile(profile);
      await PDB().getOrCreateProfileGame(profile.id, getFirstGameId());
    }
    playSelectSound();
    if (C8.profile.active?.id === profile.id) {
      await activateProfile(profile);
    }
    await loadProfilesList();
    closeProfileEditor();
    if (C8.state === STATE.PROFILES) renderProfilesManager();
    else renderProfileSelectScreen();
  }
}

async function deleteProfileEditor() {
  if (!C8.profile.editingId) return;
  if (!confirm('Excluir este perfil permanentemente?')) return;
  await PDB().deleteProfile(C8.profile.editingId);
  if (C8.profile.active?.id === C8.profile.editingId) {
    C8.profile.active = null;
    stopCoinTimer();
    updateMenuProfileBadge();
  }
  await loadProfilesList();
  closeProfileEditor();
  if (C8.state === STATE.PROFILES) renderProfilesManager();
  else if (C8.state === STATE.MENU && !C8.profile.list.length) setState(STATE.PROFILE_SELECT);
  else renderProfileSelectScreen();
}

async function exportActiveProfileZip() {
  if (!C8.profile.active) {
    playBeep(180, 0.08, 'sawtooth', 0.1);
    return;
  }
  const data = await PDB().exportProfileData(C8.profile.active.id);
  if (!data || typeof JSZip === 'undefined') return;

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify({
    format: 'cartridge8-profile',
    version: 1,
    profileName: data.profile.name,
    exportedAt: data.exportedAt,
  }, null, 2));
  zip.file('profile.json', JSON.stringify(data, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = data.profile.name.replace(/[^\w\- ]+/g, '').trim() || 'perfil';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `c8-${safeName}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
  playSelectSound();
}

async function importProfileFromZip(file) {
  if (!file || typeof JSZip === 'undefined') return;
  try {
    const zip = await JSZip.loadAsync(file);
    const profileFile = zip.file('profile.json');
    if (!profileFile) throw new Error('missing profile.json');
    const text = await profileFile.async('string');
    const data = JSON.parse(text);
    const result = await PDB().importProfileData(data, { activate: true });
    if (!result.ok) {
      playBeep(180, 0.1, 'sawtooth', 0.12);
      alert(result.reason === 'max' ? 'Limite de 5 perfis atingido.' : 'Arquivo inválido.');
      return;
    }
    playSelectSound();
    await loadProfilesList();
    await activateProfile(result.profile);
    updateMenuProfileBadge();
  } catch {
    playBeep(180, 0.1, 'sawtooth', 0.12);
    alert('Não foi possível importar o ZIP.');
  }
}

function setupProfileInteractions() {
  if (dom.profileSelectCreate) {
    dom.profileSelectCreate.addEventListener('click', () => {
      playNavSound();
      openProfileEditor('create');
    });
  }
  if (dom.profileSelectCreateFirst) {
    dom.profileSelectCreateFirst.addEventListener('click', () => {
      playNavSound();
      openProfileEditor('create');
    });
  }
  if (dom.profilesBtnCreate) {
    dom.profilesBtnCreate.addEventListener('click', () => {
      playNavSound();
      openProfileEditor('create');
    });
  }
  if (dom.profilesBtnEdit) {
    dom.profilesBtnEdit.addEventListener('click', () => {
      const p = C8.profile.list[C8.profile.managerSelected];
      if (!p) return;
      playNavSound();
      openProfileEditor('edit', p.id);
    });
  }
  if (dom.profileEditorClose) {
    dom.profileEditorClose.addEventListener('click', () => {
      playNavSound();
      closeProfileEditor();
    });
  }
  if (dom.profileEditorSave) {
    dom.profileEditorSave.addEventListener('click', saveProfileEditor);
  }
  if (dom.profileEditorDelete) {
    dom.profileEditorDelete.addEventListener('click', deleteProfileEditor);
  }

  $$('.profile-mode-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.profile-info-btn')) return;
      C8.profile.selectedMode = card.dataset.mode;
      playNavSound();
      syncProfileEditorUI();
    });
  });

  $$('.profile-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.info;
      C8.profile.infoVisible = C8.profile.infoVisible === key ? null : key;
      playNavSound();
      syncProfileEditorUI();
    });
  });

  $$('.profile-kb-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      profileNameKey(btn.dataset.key);
      playNavSound();
    });
  });

  if (dom.profileNameInput) {
    dom.profileNameInput.addEventListener('input', () => {
      C8.profile.nameInput = dom.profileNameInput.value.slice(0, 24);
      syncProfileEditorUI();
    });
  }

  if (dom.profileImportFile) {
    dom.profileImportFile.addEventListener('change', async () => {
      const file = dom.profileImportFile.files?.[0];
      dom.profileImportFile.value = '';
      if (file) await importProfileFromZip(file);
    });
  }
}

// ============================================================
//  WEB AUDIO SYNTHESIZER & SFX ENGINE
// ============================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playBeep(freq = 440, duration = 0.05, type = 'square', vol = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playNavSound() {
  playBeep(320, 0.04, 'square', 0.05);
}

function playSelectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playBeep(523.25, 0.06, 'square', 0.08);
    setTimeout(() => playBeep(659.25, 0.08, 'square', 0.08), 50);
  } catch (e) {}
}

function playInsertCartSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Som mecânico de clique do cartucho
    playBeep(120, 0.08, 'sawtooth', 0.15);
    setTimeout(() => playBeep(280, 0.06, 'triangle', 0.12), 40);
    setTimeout(() => playBeep(880, 0.12, 'square', 0.1), 90);
  } catch (e) {}
}

function playSFX(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'jump') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(now + 0.15);
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(now + 0.12);
    } else if (type === 'coin') {
      playBeep(987.77, 0.08, 'square', 0.1);
      setTimeout(() => playBeep(1318.51, 0.15, 'square', 0.1), 70);
    } else if (type === 'explosion') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(now + 0.25);
    } else if (type === 'powerup') {
      const notes = [330, 392, 493, 659];
      notes.forEach((n, i) => {
        setTimeout(() => playBeep(n, 0.08, 'square', 0.08), i * 50);
      });
    }
  } catch (e) {}
}

// ============================================================
//  STATE MACHINE
// ============================================================
function setState(newState) {
  const prev = C8.state;
  C8.state   = newState;

  Object.values(dom.views).forEach(v => {
    if (v) v.classList.remove('active');
  });

  const view = dom.views[newState];
  if (view) view.classList.add('active');

  switch (newState) {
    case STATE.MENU:             onEnterMenu(); break;
    case STATE.PROFILE_SELECT:   onEnterProfileSelect(); break;
    case STATE.PROFILES:         onEnterProfilesManager(); break;
    case STATE.CARTRIDGE_SELECT: onEnterCartridgeSelect(); break;
    case STATE.APPS:             onEnterApps(); break;
    case STATE.LIBRARY:          onEnterLibrary(); break;
    case STATE.CONTROLLER:       /* handled in poll loop */; break;
    case STATE.OPTIONS:          onEnterOptions(); break;
  }

  if (prev === STATE.GAME && newState !== STATE.GAME) onExitGame();
}

// ============================================================
//  TERMINAL / BOOT
// ============================================================
async function addLine(text = '', cls = '') {
  const el = document.createElement('div');
  el.className = `terminal-line${cls ? ' ' + cls : ''}`;
  el.textContent = text;
  dom.termOut.appendChild(el);
  dom.termOut.scrollTop = dom.termOut.scrollHeight;
  return el;
}

async function typeLine(text, speed = 20, cls = '') {
  const el = document.createElement('div');
  el.className = `terminal-line${cls ? ' ' + cls : ''}`;
  dom.termOut.appendChild(el);
  for (const ch of text) {
    el.textContent += ch;
    dom.termOut.scrollTop = dom.termOut.scrollHeight;
    await sleep(speed);
  }
  return el;
}

async function bootIntro() {
  dom.termInputLine.style.display = 'none';

  dom.screen.classList.add('turning-on');
  await sleep(1300);
  dom.screen.classList.remove('turning-on');

  await sleep(100);
  await addLine();
  await typeLine('CARTRIDGE-8 BIOS v1.3.0 (REVISION 2026)', 18);
  await sleep(120);
  await addLine('© 2026 asafgameryDEV. Todos os direitos reservados.', 'dim');
  await sleep(250);
  await addLine();

  await addLine('Verificando hardware e periféricos v1.3...', 'dim');
  await sleep(350);

  const checks = [
    ['  CPU  : C8-6502 @ 1.7 MHz', 'ok', 100],
    ['  RAM  : 64 KB detectada',    'ok', 90],
    ['  VRAM : 8 KB detectada',     'ok', 90],
    ['  ESTANTE 3D: Pronta',        'ok', 90],
    ['  SINTETIZADOR: WebAudio OK', 'ok', 90],
    ['  VÍDEO: Monitor CRT OK',     'ok', 90],
  ];
  for (const [msg, cls, delay] of checks) {
    await addLine(msg, cls);
    await sleep(delay);
  }

  await sleep(200);
  await addLine();
  await typeLine('Sistema v1.3 pronto. Digite "boot" para iniciar.', 16);
  await addLine();

  dom.termInputLine.style.display = 'flex';
  dom.termStatus.textContent = 'AGUARDANDO';
  C8.terminal.waiting = true;
}

async function runBoot() {
  C8.terminal.waiting = false;
  dom.termInputLine.style.display = 'none';
  dom.termStatus.textContent = 'INICIANDO';

  await sleep(120);
  await addLine('> boot');
  await sleep(180);
  await typeLine('Iniciando Cartridge-8 OS v1.3...', 18);
  await sleep(150);

  const bar = document.createElement('div');
  bar.className = 'terminal-line progress';
  dom.termOut.appendChild(bar);
  for (let i = 0; i <= 20; i++) {
    bar.textContent = `[${'█'.repeat(i)}${'░'.repeat(20 - i)}] ${(i * 5).toString().padStart(3)}%`;
    dom.termOut.scrollTop = dom.termOut.scrollHeight;
    await sleep(30);
  }

  playSelectSound();
  await sleep(200);
  await addLine();
  await typeLine('SISTEMA V1.3 PRONTO. Bem-vindo ao Cartridge-8 OS!', 16);
  await sleep(400);

  await refreshGameIdsCache();
  await loadProfilesList();
  setState(STATE.PROFILE_SELECT);
}

function handleTerminalKey(key) {
  if (!C8.terminal.waiting) return;
  if (key === 'Enter') {
    const cmd = C8.terminal.input.trim().toLowerCase();
    C8.terminal.input = '';
    dom.termInputText.textContent = '';
    if (cmd === 'boot') {
      runBoot();
    } else if (cmd === 'help') {
      addLine();
      addLine('Comandos disponíveis:', 'dim');
      addLine('  boot — Iniciar o sistema v1.3', 'ok');
      addLine('  help — Esta mensagem', 'ok');
      addLine();
    } else if (cmd !== '') {
      addLine(`> ${cmd}`);
      addLine(`Comando desconhecido: "${cmd}". Tente "boot" ou "help".`, 'warn');
      addLine();
    }
  } else if (key === 'Backspace') {
    C8.terminal.input = C8.terminal.input.slice(0, -1);
    dom.termInputText.textContent = C8.terminal.input;
  } else if (key.length === 1) {
    C8.terminal.input += key;
    dom.termInputText.textContent = C8.terminal.input;
  }
}

// ============================================================
//  MENU PRINCIPAL
// ============================================================
function onEnterMenu() {
  updateMenuCarousel();
  updateMenuProfileBadge();
}

function updateMenuCarousel() {
  const selIdx = C8.menu.selectedIndex;

  dom.menuCards.forEach((card, i) => {
    const offset = i - selIdx;
    const absOffset = Math.abs(offset);

    const translateX = offset * 115;
    const scale = offset === 0 ? 1 : Math.max(0.72, 1 - absOffset * 0.18);
    const rotateY = offset * -18;
    const opacity = offset === 0 ? 1 : (absOffset === 1 ? 0.45 : 0);
    const zIndex  = 10 - absOffset;
    const pointerEvents = absOffset <= 1 ? 'auto' : 'none';

    card.style.transform = `translate(calc(-50% + ${translateX}%), -50%) scale(${scale}) rotateY(${rotateY}deg)`;
    card.style.opacity = opacity;
    card.style.zIndex = zIndex;
    card.style.pointerEvents = pointerEvents;

    card.classList.toggle('selected', offset === 0);
    card.setAttribute('tabindex', offset === 0 ? '0' : '-1');
  });

  dom.menuDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === selIdx);
  });
}

function menuNavigate(dir) {
  const len = C8.menu.items.length;
  C8.menu.selectedIndex = (C8.menu.selectedIndex + dir + len) % len;
  playNavSound();
  updateMenuCarousel();
}

function menuConfirm() {
  playSelectSound();
  const action = C8.menu.items[C8.menu.selectedIndex];
  switch (action) {
    case 'play':       setState(STATE.CARTRIDGE_SELECT); break;
    case 'apps':       setState(STATE.APPS);             break;
    case 'library':    setState(STATE.LIBRARY);          break;
    case 'profiles':   setState(STATE.PROFILES);         break;
    case 'controller': setState(STATE.CONTROLLER);       break;
    case 'options':    setState(STATE.OPTIONS);          break;
    case 'about':      setState(STATE.ABOUT);            break;
  }
}

// ============================================================
//  ESTANTE DE CARTUCHOS 3D (CARTRIDGE SELECT)
// ============================================================
// Lê games/games.json para obter a lista de IDs.
// Se falhar, retorna array vazio (nenhum cartucho na estante).
async function fetchGamesManifest() {
  try {
    const res = await fetch('games/games.json');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (Array.isArray(data.games) && data.games.length > 0) return data.games;
  } catch {}
  return FALLBACK_GAMES.map(g => g.id);
}

// Lê games/<id>/info.txt e constrói o objeto do jogo.
// Campos suportados: name, dev, version, desc, color, genre, year.
// Qualquer campo ausente usa o fallback genérico abaixo.
async function fetchGameInfo(gameId) {
  const fallback = FALLBACK_GAMES.find(g => g.id === gameId);
  const defaults = {
    id:      gameId,
    name:    gameId.toUpperCase(),
    dev:     'Desconhecido',
    version: '1.0',
    desc:    'Cartucho da biblioteca Cartridge-8.',
    color:   fallback?.color ?? '#0d1f3c',
    genre:   'Retro',
    year:    '2026',
  };

  try {
    const encodedId = encodeURIComponent(gameId);
    const res = await fetch(`games/${encodedId}/info.txt`);
    if (!res.ok) return defaults;
    const text = await res.text();
    const info = { ...defaults };
    text.split('\n').forEach(line => {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        if (k && v) info[k] = v;
      }
    });
    // Garante que o id nunca vem do info.txt (sempre é o nome da pasta)
    info.id = gameId;
    return info;
  } catch {
    return defaults;
  }
}

async function onEnterCartridgeSelect() {
  dom.cartridgeRack.innerHTML = '<div class="terminal-line dim">Carregando estante...</div>';
  dom.noCarts.style.display = 'none';

  const ids = await fetchGamesManifest();
  if (!ids || ids.length === 0) {
    dom.cartridgeRack.innerHTML = '';
    dom.noCarts.style.display = 'flex';
    C8.cartridgeSelect.games = [];
    return;
  }

  const games = [];
  for (const id of ids) games.push(await fetchGameInfo(id));

  C8.cartridgeSelect.games = games;
  C8.cartridgeSelect.selectedIndex = 0;
  dom.cartCount.textContent = `${games.length} CARTUCHO${games.length !== 1 ? 'S' : ''}`;
  renderCartridgeRack();
}

function renderCartridgeRack() {
  dom.cartridgeRack.innerHTML = '';
  const games = C8.cartridgeSelect.games;
  if (!games.length) return;

  const selIdx = C8.cartridgeSelect.selectedIndex;

  games.forEach((game, i) => {
    const locked = !profileUnlocked(game.id);
    const cartEl = document.createElement('div');
    cartEl.className = `c8-cartridge-3d${i === selIdx ? ' selected' : ''}${locked ? ' locked' : ''}`;
    cartEl.setAttribute('role', 'listitem');
    cartEl.setAttribute('tabindex', '0');

    // Cor do sticker base
    const bgColor = game.color && game.color !== '#FFFFFF' ? game.color : '#253550';

    cartEl.innerHTML = `
      <div class="cart-notch"></div>
      <div class="cart-grips">
        <div class="grip-line"></div>
        <div class="grip-line"></div>
        <div class="grip-line"></div>
      </div>
      <div class="cart-sticker" style="background:${bgColor}">
        <div class="cart-sticker-top">
          <span>CARTRIDGE-8</span>
          <span>C8</span>
        </div>
        <div class="cart-sticker-art">
          <div class="cart-sticker-title">${game.name}</div>
          <div class="cart-seal-icon">★ OFFICIAL SEAL ★</div>
        </div>
      </div>
      <div class="cart-pins-wrap">
        <div class="cart-pin"></div>
        <div class="cart-pin"></div>
        <div class="cart-pin"></div>
        <div class="cart-pin"></div>
        <div class="cart-pin"></div>
      </div>
    `;

    cartEl.addEventListener('click', () => {
      if (!profileUnlocked(game.id)) {
        playBeep(180, 0.08, 'sawtooth', 0.1);
        return;
      }
      if (C8.cartridgeSelect.selectedIndex === i) {
        cartridgeConfirm();
      } else {
        C8.cartridgeSelect.selectedIndex = i;
        playNavSound();
        renderCartridgeRack();
      }
    });

    dom.cartridgeRack.appendChild(cartEl);
  });

  // Atualizar painel de detalhes do cartucho ativo
  const activeGame = games[selIdx];
  if (activeGame) {
    dom.cartDetailsTitle.textContent = activeGame.name;
    dom.cartDetailsDesc.textContent  = activeGame.desc || 'Cartucho oficial para Cartridge-8.';
    dom.cartSpecDev.textContent     = activeGame.dev || 'Desconhecido';
    dom.cartSpecGenre.textContent   = activeGame.genre || 'Retro';
    dom.cartSpecYear.textContent    = activeGame.year || '2026';
    dom.cartSpecVer.textContent     = activeGame.version || '1.0';
  }
}

function cartridgeNavigate(dir) {
  const len = C8.cartridgeSelect.games.length;
  if (!len) return;
  C8.cartridgeSelect.selectedIndex = (C8.cartridgeSelect.selectedIndex + dir + len) % len;
  playNavSound();
  renderCartridgeRack();
}

function cartridgeConfirm() {
  const game = C8.cartridgeSelect.games[C8.cartridgeSelect.selectedIndex];
  if (game && profileUnlocked(game.id)) launchGame(game);
  else playBeep(180, 0.08, 'sawtooth', 0.1);
}

function launchGame(game) {
  playInsertCartSound();
  dom.screen.classList.add('turning-on');

  setTimeout(() => {
    dom.screen.classList.remove('turning-on');
    const encodedId = encodeURIComponent(game.id);
    dom.gameFrame.src = `games/${encodedId}/index.html`;
    dom.slotLabel.textContent = game.name.toUpperCase();
    dom.cartSlot.classList.add('game-inserted');
    setState(STATE.GAME);
  }, 400);
}

function onExitGame() {
  dom.gameFrame.src = 'about:blank';
  dom.slotLabel.textContent = 'CARTRIDGE SLOT';
  dom.cartSlot.classList.remove('game-inserted');
}

// ============================================================
//  APLICATIVOS DO CONSOLE v1.3 (SINTETIZADOR & PIXEL STUDIO)
// ============================================================
function onEnterApps() {
  setupSynthApp();
  setupPixelStudioApp();
}

function setupSynthApp() {
  const tabSynth = $('tab-synth');
  const tabPixel = $('tab-pixel');
  const appSynth = $('app-synth');
  const appPixel = $('app-pixel');

  if (tabSynth && tabPixel) {
    tabSynth.onclick = () => {
      tabSynth.classList.add('active');
      tabPixel.classList.remove('active');
      appSynth.classList.add('active');
      appPixel.classList.remove('active');
      C8.apps.activeApp = 'synth';
      playNavSound();
    };
    tabPixel.onclick = () => {
      tabPixel.classList.add('active');
      tabSynth.classList.remove('active');
      appPixel.classList.add('active');
      appSynth.classList.remove('active');
      C8.apps.activeApp = 'pixel';
      playNavSound();
    };
  }

  // Seletor de forma de onda
  $$('.wave-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.wave-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      C8.apps.synthWave = btn.getAttribute('data-wave');
      playNavSound();
    };
  });

  // Botões de SFX
  $$('.sfx-btn').forEach(btn => {
    btn.onclick = () => {
      const sfx = btn.getAttribute('data-sfx');
      playSFX(sfx);
    };
  });

  // Teclas do piano sintetizador
  $$('.synth-key').forEach(keyEl => {
    const fireKey = () => {
      const note = parseFloat(keyEl.getAttribute('data-note'));
      if (note) playBeep(note, 0.18, C8.apps.synthWave, 0.12);
      keyEl.classList.add('active');
      setTimeout(() => keyEl.classList.remove('active'), 150);
    };
    keyEl.onmousedown = fireKey;
    keyEl.ontouchstart = (e) => { e.preventDefault(); fireKey(); };
  });
}

// Atalhos de teclado para o Sintetizador
const KEY_NOTE_MAP = {
  'z': 261.63, 's': 277.18, 'x': 293.66, 'd': 311.13, 'c': 329.63,
  'v': 349.23, 'g': 369.99, 'b': 392.00, 'h': 415.30, 'n': 440.00,
  'j': 466.16, 'm': 493.88, ',': 523.25
};

function handleSynthKeyboard(key) {
  if (C8.state !== STATE.APPS || C8.apps.activeApp !== 'synth') return;
  const k = key.toLowerCase();
  if (KEY_NOTE_MAP[k]) {
    playBeep(KEY_NOTE_MAP[k], 0.18, C8.apps.synthWave, 0.12);
    // Ativar tecla visualmente
    $$('.synth-key').forEach(el => {
      const hint = el.querySelector('.key-hint');
      if (hint && hint.textContent.toLowerCase() === k) {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 150);
      }
    });
  }
}

// Pixel Studio 8 Engine
let isDrawingPixel = false;

function setupPixelStudioApp() {
  const canvas = $('pixel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Seletor de cores
  $$('.color-swatch').forEach(swatch => {
    swatch.onclick = () => {
      $$('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      C8.apps.pixelColor = swatch.getAttribute('data-color');
      playNavSound();
    };
  });

  // Ferramentas
  const toolPencil = $('tool-pencil');
  const toolEraser = $('tool-eraser');
  const toolClear  = $('tool-clear');

  if (toolPencil) {
    toolPencil.onclick = () => {
      toolPencil.classList.add('active');
      if (toolEraser) toolEraser.classList.remove('active');
      C8.apps.pixelTool = 'pencil';
      playNavSound();
    };
  }
  if (toolEraser) {
    toolEraser.onclick = () => {
      toolEraser.classList.add('active');
      if (toolPencil) toolPencil.classList.remove('active');
      C8.apps.pixelTool = 'eraser';
      playNavSound();
    };
  }
  if (toolClear) {
    toolClear.onclick = () => {
      ctx.fillStyle = '#141426';
      ctx.fillRect(0, 0, 16, 16);
      playSFX('explosion');
    };
  }

  const paintPixel = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.floor(((clientX - rect.left) / rect.width) * 16);
    const y = Math.floor(((clientY - rect.top) / rect.height) * 16);

    if (x >= 0 && x < 16 && y >= 0 && y < 16) {
      ctx.fillStyle = C8.apps.pixelTool === 'pencil' ? C8.apps.pixelColor : '#141426';
      ctx.fillRect(x, y, 1, 1);
    }
  };

  canvas.onmousedown = (e) => { isDrawingPixel = true; paintPixel(e); };
  canvas.onmousemove = (e) => { if (isDrawingPixel) paintPixel(e); };
  window.onmouseup   = () => { isDrawingPixel = false; };

  canvas.ontouchstart = (e) => { isDrawingPixel = true; paintPixel(e); };
  canvas.ontouchmove  = (e) => { if (isDrawingPixel) paintPixel(e); };
  canvas.ontouchend   = () => { isDrawingPixel = false; };
}

// ============================================================
//  BIBLIOTECA
// ============================================================
async function onEnterLibrary() {
  dom.libraryGrid.innerHTML =
    '<div class="terminal-line dim" style="padding:8px 0;">Carregando biblioteca...</div>';

  const ids = await fetchGamesManifest();
  if (!ids || !ids.length) {
    dom.libraryGrid.innerHTML = '<div class="terminal-line dim" style="padding:8px 0;">Biblioteca vazia.</div>';
    return;
  }

  dom.libraryGrid.innerHTML = '';
  for (const id of ids) {
    const game = await fetchGameInfo(id);
    const unlocked = profileUnlocked(id);
    const isHardcore = C8.profile.active?.mode === 'hardcore';
    const el = document.createElement('div');
    el.className = `library-item${unlocked ? '' : ' locked'}`;

    let actionsHtml = '';
    if (isHardcore) {
      if (unlocked) {
        actionsHtml = '<span class="library-unlocked-tag">DESBLOQUEADO</span>';
      } else {
        const canBuy = (C8.profile.active?.economy.coins || 0) >= PDB().C8_DB.GAME_PRICE;
        actionsHtml = `
          <span class="library-price">🪙 ${PDB().C8_DB.GAME_PRICE}</span>
          <button type="button" class="library-buy-btn" data-game-id="${escapeHtml(id)}" ${canBuy ? '' : 'disabled'}>COMPRAR</button>
        `;
      }
    } else if (unlocked) {
      actionsHtml = '<span class="library-unlocked-tag">DESBLOQUEADO</span>';
    }

    el.innerHTML = `
      <div class="library-cover" style="background:${game.color || '#0d1f3c'};">🎮</div>
      <div class="library-info">
        <div class="library-name">${escapeHtml(game.name)}</div>
        <div class="library-meta">DEV: ${escapeHtml(game.dev)} · ${escapeHtml(game.genre)} (${escapeHtml(game.year || '2026')})</div>
      </div>
      <div class="library-actions">${actionsHtml}</div>
    `;

    const buyBtn = el.querySelector('.library-buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', async () => {
        const result = await PDB().purchaseGame(C8.profile.active, id);
        if (result.ok) {
          playSFX('coin');
          C8.profile.active = result.profile;
          updateMenuProfileBadge();
          onEnterLibrary();
        } else {
          playBeep(180, 0.08, 'sawtooth', 0.1);
        }
      });
    }

    dom.libraryGrid.appendChild(el);
  }
}

// ============================================================
//  OPÇÕES
// ============================================================
function onEnterOptions() {
  C8.options.selectedIndex = 0;
  syncOptionsUI();
}

function syncOptionsUI() {
  dom.optionItems.forEach((el, i) => {
    el.classList.toggle('selected', i === C8.options.selectedIndex);
  });
}

function toggleCRT() {
  C8.settings.crtEnabled = !C8.settings.crtEnabled;
  dom.toggleCrt.classList.toggle('active', C8.settings.crtEnabled);
  dom.crtValue.textContent = C8.settings.crtEnabled ? 'ON' : 'OFF';
  applyCRTSettings();
  playNavSound();
}

function toggleScanlines() {
  C8.settings.scanlinesEnabled = !C8.settings.scanlinesEnabled;
  dom.toggleScanlines.classList.toggle('active', C8.settings.scanlinesEnabled);
  dom.scanlinesValue.textContent = C8.settings.scanlinesEnabled ? 'ON' : 'OFF';
  applyCRTSettings();
  playNavSound();
}

function toggleNoise() {
  C8.settings.noiseEnabled = !C8.settings.noiseEnabled;
  dom.toggleNoise.classList.toggle('active', C8.settings.noiseEnabled);
  dom.noiseValue.textContent = C8.settings.noiseEnabled ? 'ON' : 'OFF';
  applyCRTSettings();
  playNavSound();
}

function applyCRTSettings() {
  dom.body.classList.toggle('crt-off', !C8.settings.crtEnabled);
  if (dom.crtScanlines) dom.crtScanlines.style.display = C8.settings.scanlinesEnabled ? '' : 'none';
  if (dom.crtNoise)     dom.crtNoise.style.display     = C8.settings.noiseEnabled ? '' : 'none';
  if (dom.screen)       dom.screen.style.filter        = `brightness(${C8.settings.brightness}%)`;
}

function optionsNavigate(dir) {
  const len = C8.options.items.length;
  C8.options.selectedIndex = (C8.options.selectedIndex + dir + len) % len;
  playNavSound();
  syncOptionsUI();
}

function optionsConfirm() {
  const opt = C8.options.items[C8.options.selectedIndex];
  switch (opt) {
    case 'crt':            toggleCRT(); break;
    case 'scanlines':      toggleScanlines(); break;
    case 'noise':          toggleNoise(); break;
    case 'export-profile': exportActiveProfileZip(); break;
    case 'import-profile':
      if (dom.profileImportFile) dom.profileImportFile.click();
      break;
  }
}

// ============================================================
//  GLOBAL NAVIGATION / HANDLERS
// ============================================================
function profileSelectNavigate(dir) {
  const listLen = C8.profile.list.length;
  const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
  const len = listLen + (canCreate ? 1 : 0);
  if (!len) return;
  C8.profile.selectedIndex = (C8.profile.selectedIndex + dir + len) % len;
  playNavSound();
  syncProfileSelectSelectionUI();
}

function handleNavigate(dir) {
  if (C8.profile.editorOpen) {
    profileEditorNavigate(dir);
    return;
  }
  switch (C8.state) {
    case STATE.MENU:             menuNavigate(dir);      break;
    case STATE.PROFILE_SELECT:   profileSelectNavigate(dir); break;
    case STATE.CARTRIDGE_SELECT: cartridgeNavigate(dir); break;
    case STATE.OPTIONS:          optionsNavigate(dir);   break;
    case STATE.PROFILES:         profilesManagerNavigate(dir); break;
  }
}

function profilesManagerNavigate(dir) {
  const listLen = C8.profile.list.length;
  const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
  const total = listLen === 0 ? 1 : listLen + (canCreate ? 2 : 1);
  if (!total) return;

  C8.profile.managerSelectionIndex = (C8.profile.managerSelectionIndex + dir + total) % total;
  playNavSound();
  syncProfilesManagerSelectionUI();
}

function handleConfirm() {
  if (C8.profile.editorOpen) {
    profileEditorConfirm();
    return;
  }
  switch (C8.state) {
    case STATE.MENU:             menuConfirm();      break;
    case STATE.PROFILE_SELECT: {
      const listLen = C8.profile.list.length;
      const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
      if (listLen === 0) {
        if (dom.profileSelectCreateFirst) dom.profileSelectCreateFirst.click();
        return;
      }
      if (canCreate && C8.profile.selectedIndex === listLen) {
        if (dom.profileSelectCreate) dom.profileSelectCreate.click();
        return;
      }
      const p = C8.profile.list[C8.profile.selectedIndex];
      if (p) selectProfileFromBoot(p.id);
      break;
    }
    case STATE.CARTRIDGE_SELECT: cartridgeConfirm(); break;
    case STATE.OPTIONS:          optionsConfirm();   break;
    case STATE.PROFILES: {
      const listLen = C8.profile.list.length;
      const canCreate = listLen < PDB().C8_DB.MAX_PROFILES;
      const createIndex = listLen === 0 ? 0 : listLen;
      const editIndex = listLen === 0 ? -1 : canCreate ? listLen + 1 : listLen;

      if (C8.profile.managerSelectionIndex === createIndex) {
        if (dom.profilesBtnCreate && !dom.profilesBtnCreate.disabled) {
          dom.profilesBtnCreate.click();
          return;
        }
      }
      if (C8.profile.managerSelectionIndex === editIndex) {
        if (dom.profilesBtnEdit) {
          dom.profilesBtnEdit.click();
          return;
        }
      }
      if (C8.profile.managerSelectionIndex < listLen) {
        const p = C8.profile.list[C8.profile.managerSelectionIndex];
        if (p) switchToProfile(p.id);
      }
      break;
    }
  }
}

function handleBack() {
  if (C8.profile.editorOpen) {
    playNavSound();
    closeProfileEditor();
    return;
  }
  playNavSound();
  if (C8.state === STATE.GAME) {
    setState(STATE.CARTRIDGE_SELECT);
  } else if (C8.state === STATE.PROFILE_SELECT) {
    /* não volta do boot */
  } else if (C8.state !== STATE.MENU && C8.state !== STATE.BOOT) {
    setState(STATE.MENU);
  }
}

function handleProfileEditorKey(key) {
  if (key === 'Backspace') {
    profileNameKey('Backspace');
  } else if (key.length === 1) {
    profileNameKey(key);
  }
}

// Keyboard Listeners — profile editor handled above
document.addEventListener('keydown', e => {
  if (C8.profile.editorOpen && !isMobileInput()) {
    if (e.key === 'Escape') {
      closeProfileEditor();
      return;
    }
    if (e.key === 'Enter') {
      saveProfileEditor();
      return;
    }
    handleProfileEditorKey(e.key);
    if (e.key.length === 1 || e.key === 'Backspace') e.preventDefault();
    return;
  }

  if (C8.state === STATE.BOOT) {
    handleTerminalKey(e.key);
    return;
  }

  // Soundwave synth key listener
  handleSynthKeyboard(e.key);

  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      handleNavigate(-1);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      handleNavigate(1);
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      handleNavigate(-1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      handleNavigate(1);
      break;
    case 'Enter':
    case ' ':
      handleConfirm();
      break;
    case 'Escape':
    case 'Backspace':
      handleBack();
      break;
    case 'F6':
      e.preventDefault();
      toggleCRT();
      break;
  }
});

// ============================================================
//  GAMEPAD ENGINE
// ============================================================
const GP_MAP = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const NAV_REPEAT_DELAY = 220;

function pollGamepad() {
  requestAnimationFrame(pollGamepad);
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].connected) { gp = gamepads[i]; break; }
  }

  updateControllerDisplay(gp);
  updateVirtualCursor(gp);
  if (!gp) return;

  const now = performance.now();
  const prev = C8.gamepad.prevButtons;
  const justPressed = i => !!gp.buttons[i]?.pressed && !prev[i];

  if (C8.state === STATE.GAME) {
    const isCombo = gp.buttons[GP_MAP.SELECT]?.pressed && gp.buttons[GP_MAP.START]?.pressed;
    if (isCombo && !C8.gamepad.comboTriggered) {
      C8.gamepad.comboTriggered = true;
      handleBack();
    } else if (!isCombo) {
      C8.gamepad.comboTriggered = false;
    }
    C8.gamepad.prevButtons = Array.from(gp.buttons).map(b => b.pressed);
    return;
  }

  if (C8.state !== STATE.APPS) {
    const navLeft  = gp.buttons[GP_MAP.LEFT]?.pressed  || gp.axes[0] < -0.5 || gp.buttons[GP_MAP.UP]?.pressed   || gp.axes[1] < -0.5;
    const navRight = gp.buttons[GP_MAP.RIGHT]?.pressed || gp.axes[0] >  0.5 || gp.buttons[GP_MAP.DOWN]?.pressed || gp.axes[1] >  0.5;

    if ((navLeft || navRight) && now - C8.gamepad.lastNavTime > NAV_REPEAT_DELAY) {
      C8.gamepad.lastNavTime = now;
      if (C8.state !== STATE.BOOT) handleNavigate(navLeft ? -1 : 1);
    }

    if (justPressed(GP_MAP.A)) handleConfirm();
  }

  if (justPressed(GP_MAP.B)) handleBack();
  if (justPressed(GP_MAP.START)) {
    if (C8.state === STATE.BOOT) handleTerminalKey('Enter');
    else if (C8.state !== STATE.APPS) handleConfirm();
  }
  if (justPressed(GP_MAP.SELECT) && C8.state === STATE.BOOT) {
    C8.terminal.input = 'boot';
    dom.termInputText.textContent = 'boot';
  }

  C8.gamepad.prevButtons = Array.from(gp.buttons).map(b => b.pressed);
}

function updateVirtualCursor(gp) {
  if (!dom.virtualCursor) return;

  if (C8.state !== STATE.APPS) {
    if (C8.virtualCursor.visible) {
      C8.virtualCursor.visible = false;
      dom.virtualCursor.classList.remove('active');
    }
    return;
  }

  if (!gp) return;

  const screenRect = dom.screen.getBoundingClientRect();
  if (!screenRect.width || !screenRect.height) return;

  let dx = 0;
  let dy = 0;

  if (Math.abs(gp.axes[0] || 0) > 0.15) dx = gp.axes[0];
  if (Math.abs(gp.axes[1] || 0) > 0.15) dy = gp.axes[1];

  if (gp.buttons[GP_MAP.LEFT]?.pressed)  dx = -1;
  if (gp.buttons[GP_MAP.RIGHT]?.pressed) dx = 1;
  if (gp.buttons[GP_MAP.UP]?.pressed)    dy = -1;
  if (gp.buttons[GP_MAP.DOWN]?.pressed)  dy = 1;

  const speed = 4.8;
  if (dx !== 0 || dy !== 0) {
    C8.virtualCursor.x += dx * speed;
    C8.virtualCursor.y += dy * speed;
    C8.virtualCursor.x = Math.max(5, Math.min(screenRect.width - 5, C8.virtualCursor.x));
    C8.virtualCursor.y = Math.max(5, Math.min(screenRect.height - 5, C8.virtualCursor.y));

    if (!C8.virtualCursor.visible) {
      C8.virtualCursor.visible = true;
      dom.virtualCursor.classList.add('active');
    }
  }

  dom.virtualCursor.style.left = `${C8.virtualCursor.x}px`;
  dom.virtualCursor.style.top  = `${C8.virtualCursor.y}px`;

  const isAPressed = !!gp.buttons[GP_MAP.A]?.pressed;
  const targetEl = document.elementFromPoint(
    screenRect.left + C8.virtualCursor.x,
    screenRect.top + C8.virtualCursor.y
  );

  if (isAPressed) {
    dom.virtualCursor.classList.add('clicking');
    if (!C8.virtualCursor.isDown) {
      C8.virtualCursor.isDown = true;
      if (targetEl) {
        targetEl.click();
        const evt = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: screenRect.left + C8.virtualCursor.x,
          clientY: screenRect.top + C8.virtualCursor.y
        });
        targetEl.dispatchEvent(evt);
      }
    } else {
      if (targetEl) {
        const evt = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: screenRect.left + C8.virtualCursor.x,
          clientY: screenRect.top + C8.virtualCursor.y
        });
        targetEl.dispatchEvent(evt);
      }
    }
  } else {
    dom.virtualCursor.classList.remove('clicking');
    if (C8.virtualCursor.isDown) {
      C8.virtualCursor.isDown = false;
      const evt = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
      window.dispatchEvent(evt);
    }
  }
}

// ============================================================
//  CONTROLLER DISPLAY VIEW
// ============================================================
function updateControllerDisplay(gp) {
  if (C8.state !== STATE.CONTROLLER) return;

  if (!gp) {
    dom.noGamepadMsg.style.display  = '';
    dom.gamepadVisual.style.display = 'none';
    return;
  }

  dom.noGamepadMsg.style.display  = 'none';
  dom.gamepadVisual.style.display = '';
  dom.gamepadName.textContent     = gp.id.slice(0, 45);

  const setBtnState = (elId, pressed) => {
    const el = $(elId);
    if (el) el.classList.toggle('pressed', !!pressed);
  };

  setBtnState('gp-a',      gp.buttons[GP_MAP.A]?.pressed);
  setBtnState('gp-b',      gp.buttons[GP_MAP.B]?.pressed);
  setBtnState('gp-x',      gp.buttons[GP_MAP.X]?.pressed);
  setBtnState('gp-y',      gp.buttons[GP_MAP.Y]?.pressed);
  setBtnState('gp-up',     gp.buttons[GP_MAP.UP]?.pressed    || gp.axes[1] < -0.5);
  setBtnState('gp-down',   gp.buttons[GP_MAP.DOWN]?.pressed  || gp.axes[1] >  0.5);
  setBtnState('gp-left',   gp.buttons[GP_MAP.LEFT]?.pressed  || gp.axes[0] < -0.5);
  setBtnState('gp-right',  gp.buttons[GP_MAP.RIGHT]?.pressed || gp.axes[0] >  0.5);
  setBtnState('gp-select', gp.buttons[GP_MAP.SELECT]?.pressed);
  setBtnState('gp-start',  gp.buttons[GP_MAP.START]?.pressed);
  setBtnState('gp-l1',     gp.buttons[GP_MAP.LB]?.pressed);
  setBtnState('gp-r1',     gp.buttons[GP_MAP.RB]?.pressed);
  setBtnState('gp-l2',     gp.buttons[GP_MAP.LT]?.pressed);
  setBtnState('gp-r2',     gp.buttons[GP_MAP.RT]?.pressed);

  if (gp.axes.length >= 2) {
    const a = v => v.toFixed(2).replace('-0.00', '0.00');
    dom.axesDisplay.textContent =
      `LS: ${a(gp.axes[0])}, ${a(gp.axes[1])}` +
      (gp.axes.length >= 4 ? `  RS: ${a(gp.axes[2])}, ${a(gp.axes[3])}` : '');
  }
}

// ============================================================
//  MOBILE VIRTUAL CONTROLS
// ============================================================
function setupMobileControls() {
  const bind = (id, fn) => {
    const el = $(id);
    if (!el) return;
    const fire = e => { e.preventDefault(); fn(); };
    el.addEventListener('touchstart', fire, { passive: false });
    el.addEventListener('mousedown',  fire);
  };

  bind('m-left',  () => handleNavigate(-1));
  bind('m-right', () => handleNavigate(1));
  bind('m-up',    () => handleNavigate(-1));
  bind('m-down',  () => handleNavigate(1));
  bind('m-a',     handleConfirm);
  bind('m-b',     handleBack);
  bind('m-start', () => {
    if (C8.state === STATE.BOOT) handleTerminalKey('Enter');
    else if (C8.state === STATE.GAME) handleBack();
    else handleConfirm();
  });
  bind('m-select', () => {
    if (C8.state === STATE.BOOT) {
      C8.terminal.input = 'boot';
      dom.termInputText.textContent = 'boot';
    } else {
      handleBack();
    }
  });
}

// ============================================================
//  NOISE CANVAS (Tiling Pattern GPU)
// ============================================================
function setupNoiseCanvas() {
  const canvas = dom.crtNoise;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const noiseSize = 64;
  const noiseFrames = [];
  for (let f = 0; f < 4; f++) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = noiseSize;
    offCanvas.height = noiseSize;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(noiseSize, noiseSize);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);
    noiseFrames.push(offCanvas);
  }

  let frameIdx = 0;
  const drawNoise = () => {
    if (!C8.settings.noiseEnabled) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    const pattern = ctx.createPattern(noiseFrames[frameIdx], 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      const offsetX = (Math.random() * noiseSize) | 0;
      const offsetY = (Math.random() * noiseSize) | 0;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.fillRect(-offsetX, -offsetY, w + noiseSize, h + noiseSize);
      ctx.restore();
    }

    frameIdx = (frameIdx + 1) % noiseFrames.length;
  };

  setInterval(drawNoise, 100);
}

// ============================================================
//  INTERACTION BINDINGS
// ============================================================
function setupMenuInteractions() {
  dom.menuCards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (C8.menu.selectedIndex === i) menuConfirm();
      else {
        C8.menu.selectedIndex = i;
        playNavSound();
        updateMenuCarousel();
      }
    });
  });

  if (dom.navLeft)  dom.navLeft.addEventListener('click', () => menuNavigate(-1));
  if (dom.navRight) dom.navRight.addEventListener('click', () => menuNavigate(1));

  dom.menuDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      C8.menu.selectedIndex = i;
      playNavSound();
      updateMenuCarousel();
    });
  });

  if (dom.rackPrev) dom.rackPrev.addEventListener('click', () => cartridgeNavigate(-1));
  if (dom.rackNext) dom.rackNext.addEventListener('click', () => cartridgeNavigate(1));
  if (dom.btnInsertPlay) dom.btnInsertPlay.addEventListener('click', cartridgeConfirm);
}

function setupOptionsInteractions() {
  dom.toggleCrt.addEventListener('click', toggleCRT);
  dom.toggleScanlines.addEventListener('click', toggleScanlines);
  dom.toggleNoise.addEventListener('click', toggleNoise);
  dom.brightSlider.addEventListener('input', () => {
    C8.settings.brightness = parseInt(dom.brightSlider.value, 10);
    dom.brightValue.textContent = `${C8.settings.brightness}%`;
    applyCRTSettings();
  });
  dom.optionItems.forEach((el, i) => {
    el.addEventListener('mouseenter', () => {
      C8.options.selectedIndex = i;
      syncOptionsUI();
    });
    el.addEventListener('click', () => {
      C8.options.selectedIndex = i;
      optionsConfirm();
    });
  });
}

function setupBackButtons() {
  $$('.back-btn').forEach(btn => {
    btn.addEventListener('click', handleBack);
  });
}

window.addEventListener('message', e => {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === 'exit') handleBack();
});

// ============================================================
//  INIT
// ============================================================
async function init() {
  await PDB().openDB();
  await refreshGameIdsCache();
  setupMenuInteractions();
  setupOptionsInteractions();
  setupBackButtons();
  setupMobileControls();
  setupProfileInteractions();
  setupNoiseCanvas();
  applyCRTSettings();
  pollGamepad();
  bootIntro();
}

document.addEventListener('DOMContentLoaded', init);

