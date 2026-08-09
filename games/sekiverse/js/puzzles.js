// ============================================================
// SEKIVERSE — Puzzle Manager Module
// Renders questions and mini-games, handles user interaction
// ============================================================

class PuzzleManager {
    constructor(container, ui) {
        this.container = container;
        this.ui = ui;
        this.onComplete = null;
        this.onError = null;
    }

    // ── Render a multiple-choice question ─────────────────────
    renderQuestion(questionData, questionIndex, totalQuestions, onComplete, onError) {
        this.onComplete = onComplete;
        this.onError = onError;
        this.container.innerHTML = '';
        this.container.style.animation = 'none';
        void this.container.offsetWidth;
        this.container.style.animation = 'fadeSlideIn 0.5s ease';

        // Question box
        const qBox = document.createElement('div');
        qBox.className = 'question-box';

        const qNum = document.createElement('div');
        qNum.className = 'question-number';
        qNum.textContent = window.currentLang === 'en' 
            ? `Challenge ${questionIndex + 1} of ${totalQuestions}` 
            : `Desafio ${questionIndex + 1} de ${totalQuestions}`;

        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.textContent = questionData.question;

        qBox.appendChild(qNum);
        qBox.appendChild(qText);

        // Options grid
        const optGrid = document.createElement('div');
        optGrid.className = 'options-grid';

        questionData.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => this._handleAnswer(btn, optGrid, i, questionData));
            optGrid.appendChild(btn);
        });

        // Feedback area
        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        feedback.id = 'question-feedback';

        this.container.appendChild(qBox);
        this.container.appendChild(optGrid);
        this.container.appendChild(feedback);
    }

    _handleAnswer(btn, grid, selectedIndex, questionData) {
        const buttons = grid.querySelectorAll('.option-btn');
        buttons.forEach(b => b.classList.add('disabled'));

        const feedback = document.getElementById('question-feedback');

        if (selectedIndex === questionData.correct) {
            btn.classList.add('correct');
            feedback.textContent = '✓ ' + questionData.explanation;
            feedback.classList.add('visible');
            setTimeout(() => {
                if (this.onComplete) this.onComplete();
            }, 1200);
        } else {
            btn.classList.add('wrong');
            buttons[questionData.correct].classList.add('correct');
            feedback.textContent = '✗ ' + questionData.explanation;
            feedback.classList.add('visible');
            if (this.onError) this.onError();
            setTimeout(() => {
                if (this.onComplete) this.onComplete();
            }, 2000);
        }
    }

    // ── Render a mini-game ────────────────────────────────────
    renderMiniGame(areaData, onComplete, onError) {
        this.onComplete = onComplete;
        this.onError = onError;
        const mg = areaData.miniGame;

        this.container.innerHTML = '';
        this.container.style.animation = 'none';
        void this.container.offsetWidth;
        this.container.style.animation = 'fadeSlideIn 0.5s ease';

        switch (mg.type) {
            case 'simon':   this._renderSimon(mg); break;
            case 'unscramble': this._renderUnscramble(mg); break;
            case 'lock':    this._renderLock(mg); break;
            case 'cipher':  this._renderCipher(mg); break;
            case 'order':   this._renderOrder(mg); break;
        }
    }

    // ── SIMON SAYS ────────────────────────────────────────────
    _renderSimon(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'minigame-container';

        const L_OBSERVE = window.currentLang === 'en' ? 'Observe the sequence...' : 'Observe a sequência...';
        wrapper.innerHTML = `
            <div class="minigame-title">${config.title}</div>
            <div class="minigame-desc">${config.description}</div>
            <div class="simon-grid" id="simon-grid"></div>
            <div class="simon-status" id="simon-status">${L_OBSERVE}</div>
        `;
        this.container.appendChild(wrapper);

        const grid = document.getElementById('simon-grid');
        const pads = [];
        config.colors.forEach((color, i) => {
            const pad = document.createElement('div');
            pad.className = 'simon-pad';
            pad.style.background = color;
            pad.style.opacity = '0.4';
            pad.dataset.index = i;
            pads.push(pad);
            grid.appendChild(pad);
        });

        // Generate random sequence
        const sequence = [];
        for (let i = 0; i < config.sequenceLength; i++) {
            sequence.push(Math.floor(Math.random() * 4));
        }

        let playerInput = [];
        let inputEnabled = false;

        const flashPad = (index, duration = 400) => {
            return new Promise(resolve => {
                pads[index].classList.add('flash');
                pads[index].style.opacity = '1';
                setTimeout(() => {
                    pads[index].classList.remove('flash');
                    pads[index].style.opacity = '0.4';
                    setTimeout(resolve, 150);
                }, duration);
            });
        };

        const playSequence = async () => {
            const L_OBSERVE = window.currentLang === 'en' ? 'Observe the sequence...' : 'Observe a sequência...';
            const L_YOUR_TURN = window.currentLang === 'en' ? 'Your turn! Repeat the sequence.' : 'Sua vez! Repita a sequência.';
            inputEnabled = false;
            document.getElementById('simon-status').textContent = L_OBSERVE;
            await new Promise(r => setTimeout(r, 600));
            for (const idx of sequence) {
                await flashPad(idx);
            }
            inputEnabled = true;
            playerInput = [];
            document.getElementById('simon-status').textContent = L_YOUR_TURN;
        };

        pads.forEach((pad, i) => {
            pad.addEventListener('click', () => {
                if (!inputEnabled) return;
                flashPad(i, 200);
                playerInput.push(i);

                const currentIdx = playerInput.length - 1;
                if (playerInput[currentIdx] !== sequence[currentIdx]) {
                    // Wrong
                    const L_WRONG = window.currentLang === 'en' ? 'Wrong sequence! Trying again...' : 'Sequência errada! Tentando novamente...';
                    inputEnabled = false;
                    document.getElementById('simon-status').textContent = L_WRONG;
                    pad.style.opacity = '1';
                    pad.style.boxShadow = '0 0 30px #ff0033';
                    if (this.onError) this.onError();
                    setTimeout(() => {
                        pad.style.boxShadow = '';
                        playSequence();
                    }, 1500);
                    return;
                }

                if (playerInput.length === sequence.length) {
                    // Correct!
                    const L_CORRECT = window.currentLang === 'en' ? '✓ Correct sequence!' : '✓ Sequência correta!';
                    inputEnabled = false;
                    document.getElementById('simon-status').textContent = L_CORRECT;
                    pads.forEach(p => { p.style.opacity = '1'; p.classList.add('flash'); });
                    setTimeout(() => {
                        if (this.onComplete) this.onComplete();
                    }, 1200);
                }
            });
        });

        setTimeout(() => playSequence(), 800);
    }

    // ── WORD UNSCRAMBLE ───────────────────────────────────────
    _renderUnscramble(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'minigame-container';

        const word = config.word.toUpperCase();
        const letters = word.split('');
        const shuffled = [...letters].sort(() => Math.random() - 0.5);
        // Make sure it's actually shuffled
        while (shuffled.join('') === letters.join('')) {
            shuffled.sort(() => Math.random() - 0.5);
        }

        const L_HINT = window.currentLang === 'en' ? 'Hint' : 'Dica';
        const L_CLEAR = window.currentLang === 'en' ? '↺ Clear' : '↺ Limpar';

        wrapper.innerHTML = `
            <div class="minigame-title">${config.title}</div>
            <div class="minigame-desc">${config.description}</div>
            <div class="unscramble-area">
                <div class="word-display" id="word-display"></div>
                <div class="minigame-desc" style="font-style:italic; opacity:0.6;">${L_HINT}: ${config.hint}</div>
                <div class="letter-bank" id="letter-bank"></div>
                <button class="submit-btn" id="unscramble-reset" style="font-size:0.7rem; padding:8px 20px;">${L_CLEAR}</button>
            </div>
        `;
        this.container.appendChild(wrapper);

        const display = document.getElementById('word-display');
        const bank = document.getElementById('letter-bank');
        const resetBtn = document.getElementById('unscramble-reset');

        let currentWord = [];
        let usedIndices = new Set();

        // Create slots
        for (let i = 0; i < word.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            display.appendChild(slot);
        }

        // Create letter buttons
        shuffled.forEach((letter, i) => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.textContent = letter;
            btn.dataset.index = i;
            btn.addEventListener('click', () => {
                if (usedIndices.has(i)) return;
                usedIndices.add(i);
                btn.classList.add('used');
                currentWord.push(letter);
                updateDisplay();
            });
            bank.appendChild(btn);
        });

        const updateDisplay = () => {
            const slots = display.querySelectorAll('.letter-slot');
            slots.forEach((slot, i) => {
                if (i < currentWord.length) {
                    slot.textContent = currentWord[i];
                    slot.classList.add('filled');
                } else {
                    slot.textContent = '';
                    slot.classList.remove('filled');
                }
            });

            if (currentWord.length === word.length) {
                const attempt = currentWord.join('');
                if (attempt === word) {
                    setTimeout(() => {
                        if (this.onComplete) this.onComplete();
                    }, 800);
                } else {
                    if (this.onError) this.onError();
                    setTimeout(() => resetWord(), 800);
                }
            }
        };

        const resetWord = () => {
            currentWord = [];
            usedIndices.clear();
            bank.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('used'));
            updateDisplay();
        };

        resetBtn.addEventListener('click', resetWord);
    }

    // ── COMBINATION LOCK ──────────────────────────────────────
    _renderLock(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'minigame-container';

        const digits = config.answer.length;
        const values = new Array(digits).fill(0);

        let lockHTML = `
            <div class="minigame-title">${config.title}</div>
            <div class="minigame-desc">${config.description}</div>
            <div class="lock-container" id="lock-container">
        `;

        for (let i = 0; i < digits; i++) {
            lockHTML += `
                <div class="lock-dial">
                    <button class="dial-btn dial-up" data-digit="${i}">▲</button>
                    <div class="dial-value" id="dial-${i}">0</div>
                    <button class="dial-btn dial-down" data-digit="${i}">▼</button>
                </div>
            `;
        }

        const L_OPEN = window.currentLang === 'en' ? 'Open Vault' : 'Abrir Cofre';
        lockHTML += `</div><div class="lock-clues" id="lock-clues"></div>`;
        lockHTML += `<button class="submit-btn" id="lock-submit">${L_OPEN}</button>`;

        wrapper.innerHTML = lockHTML;
        this.container.appendChild(wrapper);

        // Add clues
        const cluesContainer = document.getElementById('lock-clues');
        config.clues.forEach(clue => {
            const div = document.createElement('div');
            div.className = 'lock-clue';
            div.textContent = `🔑 ${clue}`;
            cluesContainer.appendChild(div);
        });

        // Dial controls
        document.querySelectorAll('.dial-up').forEach(btn => {
            btn.addEventListener('click', () => {
                const d = parseInt(btn.dataset.digit);
                values[d] = (values[d] + 1) % 10;
                document.getElementById(`dial-${d}`).textContent = values[d];
            });
        });

        document.querySelectorAll('.dial-down').forEach(btn => {
            btn.addEventListener('click', () => {
                const d = parseInt(btn.dataset.digit);
                values[d] = (values[d] + 9) % 10;
                document.getElementById(`dial-${d}`).textContent = values[d];
            });
        });

        // Submit
        document.getElementById('lock-submit').addEventListener('click', () => {
            const correct = config.answer.every((v, i) => values[i] === v);
            if (correct) {
                document.querySelectorAll('.dial-value').forEach(d => {
                    d.style.borderColor = 'var(--neon-green)';
                    d.style.color = 'var(--neon-green)';
                });
                setTimeout(() => {
                    if (this.onComplete) this.onComplete();
                }, 1000);
            } else {
                if (this.onError) this.onError();
                document.querySelectorAll('.dial-value').forEach(d => {
                    d.style.borderColor = 'var(--neon-red)';
                    d.style.color = 'var(--neon-red)';
                    setTimeout(() => {
                        d.style.borderColor = '';
                        d.style.color = '';
                    }, 600);
                });
            }
        });
    }

    // ── CIPHER DECODER ────────────────────────────────────────
    _renderCipher(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'minigame-container';

        const L_ENCODED = window.currentLang === 'en' ? 'Encoded Message' : 'Mensagem Codificada';
        const L_RESULT = window.currentLang === 'en' ? 'Result' : 'Resultado';
        const L_SHIFT = window.currentLang === 'en' ? 'Shift' : 'Deslocamento';
        const L_DECODE = window.currentLang === 'en' ? 'Decode' : 'Decodificar';
        const L_HINT = window.currentLang === 'en' ? 'Hint' : 'Dica';

        wrapper.innerHTML = `
            <div class="minigame-title">${config.title}</div>
            <div class="minigame-desc">${config.description}</div>
            <div class="cipher-area">
                <div style="font-size:0.7rem; color:rgba(255,255,255,0.3); letter-spacing:0.2em; text-transform:uppercase; font-family:var(--font-mono);">${L_ENCODED}</div>
                <div class="cipher-encoded">${config.encoded}</div>
                <div style="font-size:0.7rem; color:rgba(255,255,255,0.3); letter-spacing:0.2em; text-transform:uppercase; font-family:var(--font-mono);">${L_RESULT}</div>
                <div class="cipher-decoded" id="cipher-result">????</div>
                <div class="cipher-slider-container">
                    <label>${L_SHIFT}: <span class="cipher-shift-value" id="shift-display">0</span></label>
                    <input type="range" class="cipher-slider" id="cipher-slider" min="0" max="25" value="0">
                </div>
                <div class="minigame-desc" style="font-style:italic; opacity:0.5;">${L_HINT}: ${config.hint}</div>
                <button class="submit-btn" id="cipher-submit">${L_DECODE}</button>
            </div>
            <button class="submit-btn" id="cipher-type-btn">${window.currentLang === 'en' ? 'Type Answer' : 'Digitar Resposta'}</button>
        `;
        this.container.appendChild(wrapper);

        const slider = document.getElementById('cipher-slider');
        const display = document.getElementById('shift-display');
        const result = document.getElementById('cipher-result');
        const typeBtn = document.getElementById('cipher-type-btn');

        if (typeBtn) {
            typeBtn.addEventListener('click', () => {
                if (!this.ui) return;
                this.ui.openVirtualKeyboard('', (value) => {
                    const entry = value.trim().toUpperCase();
                    if (entry === config.decoded) {
                        result.style.fontSize = '3rem';
                        result.textContent = '✓ ' + entry;
                        setTimeout(() => {
                            if (this.onComplete) this.onComplete();
                        }, 1000);
                    } else {
                        if (this.onError) this.onError();
                        const flash = document.createElement('div');
                        flash.className = 'screen-flash';
                        document.body.appendChild(flash);
                        setTimeout(() => flash.remove(), 400);
                    }
                });
            });
        }

        const decode = (text, shift) => {
            return text.split('').map(c => {
                if (c >= 'A' && c <= 'Z') {
                    return String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
                }
                return c;
            }).join('');
        };

        slider.addEventListener('input', () => {
            const shift = parseInt(slider.value);
            display.textContent = shift;
            const decoded = decode(config.encoded, shift);
            result.textContent = decoded;
            if (decoded === config.decoded) {
                result.classList.add('match');
            } else {
                result.classList.remove('match');
            }
        });

        document.getElementById('cipher-submit').addEventListener('click', () => {
            const shift = parseInt(slider.value);
            const decoded = decode(config.encoded, shift);
            if (decoded === config.decoded) {
                result.style.fontSize = '3rem';
                result.textContent = '✓ ' + decoded;
                setTimeout(() => {
                    if (this.onComplete) this.onComplete();
                }, 1000);
            } else {
                if (this.onError) this.onError();
                const flash = document.createElement('div');
                flash.className = 'screen-flash';
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 400);
            }
        });
    }

    // ── ORDER CLICK ───────────────────────────────────────────
    _renderOrder(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'minigame-container';

        wrapper.innerHTML = `
            <div class="minigame-title">${config.title}</div>
            <div class="minigame-desc">${config.description}</div>
            <div class="order-field" id="order-field"></div>
        `;
        this.container.appendChild(wrapper);

        const field = document.getElementById('order-field');
        let nextExpected = 1;
        const positions = [];

        // Generate non-overlapping positions
        for (let i = 0; i < config.count; i++) {
            let x, y, overlap;
            let attempts = 0;
            do {
                x = 20 + Math.random() * (field.offsetWidth - 70);
                y = 15 + Math.random() * (field.offsetHeight - 78);
                overlap = positions.some(p => Math.hypot(p.x - x, p.y - y) < 60);
                attempts++;
            } while (overlap && attempts < 50);
            positions.push({ x, y });
        }

        // Shuffle display order so numbers appear randomly positioned
        const numbers = Array.from({ length: config.count }, (_, i) => i + 1);

        numbers.forEach((num, i) => {
            const circle = document.createElement('div');
            circle.className = 'order-circle';
            circle.textContent = num;
            circle.style.left = positions[i].x + 'px';
            circle.style.top = positions[i].y + 'px';
            circle.style.animationDelay = (i * 0.08) + 's';

            circle.addEventListener('click', () => {
                if (num === nextExpected) {
                    circle.classList.add('clicked');
                    nextExpected++;
                    if (nextExpected > config.count) {
                        setTimeout(() => {
                            if (this.onComplete) this.onComplete();
                        }, 600);
                    }
                } else {
                    circle.classList.add('wrong-click');
                    if (this.onError) this.onError();
                    setTimeout(() => circle.classList.remove('wrong-click'), 500);
                    const flash = document.createElement('div');
                    flash.className = 'screen-flash';
                    document.body.appendChild(flash);
                    setTimeout(() => flash.remove(), 400);
                }
            });

            field.appendChild(circle);
        });
    }
}
