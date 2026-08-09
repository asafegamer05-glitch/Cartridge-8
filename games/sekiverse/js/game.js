// ============================================================
// SEKIVERSE — Game Engine
// Save system, options, side stuff, game flow controller
// ============================================================

class GamepadManager {
    constructor(ui) {
        this.ui = ui;
        this.cursor = document.getElementById('gamepad-cursor');
        this.activePadIndex = null;
        this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.speed = 680;
        this.hovered = null;
        this.prevButtons = [];
        this.lastTimestamp = null;
        this.isActive = false;
    }

    init() {
        window.addEventListener('gamepadconnected', (event) => this._onConnect(event));
        window.addEventListener('gamepaddisconnected', (event) => this._onDisconnect(event));
        this._update();
    }

    _onConnect(event) {
        this.activePadIndex = event.gamepad.index;
        this.isActive = true;
        this._showCursor(true);
    }

    _onDisconnect(event) {
        if (event.gamepad.index === this.activePadIndex) {
            this.activePadIndex = null;
            this.isActive = false;
            this._showCursor(false);
        }
    }

    _showCursor(show) {
        if (!this.cursor) return;
        this.cursor.classList.toggle('hidden', !show);
    }

    _getGamepad() {
        if (this.activePadIndex !== null) {
            const pad = navigator.getGamepads()[this.activePadIndex];
            if (pad && pad.connected) return pad;
        }
        const pads = navigator.getGamepads();
        for (const pad of pads) {
            if (pad && pad.connected) return pad;
        }
        return null;
    }

    _update(timestamp = performance.now()) {
        const delta = this.lastTimestamp ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.06) : 0;
        this.lastTimestamp = timestamp;

        const pad = this._getGamepad();
        if (pad) {
            this._handleGamepad(pad, delta);
        }

        requestAnimationFrame((ts) => this._update(ts));
    }

    _handleGamepad(gamepad, delta) {
        const leftX = this._normalizeAxis(gamepad.axes[0] ?? 0);
        const leftY = this._normalizeAxis(gamepad.axes[1] ?? 0);
        const rightX = this._normalizeAxis(gamepad.axes[2] ?? 0);
        const rightY = this._normalizeAxis(gamepad.axes[3] ?? 0);
        const hoveredRange = this.hovered && this.hovered.matches('input[type=range]') ? this.hovered : null;

        if (leftX !== 0 || leftY !== 0) {
            this.position.x = Math.min(Math.max(0, this.position.x + leftX * this.speed * delta), window.innerWidth - 1);
            this.position.y = Math.min(Math.max(0, this.position.y + leftY * this.speed * delta), window.innerHeight - 1);
            if (this.cursor) {
                this.cursor.style.left = `${this.position.x}px`;
                this.cursor.style.top = `${this.position.y}px`;
            }
        }

        if (hoveredRange && (rightX !== 0 || rightY !== 0)) {
            this._adjustRange(hoveredRange, rightX !== 0 ? rightX : rightY);
        } else if (rightX !== 0 || rightY !== 0) {
            this._scrollUnderCursor(rightX, rightY, delta);
        }

        const isPrimaryPressed = !!(gamepad.buttons[0] && gamepad.buttons[0].pressed);
        const isSecondaryPressed = !!(gamepad.buttons[1] && gamepad.buttons[1].pressed);

        if (isPrimaryPressed && !this.prevButtons[0]) {
            this._pressPrimary();
        }
        if (isSecondaryPressed && !this.prevButtons[1]) {
            this._pressSecondary();
        }

        this.prevButtons = gamepad.buttons.map((button) => !!button?.pressed);
        this._updateHover();
    }

    _normalizeAxis(value) {
        return Math.abs(value) < 0.14 ? 0 : value;
    }

    _updateHover() {
        if (!this.cursor) return;
        const element = document.elementFromPoint(this.position.x, this.position.y);
        const target = this._closestInteractive(element);
        if (target !== this.hovered) {
            if (this.hovered) this.hovered.classList.remove('gamepad-hover');
            this.hovered = target;
            if (this.hovered) this.hovered.classList.add('gamepad-hover');
        }
    }

    _closestInteractive(element) {
        if (!element) return null;
        return element.closest('button, a, input, .option-slider, .dial-btn, .letter-btn, .simon-pad, .order-circle, .submit-btn, .toggle-switch, .option-item, .virtual-keyboard-key, .virtual-keyboard-action-btn, .badges-grid > div, .explorer-element');
    }

    _closestScrollable(element) {
        while (element && element !== document.body && element !== document.documentElement) {
            const canScrollY = element.scrollHeight > element.clientHeight && getComputedStyle(element).overflowY !== 'hidden';
            const canScrollX = element.scrollWidth > element.clientWidth && getComputedStyle(element).overflowX !== 'hidden';
            if (canScrollY || canScrollX) return element;
            element = element.parentElement;
        }
        return document.scrollingElement || document.documentElement;
    }

    _scrollUnderCursor(axisX, axisY, delta) {
        const element = document.elementFromPoint(this.position.x, this.position.y);
        const scrollTarget = this._closestScrollable(element);
        const scrollAmount = 520 * delta;
        if (scrollTarget) {
            scrollTarget.scrollBy({
                top: axisY * scrollAmount,
                left: axisX * scrollAmount,
                behavior: 'auto'
            });
        }
    }

    _adjustRange(rangeElement, axisValue) {
        if (!rangeElement || axisValue === 0) return;
        const min = parseFloat(rangeElement.min) || 0;
        const max = parseFloat(rangeElement.max) || 100;
        const step = parseFloat(rangeElement.step) || 1;
        const current = parseFloat(rangeElement.value);
        const delta = Math.sign(axisValue) * step;
        const nextValue = Math.min(max, Math.max(min, current + delta));
        if (nextValue !== current) {
            rangeElement.value = nextValue;
            rangeElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    _pressPrimary() {
        if (this.ui?.virtualKeyboard?.isOpen) {
            if (this.hovered && this.hovered.matches('.virtual-keyboard-key, .virtual-keyboard-action-btn')) {
                this._dispatchPointerClick(this.hovered);
                return;
            }
            this.ui.virtualKeyboard.activateSelectedKey();
            return;
        }
        if (!this.hovered) return;
        this._dispatchPointerClick(this.hovered);
    }

    _dispatchPointerClick(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
            element.dispatchEvent(new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                pointerType: 'mouse',
                isPrimary: true,
            }));
        });
    }

    _pressSecondary() {
        if (this.ui?.virtualKeyboard?.isOpen) {
            this.ui.virtualKeyboard.close();
        }
    }
}

class Game {
    constructor() {
        this.ui = new UI();
        this.badges = new BadgeSystem(GAME_DATA.badges);
        this.puzzles = null;
        this.timer = null;
        this.playerData = null;
        this.gamepad = null;

        this.currentArea = 0;
        this.currentPuzzle = 0;
        this.totalPuzzlesPerArea = 5;
        this.gameStarted = false;
        this.gameEnded = false;
        this._isTransitioning = false;
        this.easterEggClicks = 0;

        // Stats & side stuff
        this.totalClicks = 0;
        this.correctStreak = 0;
        this.bestStreak = 0;
        this._lastWasError = false;
        this._trueEndingLocked = false;
        this.partyInterval = null;
    }

    // ══════════════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════════════

    init() {
        this.playerData = this._loadPlayerData();
        this.ui.init();
        this.gamepad = new GamepadManager(this.ui);
        this.gamepad.init();
        this.puzzles = new PuzzleManager(document.getElementById('puzzle-container'), this.ui);

        this._applyOptions();
        applyHTMLTranslations();
        this._bindMenuEvents();
        this._bindBadgeEvents();
        this._bindOptionsEvents();
        this._setupClickCounter();
        this._setupGlitchPet();
        this._updateMenuStats();
        this._applyMenuTheme();
        this.ui.showScreen('menu');
    }

    // ══════════════════════════════════════════════════════════
    //  SAVE SYSTEM (localStorage + JSON export/import)
    // ══════════════════════════════════════════════════════════

    _loadPlayerData() {
        try {
            const raw = localStorage.getItem('sekiverse_playerdata');
            if (raw) return { ...this._defaultPlayerData(), ...JSON.parse(raw) };
        } catch (e) { console.warn('Falha ao carregar save:', e); }
        return this._defaultPlayerData();
    }

    _defaultPlayerData() {
        return {
            completedEndings: [],
            totalPlaythroughs: 0,
            bestTime: null,
            options: {
                skipIntro: false,
                pizzaMode: false,
                rotation: 0,
                partyMode: false,
                silenceVolume: 50
            }
        };
    }

    _savePlayerData() {
        try {
            localStorage.setItem('sekiverse_playerdata', JSON.stringify(this.playerData));
        } catch (e) { console.warn('Falha ao salvar:', e); }
    }

    _exportSave() {
        const blob = new Blob([JSON.stringify(this.playerData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sekiverse_save.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    _importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    this.playerData = { ...this._defaultPlayerData(), ...JSON.parse(ev.target.result) };
                    this._savePlayerData();
                    alert(t('saveImported'));
                    location.reload();
                } catch { alert(t('invalidFile')); }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    _clearSave() {
        if (confirm(t('confirmClear'))) {
            localStorage.removeItem('sekiverse_playerdata');
            this.playerData = this._defaultPlayerData();
            alert(t('saveCleared'));
            location.reload();
        }
    }

    // ══════════════════════════════════════════════════════════
    //  OPTIONS SYSTEM
    // ══════════════════════════════════════════════════════════

    _applyOptions() {
        const opts = this.playerData.options;
        document.body.classList.toggle('pizza-cursor', !!opts.pizzaMode);
        document.documentElement.style.setProperty('--screen-rotation', `${opts.rotation || 0}deg`);

        if (opts.partyMode && !this.partyInterval) {
            this.partyInterval = setInterval(() => this.ui.spawnConfetti(), 400);
        } else if (!opts.partyMode && this.partyInterval) {
            clearInterval(this.partyInterval);
            this.partyInterval = null;
        }
    }

    _bindOptionsEvents() {
        document.getElementById('options-btn').addEventListener('click', () => {
            this.ui.showOptionsOverlay(this.playerData.options);
        });
        document.getElementById('close-options-btn').addEventListener('click', () => {
            this.ui.hideOptionsOverlay();
        });
        document.getElementById('export-save').addEventListener('click', () => this._exportSave());
        document.getElementById('import-save').addEventListener('click', () => this._importSave());
        document.getElementById('clear-save').addEventListener('click', () => this._clearSave());

        document.addEventListener('optionChange', (e) => {
            const { key, value } = e.detail;
            this.playerData.options[key] = value;
            this._savePlayerData();
            this._applyOptions();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  SIDE STUFF (funny/useless features)
    // ══════════════════════════════════════════════════════════

    _setupClickCounter() {
        document.addEventListener('click', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.totalClicks++;
                this.ui.updateClickCounter(this.totalClicks);
            }
        });
    }

    _setupGlitchPet() {
        const pets = ['🐱', '🐕', '🐸', '🦊', '🐧', '👾', '🤖', '🐛'];
        setInterval(() => {
            if (this.gameStarted && !this.gameEnded && Math.random() < 0.3) {
                const pet = pets[Math.floor(Math.random() * pets.length)];
                this.ui.spawnGlitchPet(pet);
            }
        }, 18000);
    }

    _showRandomMessage() {
        const msgs = GAME_DATA.funnyMessages;
        this.ui.showFunnyMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    }

    _updateMenuStats() {
        if (this.playerData.totalPlaythroughs > 0) {
            this.ui.showMenuStats(this.playerData);
        }
    }

    // ══════════════════════════════════════════════════════════
    //  MENU EVENTS
    // ══════════════════════════════════════════════════════════

    _bindMenuEvents() {
        document.getElementById('play-btn').addEventListener('click', () => this._startIntro());

        document.getElementById('lang-btn').addEventListener('click', () => {
            window.currentLang = window.currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('sekiverse_lang', window.currentLang);
            location.reload();
        });

        // Easter egg: click credits 5 times
        const credits = document.querySelector('.credits');
        credits.addEventListener('click', () => {
            this.easterEggClicks++;
            if (this.easterEggClicks >= 5 && !this.badges.easterEggFound) {
                credits.classList.add('easter-activated');
                this.badges.trackEasterEgg();
                this.ui.showBadgeToast(GAME_DATA.badges.find(b => b.id === 'curioso'));
                const easterMsg = window.currentLang === 'en' ? '🔮 "Not all that glitters is gold, but all that blinks hides something."' : '🔮 "Nem tudo que brilha é ouro, mas tudo que pisca esconde algo."';
                this.ui.showFunnyMessage(easterMsg);
            }
        });

        document.getElementById('continue-btn').addEventListener('click', () => this._startGame());
    }

    _bindBadgeEvents() {
        document.getElementById('badges-btn').addEventListener('click', () => {
            this.ui.showBadgesOverlay(this.badges.getAllBadges());
        });
        document.getElementById('close-badges-btn').addEventListener('click', () => {
            this.ui.hideBadgesOverlay();
        });
    }

    // ══════════════════════════════════════════════════════════
    //  GAME FLOW
    // ══════════════════════════════════════════════════════════

    async _startIntro() {
        this.ui.showScreen('intro');
        const loreEl = document.querySelector('.lore-text');
        const continueBtn = document.getElementById('continue-btn');
        continueBtn.classList.remove('visible');

        const isReturning = this.playerData.completedEndings.length > 0;
        const text = isReturning ? GAME_DATA.secondPlayLoreText : GAME_DATA.loreText;

        if (this.playerData.options.skipIntro) {
            loreEl.textContent = text;
            setTimeout(() => continueBtn.classList.add('visible'), 200);
        } else {
            await this.ui.typewriterEffect(loreEl, text, 28);
            setTimeout(() => continueBtn.classList.add('visible'), 500);
        }
    }

    _startGame() {
        this.ui.showScreen('game');
        this.gameStarted = true;
        this.totalClicks = 0;
        this.correctStreak = 0;
        this.bestStreak = 0;
        this._lastWasError = false;

        this.timer = new Timer(GAME_DATA.timerSeconds,
            (remaining, formatted) => this.ui.updateTimer(formatted, remaining),
            () => this._endGame('backrooms')
        );
        this.timer.start();
        this.ui.updateTimer(this.timer.getFormatted(), this.timer.getRemaining());
        this.ui.updateClickCounter(0);
        this._loadArea(0);
    }

    async _loadArea(areaIndex) {
        if (this.gameEnded) return;
        this.currentArea = areaIndex;
        this.currentPuzzle = 0;
        const area = GAME_DATA.areas[areaIndex];

        this.ui.setAreaTheme(area.theme);
        this.ui.renderDecorations(area, (areaId) => {
            this.badges.trackExplorerElement(areaId);
            if (this.badges.isUnlocked('explorador')) {
                this.ui.showBadgeToast(GAME_DATA.badges.find(b => b.id === 'explorador'));
            }
        });

        // Area 5 special effects
        if (area.theme === 'area-void') {
            this.ui.startBlackHoles();
            this.ui.startTremble();
        }

        await this.ui.showAreaTransition(area.name, area.subtitle);
        if (areaIndex > 0) this._showRandomMessage();
        this.ui.updateAreaInfo(area.name, 0, this.totalPuzzlesPerArea);
        this._loadPuzzle();
    }

    _loadPuzzle() {
        if (this.gameEnded) return;
        const area = GAME_DATA.areas[this.currentArea];
        this.ui.updateAreaInfo(area.name, this.currentPuzzle, this.totalPuzzlesPerArea);

        if (area.theme === 'area-void' && this.currentPuzzle > 0) {
            this.ui.addChaosLevel(this.currentPuzzle);
        }

        if (this.currentPuzzle < 4) {
            this.puzzles.renderQuestion(area.questions[this.currentPuzzle],
                this.currentPuzzle, this.totalPuzzlesPerArea,
                () => this._onPuzzleComplete(),
                () => this._onPuzzleError()
            );
        } else {
            this.puzzles.renderMiniGame(area,
                () => this._onPuzzleComplete(),
                () => this._onPuzzleError()
            );
        }
    }

    async _onPuzzleComplete() {
        if (this.gameEnded || this._isTransitioning) return;

        // Track streak (questions only, not mini-games)
        if (this.currentPuzzle < 4 && !this._lastWasError) {
            this.correctStreak++;
            this.bestStreak = Math.max(this.bestStreak, this.correctStreak);
            this.ui.spawnConfetti();
            if (this.correctStreak >= 3) {
                this.ui.showStreakToast(this.correctStreak);
            }
        }
        this._lastWasError = false;
        this.currentPuzzle++;

        if (this.currentPuzzle >= this.totalPuzzlesPerArea) {
            await this._onAreaComplete();
        } else {
            this._loadPuzzle();
        }
    }

    _onPuzzleError() {
        this.badges.trackError();
        this.correctStreak = 0;
        this._lastWasError = true;
    }

    async _onAreaComplete() {
        if (this.gameEnded || this._isTransitioning) return;
        this._isTransitioning = true;
        const area = GAME_DATA.areas[this.currentArea];
        this.badges.trackAreaComplete(area.id);

        const areaBadges = ['despertar', 'reflexo', 'mecanico', 'hacker', 'voidwalker'];
        this.ui.showBadgeToast(GAME_DATA.badges.find(b => b.id === areaBadges[this.currentArea]));

        if (this.badges.areasCompleted === 3 && this.badges.isUnlocked('meio_caminho')) {
            setTimeout(() => {
                this.ui.showBadgeToast(GAME_DATA.badges.find(b => b.id === 'meio_caminho'));
            }, 1500);
        }

        await this.ui.showAreaComplete(GAME_DATA.areaCompleteText[this.currentArea]);

        this._isTransitioning = false;
        if (this.currentArea >= 4) {
            this._onGameComplete();
        } else {
            await this._loadArea(this.currentArea + 1);
        }
    }

    _onGameComplete() {
        if (this.gameEnded) return;
        this.timer.stop();
        this.badges.checkEndGameBadges(this.timer.getRemaining());

        ['speedrunner', 'perfeccionista'].forEach((id, i) => {
            if (this.badges.isUnlocked(id)) {
                setTimeout(() => {
                    this.ui.showBadgeToast(GAME_DATA.badges.find(b => b.id === id));
                }, i * 800);
            }
        });

        let endingKey = this.badges.getEnding();
        this._trueEndingLocked = false;

        // ★ TRUE ENDING LOCK: must have completed good ending (limbo) first
        if (endingKey === 'trueEnd' && !this.playerData.completedEndings.includes('limbo')) {
            endingKey = 'limbo';
            this._trueEndingLocked = true;
        }

        // Save progress
        if (!this.playerData.completedEndings.includes(endingKey)) {
            this.playerData.completedEndings.push(endingKey);
        }
        this.playerData.totalPlaythroughs++;
        const elapsed = GAME_DATA.timerSeconds - this.timer.getRemaining();
        if (!this.playerData.bestTime || elapsed < this.playerData.bestTime) {
            this.playerData.bestTime = elapsed;
        }
        this._savePlayerData();

        setTimeout(() => this._endGame(endingKey), 2000);
    }

    _endGame(endingKey) {
        if (this.gameEnded) return;
        this.gameEnded = true;
        if (this.timer) this.timer.stop();
        this.ui.stopBlackHoles();

        if (endingKey === 'backrooms') {
            if (!this.playerData.completedEndings.includes('backrooms')) {
                this.playerData.completedEndings.push('backrooms');
            }
            this.playerData.totalPlaythroughs++;
            this._savePlayerData();
        }

        const stats = {
            clicks: this.totalClicks,
            bestStreak: this.bestStreak,
            errors: this.badges.errorCount,
            timeUsed: GAME_DATA.timerSeconds - (this.timer ? this.timer.getRemaining() : GAME_DATA.timerSeconds)
        };

        this.ui.showEnding(GAME_DATA.endings[endingKey], this.badges.getUnlockedCount(), stats, this._trueEndingLocked);
    }

    // ── Menu Theme (white after true ending) ─────────────────
    _applyMenuTheme() {
        if (this.playerData.completedEndings.includes('trueEnd')) {
            document.getElementById('menu-screen').classList.add('menu-true-end');
        }
    }
}

// ── Auto-start ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
