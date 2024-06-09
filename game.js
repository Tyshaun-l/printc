const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = ['d', 'f', 'j', 'k']; // Keys for the 4 lanes
const laneWidth = canvas.width / keys.length;
const notes = []; // Array to hold notes
const noteSpeed = 2; // Speed of the notes
const keyMap = {}; // Object to track key presses
const keyStates = {}; // Object to track key states (pressed or not)

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

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLanes();
    drawKeys();
    updateNotes();
    requestAnimationFrame(gameLoop);
}

// Draw lanes
function drawLanes() {
    ctx.strokeStyle = '#fff';
    for (let i = 0; i < keys.length; i++) {
        ctx.strokeRect(i * laneWidth, 0, laneWidth, canvas.height);
    }
}

// Draw keys
function drawKeys() {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        ctx.fillStyle = keyStates[key] ? 'green' : 'gray'; // Change color when key is pressed
        ctx.fillRect(i * laneWidth, canvas.height - 50, laneWidth, 50); // Draw key rectangles at the bottom
    }
}

// Update notes
function updateNotes() {
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        note.y += noteSpeed;

        // Draw note
        ctx.fillStyle = 'red';
        ctx.fillRect(note.lane * laneWidth, note.y, laneWidth, 20);

        // Remove notes that are off screen
        if (note.y > canvas.height) {
            notes.splice(i, 1);
            i--;
        }
    }
}

// Check for hits
function checkHit(key) {
    const laneIndex = keys.indexOf(key);
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.lane === laneIndex && note.y > canvas.height - 100 && note.y < canvas.height) {
            notes.splice(i, 1);
            hitSound.play();
            break;
        }
    }
}

// Generate notes at intervals
function generateNotes() {
    const lane = Math.floor(Math.random() * keys.length);
    notes.push({ lane, y: -20 });
    setTimeout(generateNotes, 1000); // Adjust timing as needed
}

// Start the game
generateNotes();
gameLoop();
