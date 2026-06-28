const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score-val');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const TILE_SIZE = 20;
const TILE_COUNT = canvas.width / TILE_SIZE; // 30
const GAME_SPEED = 100; // ms

// Game State
let score = 0;
let highScore = localStorage.getItem('snake-high-score') || 0;
let snake = [];
let food = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let gameLoopId = null;
let lastTime = 0;
let isGameRunning = false;
let nextVelocity = { x: 0, y: 0 }; // Buffer input to prevent self-collision on quick turns

highScoreElement.textContent = highScore;

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 15 },
        { x: 9, y: 15 },
        { x: 8, y: 15 }
    ];
    score = 0;
    velocity = { x: 1, y: 0 };
    nextVelocity = { x: 1, y: 0 };
    updateScore(0);
    spawnFood();
    isGameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Main Game Loop
function gameLoop(currentTime) {
    if (!isGameRunning) return;

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= GAME_SPEED) {
        lastTime = currentTime;
        update();
        draw();
    }

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Apply buffered input
    velocity = { ...nextVelocity };

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Check Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        updateScore(score + 10);
        spawnFood();
        // Snake grows (don't pop tail)
    } else {
        snake.pop();
    }
}

// Render game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1c1c1e'; // Match --game-bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, subtle)
    // ctx.strokeStyle = '#2c2c2e';
    // for (let i = 0; i < TILE_COUNT; i++) {
    //     ctx.beginPath();
    //     ctx.moveTo(i * TILE_SIZE, 0);
    //     ctx.lineTo(i * TILE_SIZE, canvas.height);
    //     ctx.stroke();
    //     ctx.beginPath();
    //     ctx.moveTo(0, i * TILE_SIZE);
    //     ctx.lineTo(canvas.width, i * TILE_SIZE);
    //     ctx.stroke();
    // }

    // Draw Food
    ctx.fillStyle = '#ff4757';
    ctx.shadowColor = 'rgba(255, 71, 87, 0.6)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#8990ff'; // Head
            ctx.shadowColor = 'rgba(137, 144, 255, 0.5)';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = '#646cff'; // Body
            ctx.shadowBlur = 0;
        }

        ctx.fillRect(
            segment.x * TILE_SIZE + 1,
            segment.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2
        );
    });
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        // Make sure food doesn't spawn on snake
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function updateScore(newScore) {
    score = newScore;
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snake-high-score', highScore);
    }
}

function gameOver() {
    isGameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Input Handling
document.addEventListener('keydown', (e) => {
    // Start game on any key if waiting
    if (!isGameRunning && startScreen.classList.contains('hidden') === false) {
        initGame();
        return;
    }

    if (!isGameRunning) return;
    //control commands
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (velocity.y === 0) nextVelocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (velocity.y === 0) nextVelocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (velocity.x === 0) nextVelocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (velocity.x === 0) nextVelocity = { x: 1, y: 0 };
            break;
    }
});

restartBtn.addEventListener('click', initGame);

// Initial Draw (Empty board)
draw();
