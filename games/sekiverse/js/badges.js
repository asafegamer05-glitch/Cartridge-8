// ============================================================
// SEKIVERSE — Badge System Module
// Tracks unlocked badges, checks conditions, persists state
// ============================================================

class BadgeSystem {
    constructor(badgeDefinitions) {
        this.definitions = badgeDefinitions; // from GAME_DATA.badges
        this.unlocked = {};                  // { badgeId: timestamp }
        this.errorCount = 0;
        this.areasCompleted = 0;
        this.explorerFound = new Set();      // area IDs where explorer element was found
        this.easterEggFound = false;
        this.miniGameFirstTry = new Set();   // area IDs where mini-game was completed first try
    }

    // ── Unlock a badge ────────────────────────────────────────
    unlock(badgeId) {
        if (this.unlocked[badgeId]) return false; // already unlocked
        this.unlocked[badgeId] = Date.now();
        return true;
    }

    isUnlocked(badgeId) {
        return !!this.unlocked[badgeId];
    }

    getUnlockedCount() {
        return Object.keys(this.unlocked).length;
    }

    getAllBadges() {
        return this.definitions.map(def => ({
            ...def,
            unlocked: !!this.unlocked[def.id]
        }));
    }

    // ── Track events ──────────────────────────────────────────
    trackError() {
        this.errorCount++;
    }

    trackAreaComplete(areaId) {
        this.areasCompleted++;

        // Badge: area-specific
        const areasBadges = ["despertar", "reflexo", "mecanico", "hacker", "voidwalker"];
        if (areaId >= 1 && areaId <= 5) {
            this.unlock(areasBadges[areaId - 1]);
        }

        // Badge: Meio Caminho (complete 3 areas)
        if (this.areasCompleted >= 3) {
            this.unlock("meio_caminho");
        }
    }

    trackExplorerElement(areaId) {
        this.explorerFound.add(areaId);

        // Badge: Explorador (all 5 areas)
        if (this.explorerFound.size >= 5) {
            this.unlock("explorador");
        }
    }

    trackEasterEgg() {
        if (!this.easterEggFound) {
            this.easterEggFound = true;
            this.unlock("curioso");
        }
    }

    // ── End-of-game badge checks ─────────────────────────────
    checkEndGameBadges(timeRemaining) {
        // Speedrunner: 3+ minutes remaining (180s)
        if (timeRemaining >= 60) {
            this.unlock("speedrunner");
        }

        // Perfeccionista: max 4 errors
        if (this.errorCount <= 4) {
            this.unlock("perfeccionista");
        }
    }

    // ── Determine ending ──────────────────────────────────────
    getEnding() {
        const totalBadges = this.getUnlockedCount();
        const allAreas = this.areasCompleted >= 5;

        if (allAreas && totalBadges >= 10) {
            return "trueEnd";
        } else if (allAreas) {
            return "limbo";
        }
        return "limbo"; // shouldn't reach here normally
    }

    // ── Serialize / Deserialize ───────────────────────────────
    toJSON() {
        return {
            unlocked: this.unlocked,
            errorCount: this.errorCount,
            areasCompleted: this.areasCompleted,
            explorerFound: [...this.explorerFound],
            easterEggFound: this.easterEggFound
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.unlocked = data.unlocked || {};
        this.errorCount = data.errorCount || 0;
        this.areasCompleted = data.areasCompleted || 0;
        this.explorerFound = new Set(data.explorerFound || []);
        this.easterEggFound = data.easterEggFound || false;
    }
}
