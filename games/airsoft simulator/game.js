 // Airsoft Simulator 2D - Game Engine

// 1. Weapon Configurations
const WEAPONS = {
    RIFLE: {
        name: "Fuzil M4A1",
        fireRate: 140, // ms between shots
        capacity: 20,
        reloadTime: 2000,
        range: 650,
        spread: 0.08,
        bulletSpeed: 950,
        burstSize: 3,
        burstDelay: 350
    },
    M16: {
        name: "Fuzil M16",
        fireRate: 80,
        capacity: 30,
        reloadTime: 2200,
        range: 750,
        spread: 0.05,
        bulletSpeed: 1000,
        burstSize: 3,
        burstDelay: 450
    },
    SNIPER: {
        name: "Sniper AW50",
        fireRate: 1400, // Bolt-action cooldown
        capacity: 3,
        reloadTime: 2600,
        range: 1100,
        spread: 0.005,
        bulletSpeed: 1800,
        burstSize: 1,
        burstDelay: 100
    },
    SHOTGUN: {
        name: "Escopeta M3",
        fireRate: 750,
        capacity: 5,
        reloadTime: 2400,
        range: 280,
        spread: 0.12,
        bulletSpeed: 750,
        burstSize: 1,
        burstDelay: 100,
        isShotgun: true
    },
    PISTOL: {
        name: "Pistola G18",
        fireRate: 350,
        capacity: 15,
        reloadTime: 1400,
        range: 450,
        spread: 0.04,
        bulletSpeed: 800,
        burstSize: 1,
        burstDelay: 100
    },
    DEAGLE: {
        name: "Desert Eagle",
        fireRate: 450,
        capacity: 7,
        reloadTime: 1600,
        range: 500,
        spread: 0.05,
        bulletSpeed: 850,
        burstSize: 1,
        burstDelay: 100
    },
    KNIFE: {
        name: "Faca T�tica",
        fireRate: 600,
        capacity: Infinity,
        reloadTime: 0,
        range: 55,
        spread: 0,
        bulletSpeed: 0,
        isMelee: true
    },
    GOLDKNIFE: {
        name: "Faca de Ouro",
        fireRate: 500,
        capacity: Infinity,
        reloadTime: 0,
        range: 60,
        spread: 0,
        bulletSpeed: 0,
        isMelee: true
    }
};

// 1.5. User Profile, Economy, Skins & Ranks Systems
let userProfile = {
    coins: 0,
    rankPoints: 0,
    unlockedWeapons: ["RIFLE", "PISTOL", "KNIFE"],
    unlockedSkins: ["default"],
    selectedSkin: "default",
    equippedPrimary: "RIFLE",
    equippedSecondary: "PISTOL",
    equippedMelee: "KNIFE"
};

let adminModeActive = false;
let skibidiModeActive = false;

const RANKS = [
    "Recruta 1", "Recruta 2", "Recruta 3",
    "Combatente 1", "Combatente 2", "Combatente 3",
    "Agente 1", "Agente 2", "Agente 3",
    "Especialista 1", "Especialista 2", "Especialista 3",
    "Mestre 1", "Mestre 2", "Mestre 3",
    "Veterano"
];

const WEAPONS_SHOP_DATA = [
    { key: "RIFLE", price: 0, category: "primary", desc: "Fuzil M4A1 padr�o t�tico." },
    { key: "M16", price: 150, category: "primary", desc: "Fuzil de assalto em rajadas de 3 tiros." },
    { key: "SNIPER", price: 400, category: "primary", desc: "Fuzil de ferrolho. 3 tiros por cartucho de alta precis�o." },
    { key: "SHOTGUN", price: 300, category: "primary", desc: "Escopeta t�tica calibre 12, dispara 5 proj�teis em cone." },
    { key: "PISTOL", price: 0, category: "secondary", desc: "Pistola leve padr�o t�tico." },
    { key: "DEAGLE", price: 100, category: "secondary", desc: "Desert Eagle .50 calibre. Alto impacto." },
    { key: "KNIFE", price: 0, category: "melee", desc: "Faca de combate padr�o." },
    { key: "GOLDKNIFE", price: 250, category: "melee", desc: "Faca banhada a ouro para veteranos e ostentadores." }
];

const SKINS_DATA = [
    { key: "default", name: "Padr�o", color: "#4caf50", reqRank: 0 },
    { key: "camo", name: "Camuflado", color: "#795548", reqRank: 2 },
    { key: "shadow", name: "Sombra", color: "#212121", reqRank: 5 },
    { key: "gold", name: "Dourado", color: "#ffd700", reqRank: 9 },
    { key: "rainbow", name: "Arco-�ris (RGB)", color: "rainbow", reqRank: 15 } // Only for Veterano rank index 15!
];

// 2. Map Definitions & Layouts
let currentMapSize = 2000;
let walls = [];
let windows = [];
let trees = [];
let dirtPaths = [];
let greenBase = { x: 50, y: 950, w: 150, h: 150 };
let redBase = { x: 1800, y: 950, w: 150, h: 150 };

// Map 1: Standard Forest (2000x2000px, 5v5)
const MAP_STANDARD = {
    size: 2000,
    greenBase: { x: 50, y: 950, w: 150, h: 150 },
    redBase: { x: 1800, y: 950, w: 150, h: 150 },
    walls: [
        // Outer boundaries
        { x: 0, y: 0, w: 2000, h: 20, type: 'metal' },
        { x: 0, y: 0, w: 20, h: 2000, type: 'metal' },
        { x: 0, y: 1980, w: 2000, h: 20, type: 'metal' },
        { x: 1980, y: 0, w: 20, h: 2000, type: 'metal' },

        // Cabin 1 (Top Left) - Left wall has a door gap
        { x: 300, y: 300, w: 200, h: 20, type: 'wood' },
        { x: 300, y: 300, w: 20, h: 100, type: 'wood' },
        { x: 300, y: 480, w: 20, h: 70, type: 'wood' },
        { x: 300, y: 530, w: 200, h: 20, type: 'wood' },
        { x: 480, y: 380, w: 20, h: 170, type: 'wood' },

        // Cabin 2 (Top Right) - Top wall has a door gap
        { x: 1400, y: 300, w: 70, h: 20, type: 'wood' },
        { x: 1540, y: 300, w: 60, h: 20, type: 'wood' },
        { x: 1580, y: 300, w: 20, h: 250, type: 'wood' },
        { x: 1400, y: 530, w: 200, h: 20, type: 'wood' },
        { x: 1400, y: 300, w: 20, h: 150, type: 'wood' },

        // Cabin 3 (Bottom Left) - Bottom wall has a door gap
        { x: 300, y: 1400, w: 80, h: 20, type: 'wood' },
        { x: 450, y: 1400, w: 50, h: 20, type: 'wood' },
        { x: 300, y: 1200, w: 20, h: 220, type: 'wood' },
        { x: 300, y: 1200, w: 200, h: 20, type: 'wood' },
        { x: 480, y: 1200, w: 20, h: 150, type: 'wood' },

        // Cabin 4 (Bottom Right) - Right wall has a door gap
        { x: 1400, y: 1400, w: 200, h: 20, type: 'wood' },
        { x: 1580, y: 1200, w: 20, h: 80, type: 'wood' },
        { x: 1580, y: 1350, w: 20, h: 70, type: 'wood' },
        { x: 1400, y: 1200, w: 200, h: 20, type: 'wood' },
        { x: 1400, y: 1270, w: 20, h: 150, type: 'wood' },

        // Center Fort
        { x: 900, y: 850, w: 200, h: 80, type: 'wood' },
        { x: 900, y: 1020, w: 200, h: 130, type: 'wood' }
    ],
    windows: [
        { x: 480, y: 320, w: 20, h: 60 },
        { x: 1400, y: 450, w: 20, h: 80 },
        { x: 480, y: 1350, w: 20, h: 70 },
        { x: 1400, y: 1200, w: 20, h: 70 },
        { x: 1000, y: 830, w: 80, h: 20 }
    ],
    trees: [
        { x: 150, y: 150, r: 25 },
        { x: 750, y: 180, r: 35 },
        { x: 1100, y: 220, r: 30 },
        { x: 1750, y: 180, r: 25 },
        { x: 200, y: 850, r: 30 },
        { x: 600, y: 950, r: 40 },
        { x: 1300, y: 980, r: 35 },
        { x: 1800, y: 800, r: 30 },
        { x: 700, y: 1500, r: 30 },
        { x: 1150, y: 1650, r: 35 },
        { x: 1650, y: 1500, r: 25 },
        { x: 950, y: 450, r: 40 }
    ],
    dirtPaths: [
        { x1: 100, y1: 1000, x2: 1900, y2: 1000 },
        { x1: 1000, y1: 100, x2: 1000, y2: 1900 }
    ]
};

// Map 2: Giant Forest (4000x4000px, 10v10, Spaced cabins Strategically)
const MAP_GIANT = {
    size: 4000,
    greenBase: { x: 100, y: 1900, w: 200, h: 200 },
    redBase: { x: 3700, y: 1900, w: 200, h: 200 },
    walls: [
        // Outer boundaries
        { x: 0, y: 0, w: 4000, h: 25, type: 'metal' },
        { x: 0, y: 0, w: 25, h: 4000, type: 'metal' },
        { x: 0, y: 3975, w: 4000, h: 25, type: 'metal' },
        { x: 3975, y: 0, w: 25, h: 4000, type: 'metal' },

        // Cabin 1 (North West Corners - x:800, y:800)
        { x: 800, y: 800, w: 250, h: 25, type: 'wood' },
        { x: 800, y: 800, w: 25, h: 90, type: 'wood' }, // Door gap
        { x: 800, y: 970, w: 25, h: 80, type: 'wood' },
        { x: 800, y: 1050, w: 250, h: 25, type: 'wood' },
        { x: 1050, y: 800, w: 25, h: 275, type: 'wood' },

        // Cabin 2 (North East Corners - x:2950, y:800)
        { x: 2950, y: 800, w: 250, h: 25, type: 'wood' },
        { x: 2950, y: 800, w: 25, h: 275, type: 'wood' },
        { x: 2950, y: 1050, w: 90, type: 'wood', h: 25 }, // Door gap
        { x: 3120, y: 1050, w: 80, type: 'wood', h: 25 },
        { x: 3200, y: 800, w: 25, h: 275, type: 'wood' },

        // Cabin 3 (South West Corners - x:800, y:2950)
        { x: 800, y: 2950, w: 250, h: 25, type: 'wood' },
        { x: 800, y: 2950, w: 25, h: 275, type: 'wood' },
        { x: 800, y: 3200, w: 90, type: 'wood', h: 25 }, // Door gap
        { x: 970, y: 3200, w: 80, type: 'wood', h: 25 },
        { x: 1050, y: 2950, w: 25, h: 275, type: 'wood' },

        // Cabin 4 (South East Corners - x:2950, y:2950)
        { x: 2950, y: 2950, w: 250, h: 25, type: 'wood' },
        { x: 2950, y: 2950, w: 25, h: 90, type: 'wood' }, // Door gap
        { x: 2950, y: 3120, w: 25, h: 155, type: 'wood' },
        { x: 2950, y: 3200, w: 275, h: 25, type: 'wood' },
        { x: 3200, y: 2950, w: 25, h: 275, type: 'wood' },

        // Cabin 5 (Left-Center Guard Cabin - x:1200, y:1850)
        { x: 1200, y: 1850, w: 200, h: 25, type: 'wood' },
        { x: 1200, y: 2050, w: 200, h: 25, type: 'wood' },
        { x: 1200, y: 1850, w: 25, h: 70, type: 'wood' }, // Door gap
        { x: 1200, y: 1980, w: 25, h: 95, type: 'wood' },
        { x: 1400, y: 1850, w: 25, h: 225, type: 'wood' },

        // Cabin 6 (Right-Center Guard Cabin - x:2550, y:1850)
        { x: 2550, y: 1850, w: 200, h: 25, type: 'wood' },
        { x: 2550, y: 2050, w: 200, h: 25, type: 'wood' },
        { x: 2550, y: 1850, w: 25, h: 225, type: 'wood' },
        { x: 2750, y: 1850, w: 25, h: 70, type: 'wood' }, // Door gap
        { x: 2750, y: 1980, w: 25, h: 95, type: 'wood' },

        // Cabin 7 (North-Center Cabin - x:1850, y:1000)
        { x: 1850, y: 1000, w: 300, h: 25, type: 'wood' },
        { x: 1850, y: 1200, w: 300, h: 25, type: 'wood' },
        { x: 1850, y: 1000, w: 25, h: 70, type: 'wood' }, // Door gap
        { x: 1850, y: 1120, w: 25, h: 105, type: 'wood' },
        { x: 2150, y: 1000, w: 25, h: 225, type: 'wood' },

        // Cabin 8 (South-Center Cabin - x:1850, y:2700)
        { x: 1850, y: 2700, w: 300, h: 25, type: 'wood' },
        { x: 1850, y: 2900, w: 300, h: 25, type: 'wood' },
        { x: 1850, y: 2700, w: 25, h: 225, type: 'wood' },
        { x: 2150, y: 2700, w: 25, h: 70, type: 'wood' }, // Door gap
        { x: 2150, y: 2820, w: 25, h: 105, type: 'wood' },

        // Central Fort Area (Spaced wall dividers instead of overlay blocks)
        { x: 1850, y: 1850, w: 100, h: 25, type: 'wood' }, // Door gap in center
        { x: 2050, y: 1850, w: 100, h: 25, type: 'wood' },
        { x: 1850, y: 2125, w: 100, h: 25, type: 'wood' },
        { x: 2050, y: 2125, w: 100, h: 25, type: 'wood' }
    ],
    windows: [
        { x: 1050, y: 900, w: 25, h: 60 },
        { x: 2950, y: 900, w: 25, h: 60 },
        { x: 1050, y: 3050, w: 25, h: 60 },
        { x: 3200, y: 3050, w: 25, h: 60 },
        { x: 1400, y: 1920, w: 25, h: 60 },
        { x: 2550, y: 1920, w: 25, h: 60 },
        { x: 2000, y: 1000, w: 60, h: 25 },
        { x: 2000, y: 2900, w: 60, h: 25 }
    ],
    trees: [
        { x: 300, y: 400, r: 35 }, { x: 450, y: 1200, r: 40 }, { x: 250, y: 2500, r: 30 },
        { x: 1200, y: 300, r: 45 }, { x: 1500, y: 800, r: 30 }, { x: 1100, y: 1500, r: 40 },
        { x: 2800, y: 350, r: 35 }, { x: 2500, y: 1000, r: 45 }, { x: 2700, y: 1600, r: 30 },
        { x: 3500, y: 450, r: 40 }, { x: 3700, y: 1200, r: 35 }, { x: 3600, y: 2600, r: 35 },
        { x: 1300, y: 2800, r: 40 }, { x: 1600, y: 3400, r: 30 }, { x: 1000, y: 3600, r: 45 },
        { x: 2500, y: 2800, r: 35 }, { x: 2800, y: 3400, r: 40 }, { x: 2600, y: 3700, r: 30 },
        { x: 1500, y: 2200, r: 40 }, { x: 2500, y: 2200, r: 35 }
    ],
    dirtPaths: [
        { x1: 200, y1: 2000, x2: 3800, y2: 2000 },
        { x1: 2000, y1: 200, x2: 2000, y2: 3800 }
    ]
};

// 3. AI Difficulty Config
const DIFFICULTY_CONFIG = {
    easy: {
        reactionTime: 700,
        spreadFactor: 2.2,
        speed: 2.2,
        patrolChance: 0.015
    },
    medium: {
        reactionTime: 400,
        spreadFactor: 1.2,
        speed: 2.9,
        patrolChance: 0.025
    },
    hard: {
        reactionTime: 200,
        spreadFactor: 0.45,
        speed: 3.6,
        patrolChance: 0.035
    }
};

// 4. Game State
let gameState = {
    active: false,
    mode: 'points',
    map: 'standard',
    difficulty: 'easy',
    scoreGreen: 0,
    scoreRed: 0,
    timer: 120,
    timerInterval: null,
    entities: [],
    bullets: [],
    player: null,
    specIndex: 0,
    specMode: false,
    playerKills: 0,
    playerDeaths: 0
};

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Keyboard inputs
const keys = {};

// Gamepad State
const gamepadState = {
    dx: 0,
    dy: 0,
    aimX: 0,
    aimY: 0,
    aimActive: false,
    sprint: false,
    shoot: false,
    reload: false,
    refill: false,
    weaponIndex: -1,
    prevWeaponCyclePressed: false
};

const menuGamepadState = {
    prevAPressed: false,
    prevDpadLeft: false,
    prevDpadRight: false,
    prevDpadUp: false,
    prevDpadDown: false
};

window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad conectado:", e.gamepad.id);
    const statusEl = document.getElementById("gamepad-status");
    if (statusEl) {
        statusEl.textContent = "Conectado (" + e.gamepad.id.split(" (")[0] + ")";
        statusEl.style.color = "#00e676";
    }
});

window.addEventListener("gamepaddisconnected", (e) => {
    console.log("Gamepad desconectado:", e.gamepad.id);
    const statusEl = document.getElementById("gamepad-status");
    if (statusEl) {
        statusEl.textContent = "Nenhum";
        statusEl.style.color = "#ff9100";
    }
});

function updateGamepadState() {
    gamepadState.dx = 0;
    gamepadState.dy = 0;
    gamepadState.aimActive = false;
    gamepadState.sprint = false;
    gamepadState.shoot = false;
    gamepadState.reload = false;
    gamepadState.refill = false;
    gamepadState.weaponIndex = -1;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gp = gamepads[i];
            break;
        }
    }

    const statusEl = document.getElementById("gamepad-status");
    if (statusEl) {
        if (gp) {
            statusEl.textContent = "Conectado (" + gp.id.split(" (")[0] + ")";
            statusEl.style.color = "#00e676";
        } else {
            statusEl.textContent = "Nenhum";
            statusEl.style.color = "#ff9100";
        }
    }

    if (!gp) return;

    const deadzone = 0.15;
    
    // Left stick (Move)
    const lx = gp.axes[0];
    const ly = gp.axes[1];
    if (Math.abs(lx) > deadzone || Math.abs(ly) > deadzone) {
        gamepadState.dx = lx;
        gamepadState.dy = ly;
    }

    // Right stick (Aim)
    const rx = gp.axes[2];
    const ry = gp.axes[3];
    if (Math.hypot(rx, ry) > 0.25) {
        gamepadState.aimX = rx;
        gamepadState.aimY = ry;
        gamepadState.aimActive = true;
    }

    // Sprint: L1 (4), L2 (6), L3 (10)
    if ((gp.buttons[4] && gp.buttons[4].pressed) || 
        (gp.buttons[6] && gp.buttons[6].pressed) || 
        (gp.buttons[10] && gp.buttons[10].pressed)) {
        gamepadState.sprint = true;
    }

    // Shoot: R1 (5), R2 (7)
    if ((gp.buttons[5] && gp.buttons[5].pressed) || 
        (gp.buttons[7] && gp.buttons[7].pressed)) {
        gamepadState.shoot = true;
    }

    // Reload: X/Square (2)
    if (gp.buttons[2] && gp.buttons[2].pressed) {
        gamepadState.reload = true;
    }

    // Refill: B/Circle (1)
    if (gp.buttons[1] && gp.buttons[1].pressed) {
        gamepadState.refill = true;
    }

    // Quick weapon select: D-pad Left (14) -> 1, D-pad Up (12) -> 2, D-pad Right (15) -> 3
    if (gp.buttons[14] && gp.buttons[14].pressed) {
        gamepadState.weaponIndex = 0;
    } else if (gp.buttons[12] && gp.buttons[12].pressed) {
        gamepadState.weaponIndex = 1;
    } else if (gp.buttons[15] && gp.buttons[15].pressed) {
        gamepadState.weaponIndex = 2;
    }

    // Cycle weapons: Y/Triangle (3)
    if (gp.buttons[3] && gp.buttons[3].pressed) {
        if (!gamepadState.prevWeaponCyclePressed) {
            if (gameState.player) {
                gameState.player.currentWeaponIndex = (gameState.player.currentWeaponIndex + 1) % gameState.player.weaponInventory.length;
                updateHUD();
            }
            gamepadState.prevWeaponCyclePressed = true;
        }
    } else {
        gamepadState.prevWeaponCyclePressed = false;
    }
}

function processMenuGamepadInput() {
    const menuOpen = document.getElementById("main-menu")?.classList.contains("active");
    if (!menuOpen) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gp = gamepads[i];
            break;
        }
    }
    if (!gp) return;

    const aPressed = gp.buttons[0] && gp.buttons[0].pressed;
    const dpadLeft = gp.buttons[14] && gp.buttons[14].pressed;
    const dpadRight = gp.buttons[15] && gp.buttons[15].pressed;
    const dpadUp = gp.buttons[12] && gp.buttons[12].pressed;
    const dpadDown = gp.buttons[13] && gp.buttons[13].pressed;

    const tabs = Array.from(document.querySelectorAll(".tab-btn"));
    const activeIndex = tabs.findIndex(btn => btn.classList.contains("active"));

    if (dpadLeft && !menuGamepadState.prevDpadLeft) {
        if (activeIndex > 0) {
            tabs[activeIndex - 1].click();
        }
    }
    if (dpadRight && !menuGamepadState.prevDpadRight) {
        if (activeIndex < tabs.length - 1) {
            tabs[activeIndex + 1].click();
        }
    }
    if (dpadUp && !menuGamepadState.prevDpadUp) {
        if (activeIndex > 0) {
            tabs[activeIndex - 1].click();
        }
    }
    if (dpadDown && !menuGamepadState.prevDpadDown) {
        if (activeIndex < tabs.length - 1) {
            tabs[activeIndex + 1].click();
        }
    }

    if (aPressed && !menuGamepadState.prevAPressed) {
        const selectedTab = tabs[activeIndex]?.getAttribute("data-tab");
        if (selectedTab === "tab-play") {
            document.getElementById("btn-play").click();
        }
    }

    menuGamepadState.prevAPressed = !!aPressed;
    menuGamepadState.prevDpadLeft = !!dpadLeft;
    menuGamepadState.prevDpadRight = !!dpadRight;
    menuGamepadState.prevDpadUp = !!dpadUp;
    menuGamepadState.prevDpadDown = !!dpadDown;
}

// Viewport Camera
const camera = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    target: null
};

// Joysticks & Refill
let touchStartPos = null;
let joystickActive = false;
let joystickVector = { x: 0, y: 0 };
let mobileFirePressed = false;
let mobileRefillPressed = false;
let playerRefillTimer = 0; // ms progress

// 5. Entity Class
class Entity {
    constructor(x, y, team, name, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.team = team;
        this.name = name;
        this.isPlayer = isPlayer;
        
        this.angle = 0;
        this.speed = 3.2;
        
        // Weapons
        if (this.isPlayer) {
            const pWep = WEAPONS[userProfile.equippedPrimary] || WEAPONS.RIFLE;
            const sWep = WEAPONS[userProfile.equippedSecondary] || WEAPONS.PISTOL;
            const mWep = WEAPONS[userProfile.equippedMelee] || WEAPONS.KNIFE;
            this.weaponInventory = [pWep, sWep, mWep];
        } else {
            this.weaponInventory = [WEAPONS.RIFLE, WEAPONS.PISTOL, WEAPONS.KNIFE];
        }
        this.currentWeaponIndex = 0;
        
        this.ammo = {};
        this.vestMags = {};
        for (let key in WEAPONS) {
            const wep = WEAPONS[key];
            this.ammo[wep.name] = { mag: wep.capacity, reserve: Infinity };
            this.vestMags[wep.name] = 2;
        }

        this.reloading = false;
        this.reloadTimer = 0;
        this.shootCooldown = 0;
        
        this.state = 'alive';
        this.handRaisedAnim = 0;
        
        this.targetEntity = null;
        this.aiReactionTimer = 0;
        this.lastSeenTime = 0;
        this.patrolTarget = null;
        this.aiBurstCount = 0;
        this.aiBurstTimer = 0;
        
        this.respawnTarget = null;
    }

    get weapon() {
        return this.weaponInventory[this.currentWeaponIndex];
    }

    update(difficultySettings) {
        if (this.shootCooldown > 0) this.shootCooldown -= 16.67;
        if (this.reloading) {
            this.reloadTimer -= 16.67;
            if (this.reloadTimer <= 0) {
                this.completeReload();
            }
        }

        if (this.state === 'hit') {
            this.walkToReferee();
            return;
        } else if (this.state === 'dead') {
            return;
        }

        if (this.isPlayer) {
            this.handlePlayerMovement();
        } else {
            this.handleAIMovement(difficultySettings);
        }
    }

    startReload() {
        if (this.reloading) return;

        // If weapon uses magazines
        if (this.weapon.capacity !== Infinity) {
            const needsReload = this.ammo[this.weapon.name].mag < this.weapon.capacity;
            if (!needsReload) return;

            const hasVestMags = this.vestMags[this.weapon.name] > 0;
            if (!hasVestMags) {
                if (this.isPlayer) {
                    updateHUDStatus("SEM CARTUCHOS! SEGURE [T]");
                }
                return;
            }
        }
        
        this.reloading = true;
        this.reloadTimer = this.weapon.reloadTime;
        if (this.isPlayer) {
            updateHUDStatus("TROCANDO CARTUCHO...");
        }
    }

    completeReload() {
        this.reloading = false;
        
        if (this.weapon.capacity !== Infinity) {
            // Spend vest mag
            this.vestMags[this.weapon.name]--;
            // Full reload
            this.ammo[this.weapon.name].mag = this.weapon.capacity;
        }

        if (this.isPlayer) {
            updateHUDStatus("PRONTO");
            updateHUD();
        }
    }

    shoot() {
        if (this.state !== 'alive' || this.reloading || this.shootCooldown > 0 || this.isSprinting) return;

        const ammoInfo = this.ammo[this.weapon.name];
        if (ammoInfo.mag <= 0) {
            if (this.isPlayer) {
                updateHUDStatus("CARTUCHO VAZIO! Aperte [R]");
            } else {
                this.startReload();
            }
            return;
        }

        if (this.weapon.isMelee) {
            this.performMeleeAttack();
            return;
        }

        if (this.weapon.isShotgun) {
            ammoInfo.mag--;
            this.shootCooldown = this.weapon.fireRate;
            const bulletX = this.x + Math.cos(this.angle) * (this.radius + 15);
            const bulletY = this.y + Math.sin(this.angle) * (this.radius + 15);
            
            for (let i = 0; i < 5; i++) {
                const spreadVal = (Math.random() - 0.5) * this.weapon.spread * (this.isPlayer ? 1 : DIFFICULTY_CONFIG[gameState.difficulty].spreadFactor);
                const finalAngle = this.angle + spreadVal;
                
                gameState.bullets.push({
                    x: bulletX,
                    y: bulletY,
                    vx: Math.cos(finalAngle) * this.weapon.bulletSpeed,
                    vy: Math.sin(finalAngle) * this.weapon.bulletSpeed,
                    owner: this,
                    rangeLeft: this.weapon.range
                });
            }
            if (this.isPlayer) {
                updateHUD();
            }
            return;
        }

        ammoInfo.mag--;
        this.shootCooldown = this.weapon.fireRate;

        const spreadVal = (Math.random() - 0.5) * this.weapon.spread * (this.isPlayer ? 1 : DIFFICULTY_CONFIG[gameState.difficulty].spreadFactor);
        const finalAngle = this.angle + spreadVal;
        
        const bulletX = this.x + Math.cos(this.angle) * (this.radius + 15);
        const bulletY = this.y + Math.sin(this.angle) * (this.radius + 15);

        gameState.bullets.push({
            x: bulletX,
            y: bulletY,
            vx: Math.cos(finalAngle) * this.weapon.bulletSpeed,
            vy: Math.sin(finalAngle) * this.weapon.bulletSpeed,
            owner: this,
            rangeLeft: this.weapon.range
        });

        if (this.isPlayer) {
            updateHUD();
        }
    }

    performMeleeAttack() {
        this.shootCooldown = this.weapon.fireRate;
        const reach = this.weapon.range;
        const attackAngle = this.angle;
        
        gameState.entities.forEach(ent => {
            if (ent === this || ent.state !== 'alive' || ent.team === this.team) return;

            const dist = Math.hypot(ent.x - this.x, ent.y - this.y);
            if (dist <= reach + ent.radius) {
                const angleToTarget = Math.atan2(ent.y - this.y, ent.x - this.x);
                let diff = Math.abs(angleToTarget - attackAngle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                if (diff < Math.PI / 3) {
                    ent.registerHit();
                }
            }
        });
    }

    registerHit() {
        if (this.state !== 'alive') return;
        this.state = 'hit';
        this.handRaisedAnim = 1.0;

        if (this.isPlayer) {
            gameState.playerDeaths++;
            updateHUDStatus("ATRAVESSADO! Volte para a base!");
        }

        if (gameState.mode === 'elimination') {
            this.state = 'dead';
            this.x = greenBase.x + greenBase.w/2;
            this.y = greenBase.y + greenBase.h/2;
            if (this.team === 'red') {
                this.x = redBase.x + redBase.w/2;
                this.y = redBase.y + redBase.h/2;
            }
            
            if (this.team === 'green') gameState.scoreRed++;
            else gameState.scoreGreen++;

            if (this.isPlayer) {
                activateSpectator();
            }
            checkRoundEnd();
        } else {
            // Points Mode: Respawn at Base Ref
            this.respawnTarget = { 
                x: (this.team === 'green' ? greenBase.x + greenBase.w/2 : redBase.x + redBase.w/2), 
                y: (this.team === 'green' ? greenBase.y + greenBase.h/2 : redBase.y + redBase.h/2) 
            };
            
            if (this.team === 'green') gameState.scoreRed++;
            else gameState.scoreGreen++;
            
            updateScores();
        }
    }

    walkToReferee() {
        if (!this.respawnTarget) return;

        const dx = this.respawnTarget.x - this.x;
        const dy = this.respawnTarget.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 40) {
            this.state = 'alive';
            this.respawnTarget = null;
            this.vestMags = {
                "Fuzil M4A1": 2,
                "Pistola G18": 2
            };
            this.ammo["Fuzil M4A1"].mag = 20;
            this.ammo["Pistola G18"].mag = 15;
            if (this.isPlayer) {
                updateHUDStatus("DE VOLTA AO COMBATE!");
                updateHUD();
            }
        } else {
            let stepX = (dx / dist) * 3.5; // Noclip
            let stepY = (dy / dist) * 3.5;

            this.x += stepX;
            this.y += stepY;
            this.angle = Math.atan2(dy, dx);
        }
    }

    handlePlayerMovement() {
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        if (joystickActive) {
            dx = joystickVector.x;
            dy = joystickVector.y;
        }

        if (gamepadState.dx !== 0 || gamepadState.dy !== 0) {
            dx = gamepadState.dx;
            dy = gamepadState.dy;
        }

        const wantsSprint = keys['Shift'] || keys['shift'] || gamepadState.sprint;
        const isMoving = dx !== 0 || dy !== 0;
        this.isSprinting = wantsSprint && isMoving && !this.reloading;

        if (dx !== 0 || dy !== 0) {
            const length = Math.hypot(dx, dy);
            const speedMult = this.reloading ? 0.45 : (this.isSprinting ? 1.55 : 1.0);
            const moveX = (dx / length) * this.speed * speedMult;
            const moveY = (dy / length) * this.speed * speedMult;

            if (!checkMovementObstacle(this.x + moveX, this.y, this.radius)) {
                this.x += moveX;
            }
            if (!checkMovementObstacle(this.x, this.y + moveY, this.radius)) {
                this.y += moveY;
            }
        }

        if (gamepadState.aimActive) {
            this.angle = Math.atan2(gamepadState.aimY, gamepadState.aimX);
        } else if (!joystickActive) {
            const mouseWorldX = keys.mouseX + camera.x;
            const mouseWorldY = keys.mouseY + camera.y;
            this.angle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
        } else if (dx !== 0 || dy !== 0) {
            this.angle = Math.atan2(dy, dx);
        }

        if (keys['r'] || keys['R'] || gamepadState.reload) {
            this.startReload();
        }

        if (gamepadState.weaponIndex !== -1) {
            this.currentWeaponIndex = gamepadState.weaponIndex;
            updateHUD();
        }

        if (keys.mouseDown || mobileFirePressed || gamepadState.shoot) {
            this.shoot();
        }
    }

    handleAIMovement(difficultySettings) {
        let visibleEnemy = null;
        let minDist = 999999;

        gameState.entities.forEach(ent => {
            if (ent === this || ent.state !== 'alive' || ent.team === this.team) return;

            const dist = Math.hypot(ent.x - this.x, ent.y - this.y);
            if (dist < this.weapon.range) {
                if (checkLineOfSight(this.x, this.y, ent.x, ent.y)) {
                    if (dist < minDist) {
                        minDist = dist;
                        visibleEnemy = ent;
                    }
                }
            }
        });

        if (visibleEnemy) {
            this.isSprinting = false;
            const targetAngle = Math.atan2(visibleEnemy.y - this.y, visibleEnemy.x - this.x);
            let angleDiff = targetAngle - this.angle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            this.angle += angleDiff * 0.18;

            if (this.targetEntity !== visibleEnemy) {
                this.targetEntity = visibleEnemy;
                this.aiReactionTimer = difficultySettings.reactionTime;
            }

            if (this.aiReactionTimer > 0) {
                this.aiReactionTimer -= 16.67;
            } else {
                if (this.aiBurstTimer > 0) {
                    this.aiBurstTimer -= 16.67;
                } else {
                    this.shoot();
                    this.aiBurstCount++;
                    if (this.aiBurstCount >= this.weapon.burstSize) {
                        this.aiBurstCount = 0;
                        this.aiBurstTimer = this.weapon.burstDelay;
                    }
                }
            }
        } else {
            this.targetEntity = null;

            // Simple reload for AI when they are safe
            if (this.ammo[this.weapon.name].mag <= 5 && this.vestMags[this.weapon.name] > 0 && !this.reloading) {
                this.startReload();
            } else if (this.vestMags[this.weapon.name] === 0 && !this.reloading) {
                // AI refills vest mags dynamically when out
                this.vestMags[this.weapon.name] = 2;
            }

            if (!this.patrolTarget || Math.hypot(this.patrolTarget.x - this.x, this.patrolTarget.y - this.y) < 60) {
                if (Math.random() < difficultySettings.patrolChance) {
                    this.patrolTarget = {
                        x: 150 + Math.random() * (currentMapSize - 300),
                        y: 150 + Math.random() * (currentMapSize - 300)
                    };
                }
            }

            if (this.patrolTarget) {
                const dx = this.patrolTarget.x - this.x;
                const dy = this.patrolTarget.y - this.y;
                const dist = Math.hypot(dx, dy);

                // AI sprints at start of round or if target is far and no enemies
                const isStartOfRound = (gameState.mode === 'points' ? gameState.timer > 110 : gameState.timer > 230);
                this.isSprinting = (isStartOfRound || dist > 400) && !this.reloading;

                const baseSpeed = difficultySettings.speed;
                const speedMult = this.reloading ? 0.45 : (this.isSprinting ? 1.55 : 1.0);
                const stepX = (dx / dist) * baseSpeed * speedMult;
                const stepY = (dy / dist) * baseSpeed * speedMult;

                let moved = false;
                if (!checkMovementObstacle(this.x + stepX, this.y, this.radius)) {
                    this.x += stepX;
                    moved = true;
                }
                if (!checkMovementObstacle(this.x, this.y + stepY, this.radius)) {
                    this.y += stepY;
                    moved = true;
                }

                if (moved) {
                    this.angle = Math.atan2(dy, dx);
                } else {
                    this.patrolTarget = null;
                }
            } else {
                this.isSprinting = false;
            }
        }
    }
}

// 6. Obstacle & LOS Checks
function checkMovementObstacle(x, y, radius) {
    if (checkWallCollision(x, y, radius)) return true;

    for (let win of windows) {
        const closestX = Math.max(win.x, Math.min(x, win.x + win.w));
        const closestY = Math.max(win.y, Math.min(y, win.y + win.h));
        const dist = Math.hypot(x - closestX, y - closestY);
        if (dist < radius) return true;
    }

    for (let tree of trees) {
        const dist = Math.hypot(x - tree.x, y - tree.y);
        if (dist < radius + tree.r) return true;
    }

    return false;
}

function checkWallCollision(x, y, radius) {
    for (let wall of walls) {
        const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
        const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
        
        const dist = Math.hypot(x - closestX, y - closestY);
        if (dist < radius) return true;
    }
    return false;
}

function checkLineOfSight(x1, y1, x2, y2) {
    for (let wall of walls) {
        if (lineIntersectsRect(x1, y1, x2, y2, wall)) return false;
    }
    for (let tree of trees) {
        if (lineIntersectsCircle(x1, y1, x2, y2, tree)) return false;
    }
    return true;
}

function lineIntersectsCircle(x1, y1, x2, y2, circle) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return false;

    const u = ((circle.x - x1) * dx + (circle.y - y1) * dy) / (len * len);
    if (u < 0 || u > 1) {
        const d1 = Math.hypot(circle.x - x1, circle.y - y1);
        const d2 = Math.hypot(circle.x - x2, circle.y - y2);
        return d1 < circle.r || d2 < circle.r;
    }
    
    const cx = x1 + u * dx;
    const cy = y1 + u * dy;
    return Math.hypot(circle.x - cx, circle.y - cy) < circle.r;
}

function lineIntersectsRect(x1, y1, x2, y2, rect) {
    return lineIntersectsLine(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.w, rect.y) ||
           lineIntersectsLine(x1, y1, x2, y2, rect.x, rect.y, rect.x, rect.y + rect.h) ||
           lineIntersectsLine(x1, y1, x2, y2, rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h) ||
           lineIntersectsLine(x1, y1, x2, y2, rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h);
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// 7. Raycasting vision for Fog of War
function getPlayerVisibilityPolygon() {
    if (!gameState.player) return null;
    
    const p = gameState.player;
    const px = p.x;
    const py = p.y;
    
    const personalRadius = 110;
    const fovWidth = 115 * (Math.PI / 180);
    const startAngle = p.angle - fovWidth / 2;
    const fovDepth = 750;
    
    const fovPoints = [];
    const rayCount = 120;
    
    for (let i = 0; i <= rayCount; i++) {
        const angle = startAngle + (fovWidth * i) / rayCount;
        const targetX = px + Math.cos(angle) * fovDepth;
        const targetY = py + Math.sin(angle) * fovDepth;
        
        const pt = castRay(px, py, targetX, targetY);
        fovPoints.push(pt);
    }
    
    const circlePoints = [];
    const radialCount = 48;
    for (let i = 0; i < radialCount; i++) {
        const angle = (i * Math.PI * 2) / radialCount;
        const targetX = px + Math.cos(angle) * personalRadius;
        const targetY = py + Math.sin(angle) * personalRadius;
        
        const pt = castRay(px, py, targetX, targetY);
        circlePoints.push(pt);
    }
    
    return { fovPoints, circlePoints };
}

function castRay(x1, y1, x2, y2) {
    let closestFraction = 1.0;
    
    for (let wall of walls) {
        const fraction = getLineIntersectionWithRectFraction(x1, y1, x2, y2, wall);
        if (fraction !== null && fraction < closestFraction) {
            closestFraction = fraction;
        }
    }

    for (let tree of trees) {
        const fraction = getLineIntersectionWithCircleFraction(x1, y1, x2, y2, tree);
        if (fraction !== null && fraction < closestFraction) {
            closestFraction = fraction;
        }
    }
    
    return {
        x: x1 + (x2 - x1) * closestFraction,
        y: y1 + (y2 - y1) * closestFraction
    };
}

function getLineIntersectionWithCircleFraction(x1, y1, x2, y2, circle) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const A = dx * dx + dy * dy;
    const B = 2 * (dx * (x1 - circle.x) + dy * (y1 - circle.y));
    const C = (x1 - circle.x) * (x1 - circle.x) + (y1 - circle.y) * (y1 - circle.y) - circle.r * circle.r;
    
    const det = B * B - 4 * A * C;
    if (det < 0) return null;
    
    const t1 = (-B - Math.sqrt(det)) / (2 * A);
    const t2 = (-B + Math.sqrt(det)) / (2 * A);
    
    const validFractions = [];
    if (t1 >= 0 && t1 <= 1) validFractions.push(t1);
    if (t2 >= 0 && t2 <= 1) validFractions.push(t2);
    
    if (validFractions.length === 0) return null;
    return Math.min(...validFractions);
}

function getLineIntersectionWithRectFraction(x1, y1, x2, y2, rect) {
    let minFraction = null;
    const edges = [
        { x3: rect.x, y3: rect.y, x4: rect.x + rect.w, y4: rect.y },
        { x3: rect.x, y3: rect.y, x4: rect.x, y4: rect.y + rect.h },
        { x3: rect.x + rect.w, y3: rect.y, x4: rect.x + rect.w, y4: rect.y + rect.h },
        { x3: rect.x, y3: rect.y + rect.h, x4: rect.x + rect.w, y4: rect.y + rect.h }
    ];
    
    for (let edge of edges) {
        const fraction = getLineIntersectionFraction(x1, y1, x2, y2, edge.x3, edge.y3, edge.x4, edge.y4);
        if (fraction !== null) {
            if (minFraction === null || fraction < minFraction) {
                minFraction = fraction;
            }
        }
    }
    return minFraction;
}

function getLineIntersectionFraction(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return null;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return ua;
    }
    return null;
}

function isPointInPolygon(px, py, polygon) {
    let collision = false;
    for (let i = 0; i < polygon.length; i++) {
        const next = (i + 1) % polygon.length;
        const vc = polygon[i];
        const vn = polygon[next];
        
        if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
            (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
            collision = !collision;
        }
    }
    return collision;
}

function loadMapConfig(mapType) {
    const config = mapType === 'giant' ? MAP_GIANT : MAP_STANDARD;
    currentMapSize = config.size;
    greenBase = config.greenBase;
    redBase = config.redBase;
    walls = config.walls;
    windows = config.windows;
    trees = config.trees;
    dirtPaths = config.dirtPaths;
}

// 8. Game Initialization
function initGame() {
    pauseThemeMusic();
    gameState.active = true;
    gameState.scoreGreen = 0;
    gameState.scoreRed = 0;
    gameState.bullets = [];
    gameState.entities = [];
    gameState.specMode = false;
    gameState.playerKills = 0;
    gameState.playerDeaths = 0;
    playerRefillTimer = 0;

    loadMapConfig(gameState.map);
    
    gameState.timer = gameState.mode === 'points' ? 120 : 240; 
    
    const friendlyCount = gameState.map === 'giant' ? 10 : 5;
    const enemyCount = gameState.map === 'giant' ? 10 : 5;

    const namesA = ["Player", "Viper", "Ghost", "Phoenix", "Sledge", "Sabre", "Buster", "Hunter", "Stryker", "Odin"];
    const namesB = ["Sombra", "Bones", "Stalker", "Reaper", "Phantom", "Wraith", "Spectre", "Banshee", "Ghoul", "Lich"];
    
    const player = new Entity(greenBase.x + greenBase.w/2, greenBase.y + greenBase.h/2, 'green', namesA[0], true);
    gameState.player = player;
    gameState.entities.push(player);
    
    for (let i = 1; i < friendlyCount; i++) {
        gameState.entities.push(new Entity(greenBase.x + 30 + (i % 2) * 40, greenBase.y + 20 + Math.floor(i / 2) * 35, 'green', namesA[i]));
    }
    
    for (let i = 0; i < enemyCount; i++) {
        gameState.entities.push(new Entity(redBase.x + redBase.w - 30 - (i % 2) * 40, redBase.y + 20 + Math.floor(i / 2) * 35, 'red', namesB[i]));
    }

    camera.target = player;
    
    document.getElementById("main-menu").classList.remove("active");
    document.getElementById("game-over-screen").classList.remove("active");
    document.getElementById("spectator-ui").classList.add("hidden");
    
    updateScores();
    updateHUD();
    
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        if (gameState.active) {
            gameState.timer--;
            if (gameState.timer <= 0) {
                endGame();
            }
            updateTimerDisplay();
        }
    }, 1000);
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const min = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
    const sec = (gameState.timer % 60).toString().padStart(2, '0');
    document.getElementById("match-timer").textContent = `${min}:${sec}`;
}

function updateScores() {
    document.getElementById("score-friendly").textContent = gameState.scoreGreen;
    document.getElementById("score-enemy").textContent = gameState.scoreRed;
}

function updateHUD() {
    if (!gameState.player) return;
    
    const p = gameState.player;
    document.getElementById("hud-weapon-name").textContent = p.weapon.name;
    
    const ammoInfo = p.ammo[p.weapon.name];
    if (p.weapon.capacity === Infinity) {
        document.getElementById("hud-ammo-mag").textContent = "--";
        document.getElementById("hud-ammo-cap").textContent = "--";
        document.getElementById("hud-reload-prompt").classList.add("hidden");
        document.getElementById("hud-refill-prompt").classList.add("hidden");
        document.getElementById("hud-vest-mags").classList.add("hidden");
    } else {
        document.getElementById("hud-vest-mags").classList.remove("hidden");
        document.getElementById("hud-ammo-mag").textContent = ammoInfo.mag;
        document.getElementById("hud-ammo-cap").textContent = p.weapon.capacity;
        
        // Update Tactical Vest Magazine Icons (Slots)
        const magsOnVest = p.vestMags[p.weapon.name];
        for (let i = 0; i < 2; i++) {
            const slot = document.getElementById(`mag-slot-${i}`);
            if (slot) {
                if (i < magsOnVest) {
                    slot.classList.add("active");
                } else {
                    slot.classList.remove("active");
                }
            }
        }

        // Prompts logic
        if (ammoInfo.mag <= 5 && magsOnVest > 0 && !p.reloading) {
            document.getElementById("hud-reload-prompt").classList.remove("hidden");
            document.getElementById("hud-refill-prompt").classList.add("hidden");
        } else if (magsOnVest === 0 && ammoInfo.mag <= 5) {
            document.getElementById("hud-reload-prompt").classList.add("hidden");
            document.getElementById("hud-refill-prompt").classList.remove("hidden");
        } else {
            document.getElementById("hud-reload-prompt").classList.add("hidden");
            document.getElementById("hud-refill-prompt").classList.add("hidden");
        }
    }
}

function updateHUDStatus(msg) {
    document.getElementById("hud-status-msg").textContent = msg;
}

// Spectator
function activateSpectator() {
    gameState.specMode = true;
    document.getElementById("spectator-ui").classList.remove("hidden");
    findNextSpecTarget();
}

function findNextSpecTarget() {
    const aliveTeam = gameState.entities.filter(ent => ent.team === 'green' && ent.state === 'alive');
    if (aliveTeam.length > 0) {
        gameState.specIndex = (gameState.specIndex + 1) % aliveTeam.length;
        const target = aliveTeam[gameState.specIndex];
        camera.target = target;
        document.getElementById("spec-target-name").textContent = target.name;
        document.getElementById("spec-target-weapon").textContent = target.weapon.name;
    } else {
        checkRoundEnd();
    }
}

function findPrevSpecTarget() {
    const aliveTeam = gameState.entities.filter(ent => ent.team === 'green' && ent.state === 'alive');
    if (aliveTeam.length > 0) {
        gameState.specIndex = (gameState.specIndex - 1 + aliveTeam.length) % aliveTeam.length;
        const target = aliveTeam[gameState.specIndex];
        camera.target = target;
        document.getElementById("spec-target-name").textContent = target.name;
        document.getElementById("spec-target-weapon").textContent = target.weapon.name;
    }
}

function skipRound() {
    const greenAlive = gameState.entities.filter(ent => ent.team === 'green' && ent.state === 'alive').length;
    const redAlive = gameState.entities.filter(ent => ent.team === 'red' && ent.state === 'alive').length;

    if (greenAlive > redAlive) {
        gameState.scoreGreen += 5;
        endGame("O Time Verde venceu pulando a etapa!");
    } else if (redAlive > greenAlive) {
        gameState.scoreRed += 5;
        endGame("O Time Vermelho venceu pulando a etapa!");
    } else {
        endGame("A rodada terminou empatada!");
    }
}

function checkRoundEnd() {
    if (gameState.mode !== 'elimination') return;

    const greenAlive = gameState.entities.filter(ent => ent.team === 'green' && ent.state === 'alive').length;
    const redAlive = gameState.entities.filter(ent => ent.team === 'red' && ent.state === 'alive').length;

    if (greenAlive === 0) {
        endGame("Time Vermelho eliminou todos!");
    } else if (redAlive === 0) {
        endGame("Time Verde eliminou todos!");
    }
}

function endGame(reason = "Tempo Esgotado!") {
    gameState.active = false;
    clearInterval(gameState.timerInterval);
    
    document.getElementById("game-container").classList.remove("skibidi-active");
    document.getElementById("game-over-screen").classList.add("active");
    
    let title = "EMPATE";
    let coinsGained = 0;
    let rpChange = 0;
    
    if (gameState.scoreGreen > gameState.scoreRed) {
        title = "VIT�RIA";
        document.getElementById("go-reason").textContent = reason || "O Time Verde ganhou!";
        coinsGained = 50;
        rpChange = 25;
    } else if (gameState.scoreRed > gameState.scoreGreen) {
        title = "DERROTA";
        document.getElementById("go-reason").textContent = reason || "O Time Vermelho ganhou!";
        rpChange = -15;
    } else {
        document.getElementById("go-reason").textContent = "Os times empataram no final.";
        rpChange = 5;
    }
    
    if (!adminModeActive) {
        userProfile.coins += coinsGained;
        userProfile.rankPoints = Math.max(0, userProfile.rankPoints + rpChange);
    }
    saveProfile();
    
    document.getElementById("go-title").textContent = title;
    document.getElementById("go-final-score").textContent = `${gameState.scoreGreen} - ${gameState.scoreRed}`;
    document.getElementById("go-player-kills").textContent = gameState.playerKills;
    document.getElementById("go-player-deaths").textContent = gameState.playerDeaths;
}

// 10. Core Loop & Rendering
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function gameLoop() {
    updateGamepadState();
    if (!gameState.active) {
        processMenuGamepadInput();
    }
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (!gameState.active) return;
    
    updateGamepadState();
    const difficultySettings = DIFFICULTY_CONFIG[gameState.difficulty];

    // Refill Magazine Minigame logic
    if (gameState.player && gameState.player.state === 'alive') {
        const p = gameState.player;
        const wantsRefill = keys['t'] || keys['T'] || mobileRefillPressed || gamepadState.refill;

        const isMoving = keys['w'] || keys['W'] || keys['s'] || keys['S'] || keys['a'] || keys['A'] || keys['d'] || keys['D'] || joystickActive || gamepadState.dx !== 0 || gamepadState.dy !== 0;
        const hasEmptySlots = p.vestMags[p.weapon.name] < 2;

        if (wantsRefill && hasEmptySlots && !isMoving && p.weapon.capacity !== Infinity && !p.reloading) {
            document.getElementById("minigame-container").classList.remove("hidden");
            playerRefillTimer += 16.67;

            const pct = Math.min(100, (playerRefillTimer / 3000) * 100);
            document.getElementById("minigame-progress").style.width = `${pct}%`;
            updateHUDStatus("ABASTECENDO BALAS NO CARTUCHO...");

            if (playerRefillTimer >= 3000) {
                p.vestMags[p.weapon.name]++;
                playerRefillTimer = 0;
                updateHUDStatus("CARTUCHO DO COLETE CHEIO!");
                updateHUD();
            }
        } else {
            document.getElementById("minigame-container").classList.add("hidden");
            playerRefillTimer = 0;
        }
    }

    gameState.entities.forEach(ent => {
        ent.update(difficultySettings);
    });

    // Update Projectiles
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx * 0.016;
        b.y += b.vy * 0.016;
        b.rangeLeft -= Math.hypot(b.vx * 0.016, b.vy * 0.016);

        if (checkWallCollision(b.x, b.y, 4)) {
            gameState.bullets.splice(i, 1);
            continue;
        }
        let hitTree = false;
        for (let tree of trees) {
            if (Math.hypot(b.x - tree.x, b.y - tree.y) < tree.r) {
                hitTree = true;
                break;
            }
        }
        if (hitTree) {
            gameState.bullets.splice(i, 1);
            continue;
        }

        if (b.rangeLeft <= 0) {
            gameState.bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        for (let ent of gameState.entities) {
            if (ent === b.owner || ent.state !== 'alive') continue;

            const dist = Math.hypot(ent.x - b.x, ent.y - b.y);
            if (dist < ent.radius) {
                ent.registerHit();
                
                if (b.owner.isPlayer) {
                    gameState.playerKills++;
                }

                hit = true;
                break;
            }
        }

        if (hit) {
            gameState.bullets.splice(i, 1);
        }
    }

    if (camera.target) {
        camera.x = camera.target.x - canvas.width / 2;
        camera.y = camera.target.y - canvas.height / 2;
        
        camera.x = Math.max(0, Math.min(camera.x, currentMapSize - canvas.width));
        camera.y = Math.max(0, Math.min(camera.y, currentMapSize - canvas.height));
    }
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Forest Ground
    ctx.fillStyle = "#142514";
    ctx.fillRect(0, 0, currentMapSize, currentMapSize);

    // Paths
    ctx.strokeStyle = "#273f1d";
    ctx.lineWidth = 4;
    dirtPaths.forEach(p => {
        ctx.beginPath();
        ctx.strokeStyle = "#41321d";
        ctx.lineWidth = 60;
        ctx.lineCap = "round";
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
        ctx.stroke();
    });

    // Grid Floor
    ctx.strokeStyle = "rgba(43, 85, 43, 0.15)";
    ctx.lineWidth = 1;
    const gridSpacing = 80;
    for (let x = 0; x < currentMapSize; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, currentMapSize);
        ctx.stroke();
    }
    for (let y = 0; y < currentMapSize; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(currentMapSize, y);
        ctx.stroke();
    }

    // Spawn bases
    ctx.fillStyle = "rgba(0, 230, 118, 0.08)";
    ctx.fillRect(greenBase.x, greenBase.y, greenBase.w, greenBase.h);
    ctx.strokeStyle = "rgba(0, 230, 118, 0.3)";
    ctx.strokeRect(greenBase.x, greenBase.y, greenBase.w, greenBase.h);

    ctx.fillStyle = "rgba(255, 23, 68, 0.08)";
    ctx.fillRect(redBase.x, redBase.y, redBase.w, redBase.h);
    ctx.strokeStyle = "rgba(255, 23, 68, 0.3)";
    ctx.strokeRect(redBase.x, redBase.y, redBase.w, redBase.h);

    // Referees
    ctx.fillStyle = "#ffea00";
    ctx.fillRect(greenBase.x + greenBase.w/2 - 15, greenBase.y + greenBase.h/2 - 15, 30, 30);
    ctx.strokeRect(greenBase.x + greenBase.w/2 - 15, greenBase.y + greenBase.h/2 - 15, 30, 30);
    
    ctx.fillRect(redBase.x + redBase.w/2 - 15, redBase.y + redBase.h/2 - 15, 30, 30);
    ctx.strokeRect(redBase.x + redBase.w/2 - 15, redBase.y + redBase.h/2 - 15, 30, 30);

    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("REF", greenBase.x + greenBase.w/2, greenBase.y + greenBase.h/2 + 5);
    ctx.fillText("REF", redBase.x + redBase.w/2, redBase.y + redBase.h/2 + 5);

    // Visibility
    const visPoly = getPlayerVisibilityPolygon();

    // Wooden Walls
    walls.forEach(wall => {
        if (wall.type === 'wood') {
            ctx.fillStyle = "#5c4033";
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.strokeStyle = "#3e2723";
            ctx.lineWidth = 1;
            if (wall.w > wall.h) {
                for (let ly = wall.y + 4; ly < wall.y + wall.h; ly += 6) {
                    ctx.beginPath();
                    ctx.moveTo(wall.x, ly);
                    ctx.lineTo(wall.x + wall.w, ly);
                    ctx.stroke();
                }
            } else {
                for (let lx = wall.x + 4; lx < wall.x + wall.w; lx += 6) {
                    ctx.beginPath();
                    ctx.moveTo(lx, wall.y);
                    ctx.lineTo(lx, wall.y + wall.h);
                    ctx.stroke();
                }
            }
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        } else {
            ctx.fillStyle = "#37474f";
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        }
    });

    // Windows
    windows.forEach(win => {
        ctx.fillStyle = "#d7ccc8";
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.strokeStyle = "#5c4033";
        ctx.lineWidth = 2;
        ctx.strokeRect(win.x, win.y, win.w, win.h);

        ctx.strokeStyle = "#81d4fa";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (win.w > win.h) {
            ctx.moveTo(win.x, win.y + win.h/2);
            ctx.lineTo(win.x + win.w, win.y + win.h/2);
        } else {
            ctx.moveTo(win.x + win.w/2, win.y);
            ctx.lineTo(win.x + win.w/2, win.y + win.h);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    });

    // Trees
    trees.forEach(tree => {
        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "#271510";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "rgba(46, 125, 50, 0.6)";
        ctx.beginPath();
        ctx.arc(tree.x, tree.y, tree.r + 20, 0, Math.PI*2);
        ctx.fill();
    });

    // Projectiles
    gameState.bullets.forEach(b => {
        const isVisible = !visPoly || isPointInPolygon(b.x, b.y, visPoly.fovPoints) || isPointInPolygon(b.x, b.y, visPoly.circlePoints);
        if (isVisible) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Entities
    gameState.entities.forEach(ent => {
        const isEnemy = ent.team === 'red';
        const isVisible = !isEnemy || !visPoly || isPointInPolygon(ent.x, ent.y, visPoly.fovPoints) || isPointInPolygon(ent.x, ent.y, visPoly.circlePoints);

        if (isVisible) {
            ctx.save();
            ctx.translate(ent.x, ent.y);
            ctx.rotate(ent.angle);

            // Grip Hand Positions
            let leftHand = { x: 0, y: 0 };
            let rightHand = { x: 0, y: 0 };
            let drawWeaponFunc = null;

            if (ent.weapon.name === "Fuzil M4A1") {
                leftHand = { x: 26, y: -9 };
                rightHand = { x: 12, y: 7 };
                drawWeaponFunc = () => {
                    ctx.fillStyle = "#263238";
                    ctx.fillRect(8, -4, 25, 8);
                    ctx.fillRect(33, -3, 20, 6);
                    ctx.fillStyle = "#37474f";
                    ctx.fillRect(53, -2, 22, 4);
                    ctx.fillStyle = "#f58220";
                    ctx.fillRect(6, 4, 5, 8);
                };
            } else if (ent.weapon.name === "Pistola G18") {
                leftHand = { x: 17, y: -7 };
                rightHand = { x: 15, y: 6 };
                drawWeaponFunc = () => {
                    ctx.fillStyle = "#212121";
                    ctx.fillRect(12, -3, 14, 6);
                    ctx.fillRect(15, 3, 3, 5);
                };
            } else {
                leftHand = { x: 24, y: -12 };
                rightHand = { x: -8, y: 10 };
                drawWeaponFunc = () => {
                    ctx.fillStyle = "#90a4ae";
                    ctx.beginPath();
                    ctx.moveTo(15, -12);
                    ctx.lineTo(34, -13);
                    ctx.lineTo(32, -9);
                    ctx.lineTo(15, -9);
                    ctx.fill();
                    ctx.fillStyle = "#5d4037";
                    ctx.fillRect(8, -12, 7, 5);
                };
            }

            if (ent.state === 'hit') {
                ctx.fillStyle = "#ffea00";
                ctx.beginPath();
                ctx.arc(-10, -22, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Body
            ctx.fillStyle = ent.team === 'green' ? '#4caf50' : '#e53935';
            if (ent.state === 'hit') {
                ctx.fillStyle = "rgba(120, 130, 140, 0.4)";
            }
            
            ctx.beginPath();
            ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#1a251a";
            ctx.stroke();

            // Vest details
            ctx.fillStyle = "#2e7d32";
            if (isEnemy) ctx.fillStyle = "#c62828";
            ctx.fillRect(-10, -8, 12, 16);

            // Render Weapon
            if (ent.state === 'alive' && drawWeaponFunc) {
                drawWeaponFunc();
            }

            // 2 hands
            if (ent.state === 'alive') {
                ctx.fillStyle = "#d7ccc8";
                ctx.strokeStyle = "#3e2723";
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(leftHand.x, leftHand.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(rightHand.x, rightHand.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            ctx.restore();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Outfit";
            ctx.textAlign = "center";
            const statusLabel = ent.state === 'hit' ? " (OUT)" : "";
            ctx.fillText(ent.name + statusLabel, ent.x, ent.y - ent.radius - 10);
        }
    });

    ctx.restore();

    if (gameState.active && !gameState.specMode) {
        renderFogOfWar(visPoly);
    }
}

function renderFogOfWar(visPoly) {
    if (!visPoly) return;
    
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const mctx = maskCanvas.getContext("2d");
    
    mctx.fillStyle = "rgba(4, 9, 6, 0.93)";
    mctx.fillRect(0, 0, canvas.width, canvas.height);
    
    mctx.save();
    mctx.translate(-camera.x, -camera.y);
    mctx.globalCompositeOperation = 'destination-out';
    mctx.fillStyle = "#fff";
    
    // Draw personal circle
    mctx.beginPath();
    mctx.moveTo(gameState.player.x, gameState.player.y);
    visPoly.circlePoints.forEach(pt => mctx.lineTo(pt.x, pt.y));
    mctx.closePath();
    mctx.fill();

    // Draw FOV cone
    mctx.beginPath();
    mctx.moveTo(gameState.player.x, gameState.player.y);
    visPoly.fovPoints.forEach(pt => mctx.lineTo(pt.x, pt.y));
    mctx.closePath();
    mctx.fill();
    
    mctx.restore();
    
    ctx.drawImage(maskCanvas, 0, 0);
}

// 11. Event Listeners & Inputs
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (gameState.player && gameState.player.state === 'alive') {
        if (e.key === '1') {
            gameState.player.currentWeaponIndex = 0;
            updateHUD();
        } else if (e.key === '2') {
            gameState.player.currentWeaponIndex = 1;
            updateHUD();
        } else if (e.key === '3') {
            gameState.player.currentWeaponIndex = 2;
            updateHUD();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    keys.mouseX = e.clientX - rect.left;
    keys.mouseY = e.clientY - rect.top;
});

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) keys.mouseDown = true;
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) keys.mouseDown = false;
});

// Mobile joysticks
const joystickBase = document.getElementById("joystick-base");
const joystickHandle = document.getElementById("joystick-handle");

joystickBase.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = joystickBase.getBoundingClientRect();
    touchStartPos = {
        x: touch.clientX,
        y: touch.clientY,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2
    };
    joystickActive = true;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (!joystickActive || !touchStartPos) return;
    
    const touch = Array.from(e.touches).find(t => t.identifier === e.touches[0].identifier);
    if (!touch) return;
    
    const dx = touch.clientX - touchStartPos.centerX;
    const dy = touch.clientY - touchStartPos.centerY;
    const dist = Math.hypot(dx, dy);
    
    const maxRadius = 40;
    let finalX = dx;
    let finalY = dy;
    
    if (dist > maxRadius) {
        finalX = (dx / dist) * maxRadius;
        finalY = (dy / dist) * maxRadius;
    }
    
    joystickHandle.style.transform = `translate(${finalX}px, ${finalY}px)`;
    joystickVector = {
        x: finalX / maxRadius,
        y: finalY / maxRadius
    };
}, { passive: true });

window.addEventListener('touchend', () => {
    if (!joystickActive) return;
    joystickActive = false;
    joystickHandle.style.transform = `translate(0px, 0px)`;
    joystickVector = { x: 0, y: 0 };
});

document.getElementById("btn-mobile-reload").addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState.player) gameState.player.startReload();
});

document.getElementById("btn-mobile-swap").addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState.player) {
        gameState.player.currentWeaponIndex = (gameState.player.currentWeaponIndex + 1) % gameState.player.weaponInventory.length;
        updateHUD();
    }
});

// Mobile Refill Button T
const refillBtn = document.getElementById("btn-mobile-refill");
refillBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileRefillPressed = true;
});
refillBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileRefillPressed = false;
});

const shootBtn = document.getElementById("btn-mobile-shoot");
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileFirePressed = true;
});
shootBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileFirePressed = false;
});

// COD Menu Tab Switching
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetTab = btn.getAttribute("data-tab");
        tabPanes.forEach(pane => {
            if (pane.id === targetTab) {
                pane.classList.add("active");
            } else {
                pane.classList.remove("active");
            }
        });
    });
});

document.getElementById("btn-play").addEventListener('click', () => {
    const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
    gameState.mode = selectedMode;
    const selectedMap = document.querySelector('input[name="game-map"]:checked').value;
    gameState.map = selectedMap;

    initGame();
});

document.getElementById("btn-restart").addEventListener('click', () => {
    initGame();
});

document.getElementById("btn-to-menu").addEventListener('click', () => {
    document.getElementById("game-over-screen").classList.remove("active");
    document.getElementById("main-menu").classList.add("active");
    playThemeMusic();
});

const diffButtons = document.querySelectorAll("#difficulty-selector button");
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gameState.difficulty = btn.getAttribute("data-difficulty");
    });
});

const modeLabels = document.querySelectorAll("#mode-selector label");
modeLabels.forEach(lbl => {
    lbl.addEventListener('click', () => {
        modeLabels.forEach(l => l.classList.remove("active"));
        lbl.classList.add("active");
    });
});

const mapLabels = document.querySelectorAll("#map-selector label");
mapLabels.forEach(lbl => {
    lbl.addEventListener('click', () => {
        mapLabels.forEach(l => l.classList.remove("active"));
        lbl.classList.add("active");
    });
});

document.getElementById("btn-spec-prev").addEventListener('click', findPrevSpecTarget);
document.getElementById("btn-spec-next").addEventListener('click', findNextSpecTarget);
document.getElementById("btn-skip-round").addEventListener('click', skipRound);

function checkIsMobile() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) {
        document.getElementById("mobile-controls").classList.remove("hidden");
    } else {
        document.getElementById("mobile-controls").classList.add("hidden");
    }
}

// Theme Music & Operator Preview
let themeMusic = null;

function playThemeMusic() {
    if (!themeMusic) {
        themeMusic = new Audio("theme.mp3");
        themeMusic.loop = true;
        themeMusic.volume = 0.35;
    }
    themeMusic.play().catch(err => {
        console.log("Aguardando intera��o para reproduzir theme.mp3");
    });
}

function pauseThemeMusic() {
    if (themeMusic) {
        themeMusic.pause();
    }
}

// Play music on first interaction
window.addEventListener('click', () => {
    if (document.getElementById("main-menu").classList.contains("active")) {
        playThemeMusic();
    }
}, { once: true });

window.addEventListener('keydown', () => {
    if (document.getElementById("main-menu").classList.contains("active")) {
        playThemeMusic();
    }
}, { once: true });

function renderOperatorPreview() {
    const previewCanvas = document.getElementById("previewCanvas");
    if (!previewCanvas) return;
    const pctx = previewCanvas.getContext("2d");
    
    let angle = 0;
    
    function animate() {
        if (!document.getElementById("main-menu").classList.contains("active")) {
            requestAnimationFrame(animate);
            return;
        }
        
        pctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Grid background
        pctx.strokeStyle = "rgba(0, 230, 118, 0.08)";
        pctx.lineWidth = 1;
        for (let x = 0; x < previewCanvas.width; x += 20) {
            pctx.beginPath();
            pctx.moveTo(x, 0);
            pctx.lineTo(x, previewCanvas.height);
            pctx.stroke();
        }
        for (let y = 0; y < previewCanvas.height; y += 20) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            pctx.lineTo(previewCanvas.width, y);
            pctx.stroke();
        }
        
        // Radar circular lines
        pctx.strokeStyle = "rgba(0, 230, 118, 0.15)";
        pctx.beginPath();
        pctx.arc(previewCanvas.width/2, previewCanvas.height/2, 65, 0, Math.PI*2);
        pctx.stroke();
        pctx.beginPath();
        pctx.arc(previewCanvas.width/2, previewCanvas.height/2, 40, 0, Math.PI*2);
        pctx.stroke();

        pctx.save();
        pctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
        
        // Idle breathing and rotation
        angle += 0.008;
        pctx.rotate(angle);
        const scale = 1 + Math.sin(angle * 2.5) * 0.04;
        pctx.scale(scale, scale);
        
        // Green Operator circle
        pctx.fillStyle = "#4caf50";
        pctx.beginPath();
        pctx.arc(0, 0, 20, 0, Math.PI * 2);
        pctx.fill();
        pctx.strokeStyle = "#1a251a";
        pctx.lineWidth = 3;
        pctx.stroke();
        
        // Tactical vest (olive/dark green)
        pctx.fillStyle = "#2e7d32";
        pctx.fillRect(-11, -9, 13, 18);
        
        // Weapon Rifle
        pctx.fillStyle = "#263238";
        pctx.fillRect(8, -4, 25, 8); // receiver
        pctx.fillRect(33, -3, 18, 6); // barrel
        pctx.fillStyle = "#f58220";
        pctx.fillRect(6, 4, 5, 8); // orange tip
        
        // Hands
        pctx.fillStyle = "#d7ccc8";
        pctx.strokeStyle = "#3e2723";
        pctx.lineWidth = 1.5;
        
        // Left hand
        pctx.beginPath();
        pctx.arc(26, -9, 5, 0, Math.PI * 2);
        pctx.fill();
        pctx.stroke();
        
        // Right hand
        pctx.beginPath();
        pctx.arc(12, 7, 5, 0, Math.PI * 2);
        pctx.fill();
        pctx.stroke();
        
        pctx.restore();
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function populateArsenalAndShop() {
    const arsenalGrid = document.getElementById("arsenal-grid");
    const shopGrid = document.getElementById("shop-weapons-grid");
    
    if (!arsenalGrid || !shopGrid) return;
    
    arsenalGrid.innerHTML = "";
    shopGrid.innerHTML = "";
    
    const weaponsList = [
        { key: "RIFLE", name: "Fuzil M4A1", type: "Prim�ria", fireRate: "Rajadas", capacity: 20, range: 650, badgeClass: "primary" },
        { key: "PISTOL", name: "Pistola G18", type: "Secund�ria", fireRate: "Semi-Auto", capacity: 15, range: 450, badgeClass: "secondary" },
        { key: "KNIFE", name: "Faca T�tica", type: "Melee", fireRate: "Manual", capacity: "8", range: 55, badgeClass: "melee" }
    ];
    
    weaponsList.forEach(w => {
        const card = document.createElement("div");
        card.className = "wep-card equipped";
        card.innerHTML = `
            <span class="wep-slot-badge ${w.badgeClass}">${w.type}</span>
            <h4>${w.name}</h4>
            <div class="wep-subtitle">Equipamento Padr�o</div>
            <div class="wep-stats">
                <div class="wep-stat"><span>Cad�ncia:</span> <span>${w.fireRate}</span></div>
                <div class="wep-stat"><span>Capacidade:</span> <span>${w.capacity}</span></div>
                <div class="wep-stat"><span>Alcance:</span> <span>${w.range}px</span></div>
            </div>
        `;
        arsenalGrid.appendChild(card);
    });
    
    weaponsList.forEach(w => {
        const card = document.createElement("div");
        card.className = "wep-card equipped";
        card.innerHTML = `
            <span class="wep-slot-badge ${w.badgeClass}">${w.type}</span>
            <h4>${w.name}</h4>
            <div class="wep-subtitle">Dispon�vel no Arsenal</div>
            <div class="wep-stats">
                <div class="wep-stat"><span>Cad�ncia:</span> <span>${w.fireRate}</span></div>
                <div class="wep-stat"><span>Capacidade:</span> <span>${w.capacity}</span></div>
                <div class="wep-stat"><span>Alcance:</span> <span>${w.range}px</span></div>
            </div>
            <button class="shop-equip-btn active-equip">EQUIPADO</button>
        `;
        shopGrid.appendChild(card);
    });
}

checkIsMobile();
renderOperatorPreview();
populateArsenalAndShop();
gameLoop();
