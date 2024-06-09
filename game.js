const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions based on the window size
resizeCanvas();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

const keys = ['d', 'f', 'j', 'k']; // Keys for the 4 lanes
const laneWidth = canvas.width / keys.length;
const notes = []; // Array to hold notes
const keyMap = {}; // Object to track key presses
const keyStates = {}; // Object to track key states (pressed or not)

// Game settings
let score = 0;
const difficultyLevels = {
    easy: { noteSpeed: 2, noteInterval: 1000 },
    medium: { noteSpeed: 4, noteInterval: 700 },
    hard: { noteSpeed: 6, noteInterval: 500 }
};
const currentDifficulty = difficultyLevels.medium;

// Load audio
const hitSound = new Audio('hitSound.mp3');

// Initialize keyMap and keyStates
keys.forEach(key => {
    keyMap[key] = false;
    keyStates[key] = false;
});

// Listen for key presses
document.addEventListener('keydown', (e) => {
    if (keys.includes(e.key)) {
        keyMap[e.key] = true;
        keyStates[e.key] = true;
        checkHit(e.key);
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.includes(e.key)) {
        keyMap[e.key] = false;
        setTimeout(() => {
            keyStates[e.key] = false;
        }, 100); // Reset the key state after 100ms
    }
});

// Handle touch input
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    const touch = e.touches[0];
    const laneIndex = getLaneIndex(touch.clientX);
    if (laneIndex !== -1) {
        const key = keys[laneIndex];
        keyMap[key] = true;
        keyStates[key] = true;
        checkHit(key);
    }
}

function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const laneIndex = getLane
