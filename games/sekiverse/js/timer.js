// ============================================================
// SEKIVERSE — Timer Module
// Countdown timer with callbacks
// ============================================================

class Timer {
    constructor(totalSeconds, onTick, onEnd) {
        this.total = totalSeconds;
        this.remaining = totalSeconds;
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.interval = null;
        this.running = false;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.interval = setInterval(() => {
            this.remaining--;
            if (this.onTick) this.onTick(this.remaining, this.getFormatted());
            if (this.remaining <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            }
        }, 1000);
    }

    stop() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    pause() {
        this.stop();
    }

    resume() {
        this.start();
    }

    getFormatted() {
        const min = Math.floor(this.remaining / 60);
        const sec = this.remaining % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    getRemaining() {
        return this.remaining;
    }

    isWarning() {
        return this.remaining <= 60;
    }

    isCritical() {
        return this.remaining <= 30;
    }

    reset() {
        this.stop();
        this.remaining = this.total;
    }
}
