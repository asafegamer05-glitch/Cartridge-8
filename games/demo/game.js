/* ============================================
   STAR BLASTER — Cartridge-8 Demo Game v2
   Controles: WASD / Setas + ESPAÇO / Z para atirar
              Gamepad: D-pad / Analógico + Botão A / X
              SAIR: SELECT + START (Gamepad) ou ESC (Teclado)
   Multiplayer: WebRTC P2P (sem servidor)
   ============================================ */
'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const W = 256, H = 224; // Resolução nativa retrô
canvas.width  = W;
canvas.height = H;

function resizeCanvas() {
  const containerW = window.innerWidth  || document.documentElement.clientWidth;
  const containerH = window.innerHeight || document.documentElement.clientHeight;
  const scale = Math.min(containerW / W, containerH / H);
  canvas.style.width  = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── Palette ────────────────────────────────────────────────────
const PAL = {
  bg:        '#000c18',
  star:      '#5de4ff',
  starDim:   '#1a4a60',
  ship:      '#5de4ff',   // Jogador 1 (ou solo)
  ship2:     '#ff6090',   // Jogador 2
  bullet:    '#ffd166',
  bullet2:   '#ff9de2',   // Balas do jogador 2
  enemy:     '#ff6090',
  boom:      '#ffd166',
  text:      '#5de4ff',
  textDim:   '#2a6a80',
};

// ── Game States ────────────────────────────────────────────────
const GS = {
  TITLE:    'TITLE',
  PLAYING:  'PLAYING',
  DEAD:     'DEAD',
  GAMEOVER: 'GAMEOVER',
};

let state     = GS.TITLE;
let score     = 0;
let hiScore   = 0;
let lives     = 3;
let level     = 1;
let frameNum  = 0;
let spawnRate = 120;

// Entities
let ship;
let bullets   = [];
let enemies   = [];
let particles = [];
let stars     = [];

// Input
const keys = {};
let shootCooldown = 0;
let deadTimer     = 0;
let invincTimer   = 0;

// Gamepad
const GP = {
  up: false, down: false, left: false, right: false,
  shoot: false, start: false, select: false,
};

// ── Multiplayer State ──────────────────────────────────────────
// Definido aqui no topo para evitar erros de referência
const MP = {
  active:       false,
  role:         null,   // 'host' | 'guest'
  pc:           null,   // RTCPeerConnection
  dc:           null,   // RTCDataChannel
  connected:    false,
  ship2:        null,   // { x, y } posição da nave remota
  invincTimer2: 0,      // invencibilidade da nave remota (host rastreia)
  guestShot:    false,  // flag: guest atirou neste frame
  sendTick:     0,      // contador para throttle de envio
};

// ── Title menu focus / gamepad navigation ──────────────────────
let titleMenuIndex = 0;
const TITLE_MENU_BUTTON_IDS = ['btn-solo', 'btn-mp'];
let gpLastNavTime = 0;
let gpLastAPressed = false;
const GP_NAV_DELAY = 220;

function updateTitleMenuFocus() {
  const menu = document.getElementById('overlay-menu');
  if (!menu || menu.classList.contains('hidden')) return;
  const btns = TITLE_MENU_BUTTON_IDS.map(id => document.getElementById(id)).filter(Boolean);
  if (!btns.length) return;
  if (titleMenuIndex < 0) titleMenuIndex = 0;
  if (titleMenuIndex >= btns.length) titleMenuIndex = btns.length - 1;
  btns.forEach((b, i) => {
    try { if (i === titleMenuIndex) { b.focus(); b.classList.add('focused'); } else b.classList.remove('focused'); } catch (_) {}
  });
}

// ── Generic overlay button navigation ─────────────────────────
const MP_OVERLAYS = ['disclaimer-overlay', 'mp-mode-overlay', 'mp-host-overlay', 'mp-guest-overlay'];
const overlayIndices = {};

function getOverlayButtons(overlayId) {
  const el = document.getElementById(overlayId);
  if (!el) return [];
  // prefer explicit buttons; also include .mp-action-btn and .menu-btn
  const btns = Array.from(el.querySelectorAll('button, .mp-action-btn, .menu-btn'))
    .filter(b => b instanceof HTMLElement && b.offsetParent !== null);
  return btns;
}

function updateOverlayFocus(overlayId) {
  const btns = getOverlayButtons(overlayId);
  if (!btns.length) return;
  if (overlayIndices[overlayId] == null) overlayIndices[overlayId] = 0;
  let idx = overlayIndices[overlayId];
  if (idx < 0) idx = 0;
  if (idx >= btns.length) idx = btns.length - 1;
  overlayIndices[overlayId] = idx;
  btns.forEach((b, i) => {
    try { if (i === idx) { b.focus(); b.classList.add('focused'); } else b.classList.remove('focused'); } catch (_) {}
  });
}

// ── Helpers ────────────────────────────────────────────────────
const rnd   = (a, b) => Math.random() * (b - a) + a;
const irnd  = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist  = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ── Stars ──────────────────────────────────────────────────────
function initStars() {
  stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({
      x:      rnd(0, W),
      y:      rnd(0, H),
      speed:  rnd(0.15, 0.8),
      size:   rnd(0.5, 1.5),
      bright: Math.random() > 0.7,
    });
  }
}

function updateStars() {
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > H) { s.y = 0; s.x = rnd(0, W); }
  });
}

function drawStars() {
  stars.forEach(s => {
    ctx.fillStyle   = s.bright ? PAL.star : PAL.starDim;
    ctx.globalAlpha = s.bright ? 0.8 + Math.sin(frameNum * 0.05 + s.x) * 0.2 : 0.4;
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
  });
  ctx.globalAlpha = 1;
}

// ── Ship ────────────────────────────────────────────────────────
function createShip(startX) {
  return { x: startX !== undefined ? startX : W / 2, y: H - 30, w: 10, h: 12, speed: 2 };
}

/**
 * Desenha a forma da nave com a cor indicada.
 * @param {object} s     - { x, y }
 * @param {string} color - PAL.ship ou PAL.ship2
 */
function drawShipShape(s, color) {
  const alpha = color === PAL.ship2 ? 'rgba(255,96,144,' : 'rgba(93,228,255,';
  const glowR = 4 + Math.sin(frameNum * 0.2) * 1.5;
  const grd   = ctx.createRadialGradient(s.x, s.y + 8, 0, s.x, s.y + 8, glowR * 2);
  grd.addColorStop(0, alpha + '0.6)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(s.x - glowR * 2, s.y, glowR * 4, glowR * 4);

  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;
  ctx.beginPath();
  ctx.moveTo(s.x,      s.y);
  ctx.lineTo(s.x + 5,  s.y + 10);
  ctx.lineTo(s.x + 2,  s.y + 8);
  ctx.lineTo(s.x,      s.y + 12);
  ctx.lineTo(s.x - 2,  s.y + 8);
  ctx.lineTo(s.x - 5,  s.y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = alpha + '0.5)';
  ctx.fillRect(s.x - 8, s.y + 6, 4, 3);
  ctx.fillRect(s.x + 4, s.y + 6, 4, 3);
  ctx.shadowBlur = 0;
}

function drawShip(s) {
  if (invincTimer > 0 && frameNum % 6 < 3) return;
  drawShipShape(s, PAL.ship);
}

function updateShip() {
  if (!ship) return;
  const left  = keys['ArrowLeft']  || keys['a'] || keys['A'] || GP.left;
  const right = keys['ArrowRight'] || keys['d'] || keys['D'] || GP.right;
  const up    = keys['ArrowUp']    || keys['w'] || keys['W'] || GP.up;
  const down  = keys['ArrowDown']  || keys['s'] || keys['S'] || GP.down;
  const shoot = keys[' '] || keys['z'] || keys['Z'] || GP.shoot;

  if (left)  ship.x -= ship.speed;
  if (right) ship.x += ship.speed;
  if (up)    ship.y -= ship.speed;
  if (down)  ship.y += ship.speed;

  ship.x = clamp(ship.x, ship.w, W - ship.w);
  ship.y = clamp(ship.y, 10, H - 5);

  if (shoot && shootCooldown <= 0) {
    const isGuest  = MP.active && MP.role === 'guest';
    const bColor   = isGuest ? PAL.bullet2 : PAL.bullet;
    bullets.push({ x: ship.x, y: ship.y - 4, vy: -4.5, w: 2, h: 5, fromGuest: isGuest });
    shootCooldown   = 14;
    MP.guestShot    = isGuest; // sinaliza para enviar ao host
    spawnParticle(ship.x, ship.y - 4, bColor, 3, -4, 0.3);
  }
  if (shootCooldown > 0) shootCooldown--;
  if (invincTimer  > 0) invincTimer--;
}

// ── Bullets ────────────────────────────────────────────────────
function drawBullet(b) {
  const color = b.fromGuest ? PAL.bullet2 : PAL.bullet;
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h);
  ctx.shadowBlur  = 0;
}

// ── Enemies ────────────────────────────────────────────────────
function spawnEnemy() {
  const big   = level >= 3 && Math.random() < 0.2;
  const speed = rnd(0.4, 0.8 + level * 0.12);
  const r     = big ? irnd(10, 16) : irnd(5, 10);
  const sides = irnd(5, 8);
  const drift = rnd(-0.4, 0.4);
  enemies.push({
    x:     rnd(r + 4, W - r - 4),
    y:     -r * 2,
    r, sides, speed, drift,
    hp:    big ? 3 : 1,
    rot:   rnd(0, Math.PI * 2),
    rotV:  rnd(-0.04, 0.04),
    big,
  });
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.rot);

  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, e.r * 1.5);
  grd.addColorStop(0, 'rgba(255,96,144,0.25)');
  grd.addColorStop(1, 'rgba(255,96,144,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, e.r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PAL.enemy;
  ctx.lineWidth   = e.big ? 1.5 : 1;
  ctx.shadowColor = PAL.enemy;
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  for (let i = 0; i <= e.sides; i++) {
    const a  = (i / e.sides) * Math.PI * 2;
    const rr = e.r * (0.85 + Math.sin(a * 2.5) * 0.15);
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else         ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.stroke();

  if (e.big && e.hp > 1) {
    ctx.fillStyle  = PAL.enemy;
    ctx.shadowBlur = 0;
    for (let i = 0; i < e.hp; i++) ctx.fillRect(-4 + i * 4, e.r + 3, 2, 2);
  }
  ctx.restore();
}

function updateEnemies() {
  enemies.forEach(e => {
    e.y   += e.speed;
    e.x   += e.drift;
    e.rot += e.rotV;
    e.x    = clamp(e.x, e.r, W - e.r);
  });
  enemies = enemies.filter(e => e.y < H + e.r * 2);
}

// ── Particles ──────────────────────────────────────────────────
function spawnParticle(x, y, color, count = 8, vy = 0, speed = 1.5) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(0.5, speed);
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s + vy,
      life: 1, decay: rnd(0.04, 0.09),
      size: rnd(1, 2.5),
      color,
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.life -= p.decay;
    p.vy   += 0.04;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;
}

// ── Collision ──────────────────────────────────────────────────
function checkCollisions() {
  // Balas x inimigos
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (dist(b, e) < e.r + 2) {
        bullets.splice(bi, 1);
        e.hp--;
        spawnParticle(b.x, b.y, b.fromGuest ? PAL.bullet2 : PAL.bullet, 4);
        if (e.hp <= 0) {
          score += e.big ? 30 : 10;
          spawnParticle(e.x, e.y, PAL.enemy, 12);
          spawnParticle(e.x, e.y, PAL.boom,  6);
          enemies.splice(ei, 1);
          updateScoreUI();
          level     = Math.floor(score / 200) + 1;
          spawnRate = Math.max(40, 120 - level * 12);
        }
        break;
      }
    }
  }

  // Nave 1 x inimigos
  if (ship && invincTimer <= 0) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (dist(ship, e) < e.r + 5) {
        enemies.splice(ei, 1);
        spawnParticle(ship.x, ship.y, PAL.ship, 15, 0, 2);
        lives--;
        updateLivesUI();
        if (lives <= 0) {
          state = GS.GAMEOVER;
          if (score > hiScore) hiScore = score;
          showOverlay('GAME OVER', `PONTUAÇÃO: ${score}`, MP.active ? 'ESC PARA SAIR' : 'ENTER / A PARA REINICIAR');
        } else {
          invincTimer = 120;
          state       = GS.DEAD;
          deadTimer   = 60;
        }
        break;
      }
    }
  }

  // Nave 2 (guest) x inimigos — só host verifica
  if (MP.active && MP.role === 'host' && MP.ship2 && MP.invincTimer2 <= 0) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (dist(MP.ship2, e) < e.r + 5) {
        enemies.splice(ei, 1);
        spawnParticle(MP.ship2.x, MP.ship2.y, PAL.ship2, 15, 0, 2);
        lives--;
        updateLivesUI();
        if (lives <= 0) {
          state = GS.GAMEOVER;
          if (score > hiScore) hiScore = score;
          showOverlay('GAME OVER', `PONTUAÇÃO: ${score}`, 'ESC PARA SAIR');
        } else {
          MP.invincTimer2 = 120;
        }
        break;
      }
    }
  }
  if (MP.invincTimer2 > 0) MP.invincTimer2--;
}

// ── UI ─────────────────────────────────────────────────────────
function updateScoreUI() {
  document.getElementById('score-value').textContent = score;
}
function updateLivesUI() {
  const el = document.getElementById('lives-icons');
  el.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const ic      = document.createElement('span');
    ic.className  = 'life-icon';
    ic.textContent = '▲';
    el.appendChild(ic);
  }
}
function showOverlay(title, sub = '', hint = '', showMenu = false) {
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-sub').textContent   = sub;
  document.getElementById('overlay-hint').textContent  = hint;
  const menu = document.getElementById('overlay-menu');
  showMenu ? menu.classList.remove('hidden') : menu.classList.add('hidden');
  if (showMenu) {
    // garantir foco no botão atual (teclado/gamepad)
    updateTitleMenuFocus();
  }
}
function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

// ── Render Loop ────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);

  drawStars();
  drawParticles();

  bullets.forEach(b => drawBullet(b));
  enemies.forEach(e => drawEnemy(e));

  if (ship && state === GS.PLAYING) drawShip(ship);
  if (state === GS.DEAD && invincTimer > 0 && ship) drawShip(ship);

  // Nave do jogador remoto
  if (MP.active && MP.ship2 && (state === GS.PLAYING || state === GS.DEAD)) {
    const blink2 = MP.role === 'host' && MP.invincTimer2 > 0 && frameNum % 6 < 3;
    if (!blink2) drawShipShape(MP.ship2, PAL.ship2);
  }

  // Indicador de nível (pisca suavemente)
  if (frameNum % (spawnRate * 10) < 80) {
    ctx.fillStyle = 'rgba(93,228,255,0.3)';
    ctx.font      = '8px VT323, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`LVL ${level}`, W - 4, H - 4);
  }
  ctx.textAlign = 'left';
}

function update() {
  frameNum++;
  updateStars();
  updateParticles();

  if (state === GS.PLAYING) {
    updateShip();

    if (!MP.active || MP.role === 'host') {
      // Host (ou solo): autoridade do jogo
      updateEnemies();
      bullets = bullets.filter(b => b.y > -b.h);
      bullets.forEach(b => { b.y += b.vy; });
      if (frameNum % spawnRate === 0)        spawnEnemy();
      if (frameNum % (spawnRate * 3) === 0)  spawnEnemy();
      checkCollisions();
    } else {
      // Guest: atualiza apenas balas locais (feedback visual)
      bullets = bullets.filter(b => b.y > -b.h);
      bullets.forEach(b => { b.y += b.vy; });
    }

    mpSendState();
  }

  if (state === GS.DEAD) {
    deadTimer--;
    if (deadTimer <= 0) {
      state = GS.PLAYING;
      const spawnX = MP.active
        ? (MP.role === 'host' ? W * 0.33 : W * 0.67)
        : W / 2;
      ship        = createShip(spawnX);
      invincTimer = 120;
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ── Game Management ────────────────────────────────────────────
function startGame(isMP = false) {
  MP.active   = isMP;
  score       = 0;
  lives       = 3;
  level       = 1;
  spawnRate   = 120;
  frameNum    = 0;
  bullets     = [];
  enemies     = [];
  particles   = [];
  ship        = createShip(isMP ? W * 0.33 : W / 2); // Host fica à esquerda
  invincTimer = 60;
  state       = GS.PLAYING;
  hideOverlay();
  updateScoreUI();
  updateLivesUI();
  if (isMP) {
    const hudEl = document.getElementById('mp-hud');
    const tagEl = document.getElementById('mp-player-tag');
    if (hudEl) hudEl.classList.remove('hidden');
    if (tagEl) tagEl.textContent = '🏠 P1-HOST';
  } else {
    const hudEl = document.getElementById('mp-hud');
    if (hudEl) hudEl.classList.add('hidden');
  }
}

function startGameGuest() {
  MP.active   = true;
  score       = 0;
  lives       = 3;
  level       = 1;
  spawnRate   = 120;
  frameNum    = 0;
  bullets     = [];
  enemies     = [];
  particles   = [];
  ship        = createShip(W * 0.67); // Guest fica à direita
  invincTimer = 60;
  state       = GS.PLAYING;
  hideOverlay();
  updateScoreUI();
  updateLivesUI();
  const hudEl = document.getElementById('mp-hud');
  const tagEl = document.getElementById('mp-player-tag');
  if (hudEl) hudEl.classList.remove('hidden');
  if (tagEl) tagEl.textContent = '🔗 P2-GUEST';
}

// ── Teclado ────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  keys[e.key] = true;

  if (e.key === 'Escape') {
    window.parent.postMessage({ type: 'exit' }, '*');
    return;
  }

  if (state === GS.TITLE) {
    const menuEl = document.getElementById('overlay-menu');
    const isMenuVisible = menuEl && !menuEl.classList.contains('hidden');
    if (isMenuVisible) {
      const btns = TITLE_MENU_BUTTON_IDS.map(id => document.getElementById(id)).filter(Boolean);
      // navigate
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a' || e.key === 'A') {
        titleMenuIndex = (titleMenuIndex + btns.length - 1) % btns.length;
        updateTitleMenuFocus();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === 'D') {
        titleMenuIndex = (titleMenuIndex + 1) % btns.length;
        updateTitleMenuFocus();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        const btn = btns[titleMenuIndex]; if (btn) btn.click();
      } else if (e.key === 'm' || e.key === 'M') {
        menuMultiplayer();
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') menuSolo();
      if (e.key === 'm' || e.key === 'M')     menuMultiplayer();
    }
  }

  if (state === GS.GAMEOVER && !MP.active) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') startGame(false);
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// ── Gamepad ─────────────────────────────────────────────────────
let comboTriggered = false;

function pollGamepad() {
  const gpads = navigator.getGamepads?.() ?? [];
  const gp    = Array.from(gpads).find(g => g?.connected);
  if (gp) {
    GP.up     = gp.buttons[12]?.pressed || gp.axes[1] < -0.4;
    GP.down   = gp.buttons[13]?.pressed || gp.axes[1] >  0.4;
    GP.left   = gp.buttons[14]?.pressed || gp.axes[0] < -0.4;
    GP.right  = gp.buttons[15]?.pressed || gp.axes[0] >  0.4;
    GP.shoot  = gp.buttons[0]?.pressed  || gp.buttons[2]?.pressed;
    GP.select = gp.buttons[8]?.pressed;
    GP.start  = gp.buttons[9]?.pressed;

    const isCombo = GP.select && GP.start;
    if (isCombo && !comboTriggered) {
      comboTriggered = true;
      window.parent.postMessage({ type: 'exit' }, '*');
      return;
    }
    if (!isCombo) comboTriggered = false;

    // Enhanced title overlay navigation (d-pad / analog + A button)
    const now = performance.now();
    const aPressed = !!(gp.buttons[0]?.pressed || gp.buttons[2]?.pressed);
    const navLeft = gp.buttons[14]?.pressed || (gp.axes[0] || 0) < -0.4 || gp.buttons[12]?.pressed || (gp.axes[1] || 0) < -0.4;
    const navRight = gp.buttons[15]?.pressed || (gp.axes[0] || 0) > 0.4 || gp.buttons[13]?.pressed || (gp.axes[1] || 0) > 0.4;

    // First check multiplayer-related overlays (disclaimer, mp-mode, host, guest)
    for (const ov of MP_OVERLAYS) {
      const oel = document.getElementById(ov);
      if (oel && !oel.classList.contains('hidden')) {
        if ((navLeft || navRight) && now - gpLastNavTime > GP_NAV_DELAY) {
          gpLastNavTime = now;
          const btns = getOverlayButtons(ov);
          if (btns.length) {
            if (!overlayIndices[ov] && overlayIndices[ov] !== 0) overlayIndices[ov] = 0;
            if (navLeft) overlayIndices[ov] = (overlayIndices[ov] + btns.length - 1) % btns.length;
            else if (navRight) overlayIndices[ov] = (overlayIndices[ov] + 1) % btns.length;
            updateOverlayFocus(ov);
          }
        }
        if (aPressed && !gpLastAPressed) {
          const btns = getOverlayButtons(ov);
          const idx = overlayIndices[ov] || 0;
          const btn = btns[idx]; if (btn) btn.click();
        }
        gpLastAPressed = aPressed;
        return;
      }
    }

    const menuEl = document.getElementById('overlay-menu');
    const isMenuVisible = menuEl && !menuEl.classList.contains('hidden');
    if (state === GS.TITLE && isMenuVisible) {
      if ((navLeft || navRight) && now - gpLastNavTime > GP_NAV_DELAY) {
        gpLastNavTime = now;
        const btns = TITLE_MENU_BUTTON_IDS.map(id => document.getElementById(id)).filter(Boolean);
        if (!btns.length) return;
        if (navLeft) titleMenuIndex = (titleMenuIndex + btns.length - 1) % btns.length;
        else if (navRight) titleMenuIndex = (titleMenuIndex + 1) % btns.length;
        updateTitleMenuFocus();
      }

      if (aPressed && !gpLastAPressed) {
        const btns = TITLE_MENU_BUTTON_IDS.map(id => document.getElementById(id)).filter(Boolean);
        const btn = btns[titleMenuIndex]; if (btn) btn.click();
      }
    } else {
      // Fallback: A / Start inicia jogo (comportamento anterior)
      if ((state === GS.TITLE || state === GS.GAMEOVER) && (aPressed || GP.start)) {
        if (!MP.active) startGame(false);
      }
    }

    gpLastAPressed = aPressed;
  }
}
setInterval(pollGamepad, 16);

// ═══════════════════════════════════════════════════════════════
//  MULTIPLAYER — WebRTC P2P (sem servidor)
// ═══════════════════════════════════════════════════════════════

const ICE_CFG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302'  },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
};

/** Serializa um RTCSessionDescription para base64 (compartilhável) */
function mpEncode(sdp) {
  return btoa(JSON.stringify(sdp));
}

/** Desserializa o código base64 de volta para objeto */
function mpDecode(str) {
  try {
    return JSON.parse(atob(str.trim().replace(/\s+/g, '')));
  } catch (_) {
    return null;
  }
}

/**
 * Aguarda o ICE gathering terminar (ou timeout de 10s).
 * Garante que o código gerado inclua todos os candidatos.
 */
function mpWaitICE(pc) {
  return new Promise(resolve => {
    if (pc.iceGatheringState === 'complete') { resolve(); return; }
    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', check);
    setTimeout(resolve, 10000); // fallback: não trava para sempre
  });
}

/** Configura os eventos do DataChannel (usado por host e guest) */
function mpSetupChannel(dc) {
  dc.onopen = () => {
    MP.connected = true;
    mpSetStatus('CONECTADO ✓');
    setTimeout(() => {
      hideMPOverlays();
      if (MP.role === 'host') {
        startGame(true);
      } else {
        startGameGuest();
      }
    }, 400);
  };
  dc.onclose = () => {
    MP.connected = false;
    mpSetStatus('DESCONECTADO');
  };
  dc.onerror = () => {
    mpSetStatus('ERRO DE CONEXÃO');
  };
  dc.onmessage = (ev) => {
    try { mpOnMessage(JSON.parse(ev.data)); } catch (_) {}
  };
}

/** Processa mensagens recebidas via DataChannel */
function mpOnMessage(msg) {
  if (MP.role === 'guest') {
    // Recebe estado autoritativo do host
    if (msg.en !== undefined)  enemies   = msg.en;
    if (msg.sc !== undefined) { score    = msg.sc; updateScoreUI(); }
    if (msg.lv !== undefined)  level     = msg.lv;
    if (msg.li !== undefined) { lives    = msg.li; updateLivesUI(); }
    if (msg.sr !== undefined)  spawnRate = msg.sr;
    if (msg.s1 !== undefined)  MP.ship2  = msg.s1;  // nave do host aparece como "ship2"

    // Balas do host (substitui balas locais de origem host)
    if (msg.bl !== undefined) {
      const myBullets = bullets.filter(b => b.fromGuest); // mantém balas locais do guest
      bullets = msg.bl.concat(myBullets);
    }

    // Sincroniza estado do jogo
    if (msg.st !== undefined && msg.st !== state) {
      state = msg.st;
      if (state === GS.GAMEOVER) {
        if (score > hiScore) hiScore = score;
        showOverlay('GAME OVER', `PONTUAÇÃO: ${score}`, 'ESC PARA SAIR');
      }
      if (state === GS.DEAD) {
        deadTimer = 60;
      }
    }
  } else if (MP.role === 'host') {
    // Recebe posição e eventos do guest
    if (msg.s2 !== undefined) MP.ship2 = msg.s2;
    if (msg.sh && MP.ship2) {
      // Guest atirou — host cria bala autoritativa
      bullets.push({ x: MP.ship2.x, y: MP.ship2.y - 4, vy: -4.5, w: 2, h: 5, fromGuest: true });
      spawnParticle(MP.ship2.x, MP.ship2.y - 4, PAL.bullet2, 3, -4, 0.3);
    }
  }
}

/** Envia estado do jogo via DataChannel (throttled a ~30/s) */
function mpSendState() {
  if (!MP.active || !MP.dc || MP.dc.readyState !== 'open') return;
  MP.sendTick++;
  if (MP.sendTick % 2 !== 0) return; // envia 1 de cada 2 frames (~30fps)

  try {
    if (MP.role === 'host') {
      MP.dc.send(JSON.stringify({
        en: enemies,
        sc: score,
        lv: level,
        li: lives,
        sr: spawnRate,
        st: state,
        bl: bullets.filter(b => !b.fromGuest).map(b => ({
          x: b.x, y: b.y, vy: b.vy, w: b.w, h: b.h, fromGuest: false,
        })),
        s1: ship ? { x: ship.x, y: ship.y } : null,
      }));
    } else {
      MP.dc.send(JSON.stringify({
        s2: ship ? { x: ship.x, y: ship.y } : null,
        sh: MP.guestShot, // flag: atirou neste ciclo de envio
      }));
      MP.guestShot = false; // reset após enviar
    }
  } catch (_) {}
}

function mpSetStatus(text) {
  const el = document.getElementById('mp-status');
  if (el) el.textContent = `P2P: ${text}`;
}

function hideMPOverlays() {
  ['disclaimer-overlay', 'mp-mode-overlay', 'mp-host-overlay', 'mp-guest-overlay']
    .forEach(id => document.getElementById(id)?.classList.add('hidden'));
}

// ── Funções chamadas pelos botões HTML ──────────────────────────

/** Jogar solo — reseta MP e começa */
function menuSolo() {
  MP.active = false;
  MP.role   = null;
  startGame(false);
}

/** Abrir tela de multiplayer (vai para aviso primeiro) */
function menuMultiplayer() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('disclaimer-overlay').classList.remove('hidden');
  updateOverlayFocus('disclaimer-overlay');
}

function acceptDisclaimer() {
  document.getElementById('disclaimer-overlay').classList.add('hidden');
  document.getElementById('mp-mode-overlay').classList.remove('hidden');
  updateOverlayFocus('mp-mode-overlay');
}

function cancelDisclaimer() {
  document.getElementById('disclaimer-overlay').classList.add('hidden');
  document.getElementById('overlay').classList.remove('hidden');
  updateTitleMenuFocus();
}

/** Fechar overlays MP e voltar ao título */
function cancelMP() {
  hideMPOverlays();
  // Fecha conexão existente
  if (MP.pc) {
    try { MP.pc.close(); } catch (_) {}
    MP.pc        = null;
    MP.dc        = null;
    MP.connected = false;
    MP.role      = null;
    MP.active    = false;
    MP.ship2     = null;
  }
  showOverlay('STAR BLASTER', 'CARTRIDGE-8 DEMO', '', true);
}

// ── Fluxo HOST ──────────────────────────────────────────────────

/** Inicia criação da sala (HOST) */
async function startHost() {
  document.getElementById('mp-mode-overlay').classList.add('hidden');
  document.getElementById('mp-host-overlay').classList.remove('hidden');
  document.getElementById('host-step-num').textContent = '1';
  document.getElementById('host-step1').classList.remove('hidden');
  document.getElementById('host-step2').classList.add('hidden');
  document.getElementById('host-generating').classList.remove('hidden');
  document.getElementById('host-step1-actions').style.display = 'none';
  document.getElementById('host-offer-code').value = '';

  try {
    const code = await mpCreateHost();
    document.getElementById('host-offer-code').value = code;
    document.getElementById('host-generating').classList.add('hidden');
    document.getElementById('host-step1-actions').style.display = 'flex';
    updateOverlayFocus('mp-host-overlay');
  } catch (err) {
    document.getElementById('host-generating').textContent = '❌ Erro ao criar sala. Tente novamente.';
    document.getElementById('host-generating').classList.remove('blink');
    console.error('mpCreateHost error:', err);
  }
}

/** Cria RTCPeerConnection como host e retorna o código de convite */
async function mpCreateHost() {
  MP.role = 'host';
  MP.pc   = new RTCPeerConnection(ICE_CFG);
  MP.dc   = MP.pc.createDataChannel('sb', { ordered: false, maxRetransmits: 0 });
  mpSetupChannel(MP.dc);

  const offer = await MP.pc.createOffer();
  await MP.pc.setLocalDescription(offer);
  await mpWaitICE(MP.pc);     // aguarda ICE candidates antes de gerar o código

  return mpEncode(MP.pc.localDescription);
}

function copyHostOffer() {
  const code = document.getElementById('host-offer-code').value;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-offer');
    btn.textContent = '✓ COPIADO!';
    setTimeout(() => { btn.textContent = '📋 COPIAR CÓDIGO'; }, 2000);
  }).catch(() => {
    // Fallback para navegadores sem clipboard API
    document.getElementById('host-offer-code').select();
    document.execCommand('copy');
  });
}

function goHostStep2() {
  document.getElementById('host-step-num').textContent = '2';
  document.getElementById('host-step1').classList.add('hidden');
  document.getElementById('host-step2').classList.remove('hidden');
  document.getElementById('host-answer-input').value = '';
  document.getElementById('host-connecting').classList.add('hidden');
  document.getElementById('host-error').classList.add('hidden');
  updateOverlayFocus('mp-host-overlay');
}

/** Host recebe o código de resposta do guest e completa a conexão */
async function hostConnect() {
  const raw    = document.getElementById('host-answer-input').value.trim();
  const errEl  = document.getElementById('host-error');
  const connEl = document.getElementById('host-connecting');
  errEl.classList.add('hidden');
  if (!raw) return;

  connEl.classList.remove('hidden');
  const answer = mpDecode(raw);
  if (!answer) {
    connEl.classList.add('hidden');
    errEl.classList.remove('hidden');
    return;
  }
  try {
    await MP.pc.setRemoteDescription(new RTCSessionDescription(answer));
    // DataChannel.onopen dispara quando conectar → startGame() é chamado lá
  } catch (err) {
    connEl.classList.add('hidden');
    errEl.classList.remove('hidden');
    console.error('hostConnect error:', err);
  }
}

// ── Fluxo GUEST ─────────────────────────────────────────────────

/** Exibe a tela de entrar na sala (GUEST) */
function startGuest() {
  document.getElementById('mp-mode-overlay').classList.add('hidden');
  document.getElementById('mp-guest-overlay').classList.remove('hidden');
  document.getElementById('guest-step-num').textContent = '1';
  document.getElementById('guest-step1').classList.remove('hidden');
  document.getElementById('guest-step2').classList.add('hidden');
  document.getElementById('guest-offer-input').value = '';
  document.getElementById('guest-generating').classList.add('hidden');
  document.getElementById('guest-error').classList.add('hidden');
  updateOverlayFocus('mp-guest-overlay');
}

/** Guest lê o código de convite e gera o código de resposta */
async function guestGenAnswer() {
  const raw    = document.getElementById('guest-offer-input').value.trim();
  const errEl  = document.getElementById('guest-error');
  const genEl  = document.getElementById('guest-generating');
  errEl.classList.add('hidden');
  if (!raw) return;

  genEl.classList.remove('hidden');
  try {
    const answerCode = await mpCreateGuest(raw);
    if (!answerCode) {
      genEl.classList.add('hidden');
      errEl.classList.remove('hidden');
      return;
    }
    document.getElementById('guest-answer-code').value = answerCode;
    document.getElementById('guest-step-num').textContent = '2';
    document.getElementById('guest-step1').classList.add('hidden');
    document.getElementById('guest-step2').classList.remove('hidden');
    genEl.classList.add('hidden');
    updateOverlayFocus('mp-guest-overlay');
  } catch (err) {
    genEl.classList.add('hidden');
    errEl.classList.remove('hidden');
    console.error('guestGenAnswer error:', err);
  }
}

/** Cria RTCPeerConnection como guest e retorna o código de resposta */
async function mpCreateGuest(offerCode) {
  const offer = mpDecode(offerCode);
  if (!offer) return null;

  MP.role = 'guest';
  MP.pc   = new RTCPeerConnection(ICE_CFG);

  // Guest recebe o DataChannel que o host criou
  MP.pc.ondatachannel = (ev) => {
    MP.dc = ev.channel;
    mpSetupChannel(MP.dc);
  };

  await MP.pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await MP.pc.createAnswer();
  await MP.pc.setLocalDescription(answer);
  await mpWaitICE(MP.pc);    // aguarda ICE candidates antes de gerar o código

  return mpEncode(MP.pc.localDescription);
}

function copyGuestAnswer() {
  const code = document.getElementById('guest-answer-code').value;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-answer');
    btn.textContent = '✓ COPIADO!';
    setTimeout(() => { btn.textContent = '📋 COPIAR RESPOSTA'; }, 2000);
  }).catch(() => {
    document.getElementById('guest-answer-code').select();
    document.execCommand('copy');
  });
}

// ── Init ────────────────────────────────────────────────────────
initStars();
updateLivesUI();
showOverlay('STAR BLASTER', 'CARTRIDGE-8 DEMO', '', true);
loop();
