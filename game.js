const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 1200;  // Increased width
const canvasHeight = 900;  // Increased height
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let baseSpeed = 1.6;  // Initial speed
let objectSpeed = baseSpeed;  // Current speed
const objectSpawnTime = 1000;  // milliseconds
const bombSpawnTime = 5000;  // milliseconds

let score = 0;
let objects = [];
let bombs = [];
let gameOver = false;
let lastFrameTime = 0;  // To track time for smooth movement

// Preload sound effects
let sliceSound = new Audio('slice.wav');
let gameOverSound = new Audio('game_over.wav');

// Function to load images
function loadImage(src, callback) {
    const img = new Image();
    img.onload = () => callback(img);
    img.onerror = () => console.error(`Failed to load image: ${src}`);
    img.src = src;
}

const images = {};
const imageSources = {
    'coin': 'coin.png',
    'bomb': 'bomb.png',
    'background': 'background.png'
};

function preloadImages(callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(imageSources).length;

    for (const key in imageSources) {
        loadImage(imageSources[key], (img) => {
            images[key] = img;
            loadedImages++;
            if (loadedImages === totalImages) callback();
        });
    }
}

function createObject() {
    const size = 75;  // Increased size
    const x = Math.random() * (canvasWidth - size);
    const y = Math.random() * (canvasHeight - size);
    const velocity = [Math.random() > 0.5 ? objectSpeed : -objectSpeed, Math.random() > 0.5 ? objectSpeed : -objectSpeed];
    objects.push({ x, y, size, velocity });
}

function createBomb() {
    const size = 75;  // Increased size
    const x = Math.random() * (canvasWidth - size);
    const y = Math.random() * (canvasHeight - size);
    const velocity = [Math.random() > 0.5 ? objectSpeed : -objectSpeed, Math.random() > 0.5 ? objectSpeed : -objectSpeed];
    bombs.push({ x, y, size, velocity });
}

function showBlastEffect() {
    // Display blast effect (implement as needed)
}

function sliceIntersectsRect(sliceX, sliceY, obj) {
    return sliceX >= obj.x && sliceX <= obj.x + obj.size && sliceY >= obj.y && sliceY <= obj.y + obj.size;
}

function updateSpeed() {
    const newSpeed = baseSpeed + Math.floor(score / 5) * 0.4; // Increase speed every 5 points
    objectSpeed = newSpeed;
}

function update(time) {
    if (!gameOver) {
        const deltaTime = time - lastFrameTime;
        lastFrameTime = time;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (images.background) {
            ctx.drawImage(images.background, 0, 0, canvasWidth, canvasHeight);
        } else {
            console.error('Background image not loaded');
            ctx.fillStyle = 'black';  // Fallback color
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        updateSpeed();  // Update the speed based on the score

        objects.forEach((obj, index) => {
            obj.x += obj.velocity[0] * deltaTime * 0.1;  // Adjust speed with deltaTime
            obj.y += obj.velocity[1] * deltaTime * 0.1;
            if (obj.x < 0 || obj.x + obj.size > canvasWidth) obj.velocity[0] = -obj.velocity[0];
            if (obj.y < 0 || obj.y + obj.size > canvasHeight) obj.velocity[1] = -obj.velocity[1];
            if (images.coin) {
                ctx.drawImage(images.coin, obj.x, obj.y, obj.size, obj.size);
            } else {
                console.error('Coin image not loaded');
            }

            if (sliceIntersectsRect(mouseX, mouseY, obj)) {
                score++;
                objects.splice(index, 1);
                playSound(sliceSound);  // Play slicing sound when a coin is sliced
            }
        });

        bombs.forEach((bomb, index) => {
            bomb.x += bomb.velocity[0] * deltaTime * 0.1;  // Adjust speed with deltaTime
            bomb.y += bomb.velocity[1] * deltaTime * 0.1;
            if (bomb.x < 0 || bomb.x + bomb.size > canvasWidth) bomb.velocity[0] = -bomb.velocity[0];
            if (bomb.y < 0 || bomb.y + bomb.size > canvasHeight) bomb.velocity[1] = -bomb.velocity[1];
            if (images.bomb) {
                ctx.drawImage(images.bomb, bomb.x, bomb.y, bomb.size, bomb.size);
            } else {
                console.error('Bomb image not loaded');
            }

            if (sliceIntersectsRect(mouseX, mouseY, bomb)) {
                gameOver = true;
                showBlastEffect();
                playSound(gameOverSound);  // Play game over sound
                document.getElementById('game-over').style.display = 'block';
            }
        });

        ctx.fillStyle = 'black';
        ctx.font = '36px Arial';
        ctx.fillText(`IOCC: ${score}`, 10, 40);

        requestAnimationFrame(update);
    }
}

function playSound(sound) {
    sound.currentTime = 0;  // Reset sound to start
    sound.play().catch(error => console.error('Sound play error:', error));
}

function restartGame() {
    score = 0;
    objects = [];
    bombs = [];
    objectSpeed = baseSpeed;  // Reset speed to base speed
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    update(performance.now());  // Start game with current time
}

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

preloadImages(() => {
    setInterval(createObject, objectSpawnTime);
    setInterval(createBomb, bombSpawnTime);
    update(performance.now());  // Start game with current time
});
