// ============================================================
// SEKIVERSE — UI Module
// Screens, transitions, decorations, side-stuff rendering
// ============================================================

class VirtualKeyboard {
    constructor() {
        this.overlay = document.getElementById('virtual-keyboard-overlay');
        this.panel = null;
        this.display = null;
        this.keysContainer = null;
        this.keys = [];
        this.isOpen = false;
        this.text = '';
        this.onSubmit = null;
        this.onClose = null;
    }

    init() {
        if (!this.overlay) return;
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });
        this._createPanel();
    }

    _createPanel() {
        if (!this.overlay) return;

        const panel = document.createElement('div');
        panel.className = 'virtual-keyboard-panel';

        panel.innerHTML = `
            <div class="virtual-keyboard-title">Keyboard Input</div>
            <div class="virtual-keyboard-display" id="virtual-keyboard-display"></div>
            <div class="virtual-keyboard-rows" id="virtual-keyboard-rows"></div>
            <div class="virtual-keyboard-actions">
                <button class="virtual-keyboard-action-btn" id="keyboard-submit-btn">Submit</button>
                <button class="virtual-keyboard-action-btn" id="keyboard-close-btn">Close</button>
            </div>
            <div class="virtual-typing-hint">Use o joystick para mover o cursor e pressione A para escolher.</div>
        `;

        this.overlay.appendChild(panel);
        this.panel = panel;
        this.display = panel.querySelector('#virtual-keyboard-display');
        this.keysContainer = panel.querySelector('#virtual-keyboard-rows');
        this._buildKeys();

        panel.querySelector('#keyboard-submit-btn').addEventListener('click', () => this._submit());
        panel.querySelector('#keyboard-close-btn').addEventListener('click', () => this.close());
    }

    _buildKeys() {
        if (!this.keysContainer) return;

        const rows = [
            ['Q','W','E','R','T','Y','U','I','O','P'],
            ['A','S','D','F','G','H','J','K','L'],
            ['Z','X','C','V','B','N','M'],
            ['SPACE','BACK','ENTER']
        ];

        this.keys = [];
        this.keysContainer.innerHTML = '';

        rows.forEach((row, rowIndex) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'virtual-keyboard-row';
            row.forEach((key) => {
                const keyEl = document.createElement('button');
                keyEl.type = 'button';
                keyEl.className = 'virtual-keyboard-key';
                keyEl.textContent = key === 'SPACE' ? 'Space' : key === 'BACK' ? 'Back' : key === 'ENTER' ? 'Enter' : key;
                keyEl.dataset.key = key;
                keyEl.addEventListener('click', () => this._pressKey(key));
                rowEl.appendChild(keyEl);
                this.keys.push({ key, element: keyEl, row: rowIndex, col: rowEl.children.length - 1 });
            });
            this.keysContainer.appendChild(rowEl);
        });

        this._selectedIndex = 0;
        this._updateKeySelection();
    }

    open(initialText = '', onSubmit = null, onClose = null) {
        if (!this.overlay) return;
        this.text = initialText || '';
        this.onSubmit = onSubmit;
        this.onClose = onClose;
        this._updateDisplay();
        this.overlay.classList.add('active');
        this.isOpen = true;
        this._updateKeySelection();
    }

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        this.isOpen = false;
        this.keys.forEach(({ element }) => element.classList.remove('gamepad-hover'));
        if (typeof this.onClose === 'function') {
            this.onClose();
        }
    }

    _pressKey(key) {
        if (key === 'SPACE') {
            this.text += ' ';
        } else if (key === 'BACK') {
            this.text = this.text.slice(0, -1);
        } else if (key === 'ENTER') {
            this._submit();
            return;
        } else {
            this.text += key;
        }
        this._updateDisplay();
    }

    _submit() {
        if (typeof this.onSubmit === 'function') {
            this.onSubmit(this.text);
        }
        this.close();
    }

    _updateDisplay() {
        if (this.display) {
            this.display.textContent = this.text || '...';
        }
    }

    activateSelectedKey() {
        const selected = this.keys[this._selectedIndex];
        if (selected) {
            selected.element.click();
        }
    }

    _updateKeySelection() {
        if (!this.keys.length) return;
        this.keys.forEach(({ element }, index) => {
            element.classList.toggle('gamepad-hover', index === this._selectedIndex);
        });
    }
}

class UI {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.blackHoleInterval = null;
        this.virtualKeyboard = null;
    }

    // ── Initialize screen references ──────────────────────────
    init() {
        this.screens = {
            menu: document.getElementById('menu-screen'),
            intro: document.getElementById('intro-screen'),
            game: document.getElementById('game-screen'),
            ending: document.getElementById('ending-screen')
        };
        this.hudTimer = document.getElementById('hud-timer');
        this.hudArea = document.getElementById('hud-area');
        this.hudProgress = document.getElementById('hud-progress');
        this.hudClicks = document.getElementById('hud-clicks');
        this.areaContainer = document.getElementById('area-container');
        this.puzzleContainer = document.getElementById('puzzle-container');
        this.areaTransition = document.getElementById('area-transition');
        this.badgesOverlay = document.getElementById('badges-overlay');
        this.optionsOverlay = document.getElementById('options-overlay');
        this.gameScreen = document.getElementById('game-screen');
        this.virtualKeyboard = new VirtualKeyboard();
        this.virtualKeyboard.init();
    }

    // ── Screen Management ─────────────────────────────────────
    showScreen(name) {
        Object.values(this.screens).forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        if (this.screens[name]) {
            this.screens[name].classList.remove('hidden');
            this.screens[name].classList.add('active');
            this.currentScreen = name;
        }
    }

    // ── Typewriter Effect ─────────────────────────────────────
    typewriterEffect(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = '';
            const cursor = document.querySelector('.lore-cursor');
            if (cursor) cursor.style.display = 'inline-block';

            const type = () => {
                if (i < text.length) {
                    element.textContent += text[i];
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            type();
        });
    }

    // ── HUD Updates ───────────────────────────────────────────
    updateTimer(formatted, remaining) {
        this.hudTimer.textContent = formatted;
        this.hudTimer.classList.remove('warning', 'critical');
        if (remaining <= 30) {
            this.hudTimer.classList.add('critical');
        } else if (remaining <= 60) {
            this.hudTimer.classList.add('warning');
        }
    }

    updateAreaInfo(areaName, puzzleIndex, totalPuzzles) {
        this.hudArea.textContent = areaName;
        this.hudProgress.textContent = `${puzzleIndex + 1}/${totalPuzzles}`;
    }

    updateClickCounter(count) {
        if (this.hudClicks) {
            this.hudClicks.textContent = `🖱️ ${count}`;
        }
    }

    // ── Area Theme ────────────────────────────────────────────
    setAreaTheme(themeClass) {
        this.gameScreen.className = 'screen active';
        this.gameScreen.classList.add(themeClass);
    }

    addChaosLevel(level) {
        this.gameScreen.classList.add(`chaos-${level}`);
    }

    // ── Area Decorations ──────────────────────────────────────
    renderDecorations(areaData, onExplorerClick) {
        this.areaContainer.querySelectorAll('.area-deco-1, .area-deco-2, .area-deco-3, .steam-particle, .matrix-column, .explorer-element, .black-hole').forEach(el => el.remove());

        for (let i = 1; i <= 3; i++) {
            const deco = document.createElement('div');
            deco.className = `area-deco-${i}`;
            this.areaContainer.appendChild(deco);
        }

        if (areaData.theme === 'area-steampunk') {
            for (let i = 0; i < 4; i++) {
                const particle = document.createElement('div');
                particle.className = 'steam-particle';
                particle.style.left = (10 + Math.random() * 80) + '%';
                particle.style.bottom = '10%';
                this.areaContainer.appendChild(particle);
            }
        }

        if (areaData.theme === 'area-matrix') {
            const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
            for (let i = 0; i < 8; i++) {
                const col = document.createElement('div');
                col.className = 'matrix-column';
                let str = '';
                for (let j = 0; j < 30; j++) {
                    str += chars[Math.floor(Math.random() * chars.length)];
                }
                col.textContent = str;
                this.areaContainer.appendChild(col);
            }
        }

        const explorer = document.createElement('div');
        explorer.className = 'explorer-element';
        explorer.title = 'Algo estranho aqui...';
        explorer.addEventListener('click', (e) => {
            if (!explorer.classList.contains('found')) {
                explorer.classList.add('found');
                this._showExplorerTooltip(e, areaData.explorerHint);
                if (onExplorerClick) onExplorerClick(areaData.id);
            }
        });
        this.areaContainer.appendChild(explorer);
    }

    _showExplorerTooltip(event, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'explorer-tooltip';
        tooltip.textContent = '🔍 ' + text;
        tooltip.style.left = Math.min(event.clientX, window.innerWidth - 280) + 'px';
        tooltip.style.top = (event.clientY - 50) + 'px';
        document.body.appendChild(tooltip);
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.5s';
            setTimeout(() => tooltip.remove(), 500);
        }, 2500);
    }

    // ── Area 5: Black Holes ───────────────────────────────────
    startBlackHoles() {
        this.stopBlackHoles();
        const spawn = () => {
            const hole = document.createElement('div');
            hole.className = 'black-hole';
            hole.style.left = (10 + Math.random() * 80) + '%';
            hole.style.top = (10 + Math.random() * 80) + '%';
            const size = 20 + Math.random() * 50;
            hole.style.width = size + 'px';
            hole.style.height = size + 'px';
            this.areaContainer.appendChild(hole);
            setTimeout(() => hole.remove(), 3500);
        };
        spawn();
        this.blackHoleInterval = setInterval(spawn, 2000);
    }

    stopBlackHoles() {
        if (this.blackHoleInterval) {
            clearInterval(this.blackHoleInterval);
            this.blackHoleInterval = null;
        }
        document.querySelectorAll('.black-hole').forEach(h => h.remove());
    }

    // ── Area 5: Tremble ───────────────────────────────────────
    startTremble() {
        this.puzzleContainer.classList.add('tremble');
    }

    // ── Area Transitions ──────────────────────────────────────
    showAreaTransition(areaName, subtitle) {
        return new Promise(resolve => {
            const nameEl = this.areaTransition.querySelector('.transition-area-name');
            const subEl = this.areaTransition.querySelector('.transition-subtitle');
            nameEl.textContent = areaName;
            subEl.textContent = subtitle;
            this.areaTransition.classList.add('active');
            setTimeout(() => {
                this.areaTransition.classList.remove('active');
                setTimeout(resolve, 600);
            }, 2500);
        });
    }

    showAreaComplete(text) {
        return new Promise(resolve => {
            const nameEl = this.areaTransition.querySelector('.transition-area-name');
            const subEl = this.areaTransition.querySelector('.transition-subtitle');
            nameEl.textContent = t('areaComplete');
            subEl.textContent = text;
            this.areaTransition.classList.add('active');
            setTimeout(() => {
                this.areaTransition.classList.remove('active');
                setTimeout(resolve, 600);
            }, 2500);
        });
    }

    // ── Badge Toast ───────────────────────────────────────────
    showBadgeToast(badge) {
        if (!badge) return;
        const toast = document.createElement('div');
        toast.className = 'badge-toast';
        toast.innerHTML = `
            <span class="badge-toast-icon">${badge.icon}</span>
            <span class="badge-toast-text">Badge: ${badge.name}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    // ── Streak Toast ──────────────────────────────────────────
    showStreakToast(count) {
        const toast = document.createElement('div');
        toast.className = 'streak-toast';
        toast.textContent = `${t('streak')}${count}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // ── Badges Overlay ────────────────────────────────────────
    showBadgesOverlay(badges) {
        const grid = this.badgesOverlay.querySelector('.badges-grid');
        grid.innerHTML = '';
        badges.forEach(badge => {
            const card = document.createElement('div');
            card.className = 'badge-card' + (badge.unlocked ? ' unlocked' : '');
            card.innerHTML = `
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-name">${badge.name}</span>
                <span class="badge-desc">${badge.unlocked ? badge.description : '???'}</span>
            `;
            grid.appendChild(card);
        });
        this.badgesOverlay.classList.add('active');
    }

    hideBadgesOverlay() {
        this.badgesOverlay.classList.remove('active');
    }

    // ══════════════════════════════════════════════════════════
    //  OPTIONS OVERLAY
    // ══════════════════════════════════════════════════════════

    showOptionsOverlay(currentOptions) {
        const list = document.getElementById('options-list');
        list.innerHTML = '';

        GAME_DATA.optionsConfig.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'option-item' + (opt.useful ? ' useful' : '');

            if (opt.type === 'toggle') {
                item.innerHTML = `
                    <div class="option-header">
                        <span class="option-label">${opt.label}</span>
                        ${opt.useful ? `<span class="option-useful-tag">${t('useful')}</span>` : ''}
                    </div>
                    <p class="option-desc">${opt.desc}</p>
                    <label class="toggle-switch">
                        <input type="checkbox" ${currentOptions[opt.key] ? 'checked' : ''} data-key="${opt.key}">
                        <span class="toggle-slider"></span>
                    </label>
                `;
                const checkbox = item.querySelector('input');
                checkbox.addEventListener('change', () => {
                    document.dispatchEvent(new CustomEvent('optionChange', {
                        detail: { key: opt.key, value: checkbox.checked }
                    }));
                });
            } else if (opt.type === 'slider') {
                item.innerHTML = `
                    <div class="option-header">
                        <span class="option-label">${opt.label}</span>
                    </div>
                    <p class="option-desc">${opt.desc}</p>
                    <div class="option-slider-row">
                        <input type="range" min="${opt.min}" max="${opt.max}" value="${currentOptions[opt.key] || 0}" class="option-slider">
                        <span class="option-slider-value">${currentOptions[opt.key] || 0}</span>
                    </div>
                `;
                const slider = item.querySelector('input[type=range]');
                const valDisplay = item.querySelector('.option-slider-value');
                slider.addEventListener('input', () => {
                    const val = parseInt(slider.value);
                    valDisplay.textContent = val;
                    document.dispatchEvent(new CustomEvent('optionChange', {
                        detail: { key: opt.key, value: val }
                    }));
                });
            }

            list.appendChild(item);
        });

        this.optionsOverlay.classList.add('active');
    }

    hideOptionsOverlay() {
        this.optionsOverlay.classList.remove('active');
    }

    // ══════════════════════════════════════════════════════════
    //  SIDE STUFF
    // ══════════════════════════════════════════════════════════

    // ── Confetti ──────────────────────────────────────────────
    spawnConfetti() {
        const colors = ['#ff0033', '#00aaff', '#00ff88', '#ffcc00', '#b44aff', '#ff6b9d'];
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.left = (20 + Math.random() * 60) + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
            particle.style.animationDelay = (Math.random() * 0.3) + 's';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 2500);
        }
    }

    // ── Glitch Pet ────────────────────────────────────────────
    spawnGlitchPet(emoji) {
        const pet = document.createElement('div');
        pet.className = 'glitch-pet';
        pet.textContent = emoji;
        pet.style.animationDuration = (4 + Math.random() * 4) + 's';
        document.body.appendChild(pet);
        setTimeout(() => pet.remove(), 10000);
    }

    // ── Funny Message ─────────────────────────────────────────
    showFunnyMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'funny-message';
        msg.textContent = text;
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.classList.add('fade-out');
            setTimeout(() => msg.remove(), 600);
        }, 3000);
    }

    // ── Menu Stats (returning player) ─────────────────────────
    showMenuStats(playerData) {
        const container = document.getElementById('menu-stats');
        if (!container) return;
        const bestTime = playerData.bestTime
            ? `${Math.floor(playerData.bestTime / 60)}:${String(playerData.bestTime % 60).padStart(2, '0')}`
            : '--:--';
        container.innerHTML = `
            <div class="stat-item">${t('runs')}${playerData.totalPlaythroughs}</div>
            <div class="stat-item">${t('endings')}${playerData.completedEndings.length}/3</div>
            <div class="stat-item">${t('best')}${bestTime}</div>
        `;
        container.classList.add('visible');
    }

    // ══════════════════════════════════════════════════════════
    //  ENDING SCREEN
    // ══════════════════════════════════════════════════════════

    showEnding(endingData, badgeCount, stats, trueEndingLocked = false) {
        const screen = this.screens.ending;
        screen.className = 'screen';
        screen.classList.add(endingData.theme);

        const timeStr = `${Math.floor(stats.timeUsed / 60)}:${String(stats.timeUsed % 60).padStart(2, '0')}`;
        const container = screen.querySelector('.ending-container');
        container.innerHTML = `
            <div class="ending-title">${endingData.title}</div>
            <div class="ending-text">${endingData.text}</div>
            <div class="ending-badges-summary">${t('badgesBtn')}: ${badgeCount}/10</div>
            <div class="ending-stats">
                <span>⏱️ ${timeStr}</span>
                <span>🖱️ ${stats.clicks} ${t('clicks')}</span>
                <span>🔥 STREAK: ${stats.bestStreak}</span>
                <span>${t('errors')}${stats.errors}</span>
            </div>
            ${trueEndingLocked ? `<div class="ending-lock-hint">${t('lockHint')}</div>` : ''}
            <button id="retry-btn">${t('playAgain')}</button>
        `;

        this.showScreen('ending');
        document.getElementById('retry-btn').addEventListener('click', () => location.reload());
    }

    openVirtualKeyboard(initialText, onSubmit) {
        if (this.virtualKeyboard) {
            this.virtualKeyboard.open(initialText, onSubmit);
        }
    }

    closeVirtualKeyboard() {
        if (this.virtualKeyboard) {
            this.virtualKeyboard.close();
        }
    }

    // ── Screen Flash ──────────────────────────────────────────
    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
    }
}
