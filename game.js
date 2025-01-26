const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = ['d', 'f', 'j', 'k']; // Lanes
const laneWidth = canvas.width / keys.length;

let notes = [];
let score = 0;
let comboCount = 0;
let judgment = ''; // Hit judgment
let chart = [];
let startTime = 0;
let isPlaying = false;
let gamePaused = true;

const difficultyLevels = {
    easy: { noteSpeed: 3, noteInterval: 1000 },
    medium: { noteSpeed: 5, noteInterval: 700 },
    hard: { noteSpeed: 7, noteInterval: 500 },
};
let currentDifficulty = difficultyLevels.medium;

let player; // YouTube player instance

// Load YouTube video
function loadYouTubeVideo() {
    const youtubeLink = document.getElementById('youtubeLink').value;
    const videoId = youtubeLink.split('v=')[1]?.split('&')[0]; // Extract video ID
    if (!videoId) {
        alert('Invalid YouTube link');
        return;
    }

    if (!player) {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: videoId,
            events: {
                onReady: () => console.log('YouTube Player Ready'),
                onStateChange: onPlayerStateChange,
            },
        });
    } else {
        player.loadVideoById(videoId);
    }
}

// Start syncing gameplay with video
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && !isPlaying) {
        startTime = performance.now(); // Sync game start time with video playback
        isPlaying = true;
        gamePaused = false;
        gameLoop();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        gamePaused = true;
    }
}

// Record keypress for chart creation
document.addEventListener('keydown', (e) => {
    if (keys.includes(e.key) && isPlaying) {
        const lane = keys.indexOf(e.key);
        const timestamp = (performance.now() - startTime) / 1000; // Time in seconds
        chart.push({ lane, timestamp });
        console.log(`Recorded: Lane ${lane}, Time ${timestamp}s`);
    }
});

// Draw lanes
function drawLanes() {
    for (let i = 0; i < keys.length; i++) {
        ctx.fillStyle = '#444';
        ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);
    }
}

// Draw notes
function drawNotes() {
    notes.forEach(note => {
        ctx.fillStyle = 'red';
        ctx.fillRect(note.lane * laneWidth, note.y, laneWidth, 20);
    });
}

// Draw HUD
function drawHUD() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Combo: ${comboCount}`, 10, 60);
    if (judgment) {
        ctx.font = '48px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(judgment, canvas.width / 2 - 50, canvas.height / 2);
    }
}

// Sync notes with timestamps during gameplay
function updateNotes() {
    const elapsedTime = (performance.now() - startTime) / 1000; // Time in seconds
    notes = notes.filter(note => {
        if (!note.y && elapsedTime >= note.timestamp) {
            note.y = -20; // Make note visible
        }
        return note.y <= canvas.height;
    });

    notes.forEach(note => {
        note.y += currentDifficulty.noteSpeed;
    });
}

// Export Chart
function exportChart() {
    if (chart.length === 0) {
        alert('No chart data to export!');
        return;
    }

    let tomlData = '[[notes]]\n';
    chart.forEach(note => {
        tomlData += `lane = ${note.lane}, timestamp = ${note.timestamp.toFixed(2)}\n`;
    });

    const blob = new Blob([tomlData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chart.toml';
    link.click();
}

// Import Chart
function loadChart(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const tomlText = e.target.result;
        const parsedChart = parseTOML(tomlText);
        notes = parsedChart.map(note => ({
            lane: note.lane,
            y: -20,
            timestamp: note.timestamp,
        }));
    };
    reader.readAsText(file);
}

// Simple TOML parser
function parseTOML(tomlText) {
    const lines = tomlText.split('\n').filter(line => line.trim().length && !line.startsWith('#'));
    return lines.map(line => {
        const [lane, timestamp] = line.split(',').map(part => part.split('=')[1].trim());
        return { lane: parseInt(lane), timestamp: parseFloat(timestamp) };
    });
}

// Game loop
function gameLoop() {
    if (gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLanes();
    drawNotes();
    drawHUD();
    updateNotes();
    requestAnimationFrame(gameLoop);
}
