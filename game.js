const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextPiece");
const nextCtx = nextCanvas.getContext("2d");

const ROWS = 14, COLS = 10, SIZE = 24;
canvas.width = COLS * SIZE;
canvas.height = ROWS * SIZE;

nextCanvas.width = 100;
nextCanvas.height = 100;

const colors = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff", "#ffa500"];
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let pieces = [
    [[1, 1, 1], [0, 1, 0]], [[1, 1], [1, 1]], [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]], [[1, 1, 1, 1]], [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];
let piece = { shape: [], x: 3, y: 0 };
let nextPiece = { shape: [], x: 0, y: 0 };
let score = 0;

function newPiece() {
    if (nextPiece.shape.length === 0) {
        nextPiece = generatePiece();
    }
    piece.shape = nextPiece.shape;
    piece.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    piece.y = 0;
    nextPiece = generatePiece();

    if (!validMove(piece.shape, piece.x, piece.y)) {
        alert("Game Over!");
        score = 0;
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
}

function generatePiece() {
    let type = Math.floor(Math.random() * pieces.length);
    let colorIndex = Math.floor(Math.random() * (colors.length - 1)) + 1;
    return {
        shape: pieces[type].map(row => row.map(cell => cell ? colorIndex : 0)),
        x: 0,
        y: 0
    };
}

function drawBoard() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
            if (board[y][x]) drawBlock(x, y, board[y][x]);
    piece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) drawBlock(piece.x + dx, piece.y + dy, value);
    }));
}

function drawBlock(x, y, color) {
    ctx.fillStyle = colors[color];
    ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
}

function validMove(shape, x, y) {
    return shape.every((row, dy) => row.every((value, dx) =>
        !value || (x + dx >= 0 && x + dx < COLS && y + dy < ROWS && !board[y + dy][x + dx])
    ));
}

function merge() {
    piece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) board[piece.y + dy][piece.x + dx] = value;
    }));
    let cleared = clearLines();
    let blockScore = 5 + piece.shape.flat().filter(v => v).length * 5;
    if (cleared >= 3) score += 650;
    else if (cleared > 0) score += 150;
    score += blockScore;
    checkWin();
    newPiece();
}

function clearLines() {
    let lines = 0;
    board = board.filter(row => {
        if (row.every(cell => cell)) {
            lines++;
            return false;
        }
        return true;
    });
    while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
    return lines;
}

function move(dir) {
    if (validMove(piece.shape, piece.x + dir, piece.y)) piece.x += dir;
}

function drop() {
    if (validMove(piece.shape, piece.x, piece.y + 1)) piece.y++;
    else merge();
}

function rotate() {
    let temp = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (validMove(temp, piece.x, piece.y)) piece.shape = temp;
}

function moveLeft() { move(-1); }
function moveRight() { move(1); }

function showScore() {
    const el = document.getElementById("score");
    if (el) el.textContent = "Score: " + score;
}

function checkWin() {
    if (score >= 15000) {
        alert("You Win!");
        if (!document.getElementById("restart")) {
            let btn = document.createElement("button");
            btn.id = "restart";
            btn.textContent = "Play Again";
            btn.style.fontSize = "20px";
            btn.onclick = () => location.reload();
            document.body.appendChild(btn);
        }
    }
}

function drawNextPiece() {
    nextCtx.fillStyle = "#000";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const gridSize = 5;
    const blockSize = nextCanvas.width / gridSize;
    const shape = nextPiece.shape;

    const offsetX = Math.floor((gridSize - shape[0].length) / 2);
    const offsetY = Math.floor((gridSize - shape.length) / 2);

    shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) drawBlockNext(dx + offsetX, dy + offsetY, value, blockSize);
    }));

    nextCtx.strokeStyle = "#fff";
    nextCtx.lineWidth = 2;
    nextCtx.strokeRect(0, 0, nextCanvas.width, nextCanvas.height);
}

function drawBlockNext(x, y, color, blockSize) {
    nextCtx.fillStyle = colors[color];
    nextCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    nextCtx.strokeStyle = "#222";
    nextCtx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Touch controls
let startX, startY;
canvas.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
});
canvas.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    let dx = t.clientX - startX;
    let dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) moveRight();
        else if (dx < -30) moveLeft();
    } else {
        if (dy > 30) drop();
        else if (dy < -30) rotate();
    }
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (e.key === "ArrowLeft" || key === "a") moveLeft();
    else if (e.key === "ArrowRight" || key === "d") moveRight();
    else if (e.key === "ArrowDown" || key === "s") drop();
    else if (e.key === "ArrowUp" || key === "w" || e.key === " ") rotate();
});

// Game loop
let lastTime = 0;
let dropInterval = 500;
let dropCounter = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        drop();
        dropCounter = 0;
    }
    drawBoard();
    drawNextPiece();
    showScore();
    requestAnimationFrame(update);
}

newPiece();
requestAnimationFrame(update);
