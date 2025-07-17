const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 7;

// Paddle objects
let player = {
  y: (canvas.height - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
};

let ai = {
  y: (canvas.height - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 4
};

// Scoreboard
let playerScore = 0;
let aiScore = 0;
const playerScoreElem = document.getElementById('player1-score');
const aiScoreElem = document.getElementById('player2-score');

function updateScoreboard() {
  if (playerScoreElem) playerScoreElem.textContent = playerScore;
  if (aiScoreElem) aiScoreElem.textContent = aiScore;
}

// Ball object
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5 * (Math.random() > 0.5 ? 1 : -1),
  vy: 3 * (Math.random() > 0.5 ? 1 : -1)
};

// Mouse control
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;
  // Clamp paddle inside the canvas
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});

// Drawing functions
function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = '#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.fillStyle = '#888';
  const netWidth = 4;
  const netHeight = 24;
  for(let i = 0; i < canvas.height; i += 32) {
    ctx.fillRect((canvas.width - netWidth) / 2, i, netWidth, netHeight);
  }
}

// Game loop
function update() {
  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision (top/bottom)
  if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) {
    ball.vy = -ball.vy;
    ball.y = ball.y - BALL_RADIUS < 0 ? BALL_RADIUS : canvas.height - BALL_RADIUS;
  }

  // Left paddle collision
  if (
    ball.x - BALL_RADIUS < PLAYER_X + player.width &&
    ball.y > player.y &&
    ball.y < player.y + player.height
  ) {
    ball.vx = Math.abs(ball.vx);
    // Add some "english" based on where it hit
    let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    ball.vy = collidePoint * 5;
    ball.x = PLAYER_X + player.width + BALL_RADIUS;
  }

  // Right paddle (AI) collision
  if (
    ball.x + BALL_RADIUS > AI_X &&
    ball.y > ai.y &&
    ball.y < ai.y + ai.height
  ) {
    ball.vx = -Math.abs(ball.vx);
    let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
    ball.vy = collidePoint * 5;
    ball.x = AI_X - BALL_RADIUS;
  }

  // Score check (reset if ball goes off left or right)
  if (ball.x - BALL_RADIUS < 0) {
    // AI scores
    aiScore++;
    updateScoreboard();
    resetBall();
  } else if (ball.x + BALL_RADIUS > canvas.width) {
    // Player scores
    playerScore++;
    updateScoreboard();
    resetBall();
  }

  // AI movement (follows the ball with some speed limit)
  let aiCenter = ai.y + ai.height / 2;
  if (ball.y < aiCenter - 10) {
    ai.y -= ai.speed;
  } else if (ball.y > aiCenter + 10) {
    ai.y += ai.speed;
  }
  // Clamp AI paddle
  ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  // Randomize direction, keep speed
  ball.vx = 5 * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Net
  drawNet();
  // Paddles
  drawRect(PLAYER_X, player.y, player.width, player.height, '#0af');
  drawRect(AI_X, ai.y, ai.width, ai.height, '#fa0');
  // Ball
  drawCircle(ball.x, ball.y, BALL_RADIUS, '#fff');
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Initialize scoreboard and start game
updateScoreboard();
loop();