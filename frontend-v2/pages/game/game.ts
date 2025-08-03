export function init() {
  console.log('Game page loaded');

  const canvasEl = document.getElementById('pongCanvas');
  if (!(canvasEl instanceof HTMLCanvasElement)) return;
  const canvas = canvasEl;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Game state
  let gameRunning = false;
  let player1Score = 0;
  let player2Score = 0;

  // Game objects
  const paddle = {
    width: 10,
    height: 80,
    player1Y: canvas.height / 2 - 40,
    player2Y: canvas.height / 2 - 40,
    speed: 5
  };

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 3,
    speedY: 3
  };

  // Event listeners
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  startBtn?.addEventListener('click', startGame);
  pauseBtn?.addEventListener('click', pauseGame);
  resetBtn?.addEventListener('click', resetGame);

  // Keyboard controls
  const keys: { [key: string]: boolean } = {};

  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  function startGame() {
    gameRunning = true;
    gameLoop();
  }

  function pauseGame() {
    gameRunning = false;
  }

  function resetGame() {
    gameRunning = false;
    player1Score = 0;
    player2Score = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = 3;
    ball.speedY = 3;
    paddle.player1Y = canvas.height / 2 - 40;
    paddle.player2Y = canvas.height / 2 - 40;
    updateScore();
    draw();
  }

  function updateScore() {
    const p1Score = document.getElementById('player1Score');
    const p2Score = document.getElementById('player2Score');
    if (p1Score) p1Score.textContent = player1Score.toString();
    if (p2Score) p2Score.textContent = player2Score.toString();
  }

  function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  function update() {
    // Paddle controls
    if (keys['w'] || keys['W']) {
      paddle.player1Y = Math.max(0, paddle.player1Y - paddle.speed);
    }
    if (keys['s'] || keys['S']) {
      paddle.player1Y = Math.min(canvas.height - paddle.height, paddle.player1Y + paddle.speed);
    }
    if (keys['ArrowUp']) {
      paddle.player2Y = Math.max(0, paddle.player2Y - paddle.speed);
    }
    if (keys['ArrowDown']) {
      paddle.player2Y = Math.min(canvas.height - paddle.height, paddle.player2Y + paddle.speed);
    }

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top/bottom
    if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
      ball.speedY = -ball.speedY;
    }

    // Ball collision with paddles
    // Player 1 paddle
    if (ball.x <= paddle.width + ball.radius &&
        ball.y >= paddle.player1Y &&
        ball.y <= paddle.player1Y + paddle.height) {
      ball.speedX = -ball.speedX;
    }

    // Player 2 paddle
    if (ball.x >= canvas.width - paddle.width - ball.radius &&
        ball.y >= paddle.player2Y &&
        ball.y <= paddle.player2Y + paddle.height) {
      ball.speedX = -ball.speedX;
    }

    // Scoring
    if (ball.x < 0) {
      player2Score++;
      resetBall();
    }
    if (ball.x > canvas.width) {
      player1Score++;
      resetBall();
    }

    updateScore();
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = -ball.speedX;
  }

  function draw() {
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, paddle.player1Y, paddle.width, paddle.height);
    ctx.fillRect(canvas.width - paddle.width, paddle.player2Y, paddle.width, paddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Initial draw
  draw();
}
