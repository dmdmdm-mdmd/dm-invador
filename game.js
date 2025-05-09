const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let level = 1;
let score = 0;
let hp = 3;

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 30,
  width: 40,
  height: 10,
  speed: 5,
  bullets: [],
  bulletSpeed: 7
};

let keys = {};
let enemies = [];
let enemyBullets = [];
let lastEnemyFire = 0;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function movePlayer() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;
}

function shootBullet() {
  if (keys[" "] || keys["z"] || keys["Z"]) {
    if (player.bullets.length < 5) {
      player.bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10
      });
    }
  }
}

function drawBullets() {
  ctx.fillStyle = "white";
  player.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function updateBullets() {
  player.bullets = player.bullets.filter(b => b.y > 0);
  player.bullets.forEach(b => b.y -= player.bulletSpeed);
}

function createEnemies(count) {
  enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: 50 + (i % 10) * 50,
      y: 30 + Math.floor(i / 10) * 40,
      width: 30,
      height: 20,
      dx: 1 + level * 0.2
    });
  }
}

function drawEnemies() {
  ctx.fillStyle = "red";
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
}

function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.dx;
    if (e.x <= 0 || e.x + e.width >= canvas.width) {
      e.dx *= -1;
      e.y += 10;
    }
  });
}

function drawEnemyBullets() {
  ctx.fillStyle = "yellow";
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function updateEnemyBullets() {
  enemyBullets.forEach(b => b.y += 3 + level * 0.2);
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height);
}

function enemyFire() {
  if (Date.now() - lastEnemyFire > 1000 - level * 100) {
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    if (shooter) {
      enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10
      });
    }
    lastEnemyFire = Date.now();
  }
}

function checkCollisions() {
  // player bullets vs enemies
  player.bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
        enemies.splice(ei, 1);
        player.bullets.splice(bi, 1);
        score += 10;
      }
    });
  });

  // enemy bullets vs player
  enemyBullets.forEach((b, bi) => {
    if (b.x < player.x + player.width && b.x + b.width > player.x && b.y < player.y + player.height && b.y + b.height > player.y) {
      enemyBullets.splice(bi, 1);
      hp--;
      if (hp <= 0) {
        alert("ゲームオーバー\nスコア: " + score);
        document.location.reload();
      }
    }
  });
}

function drawUI() {
  document.getElementById("level-display").textContent = `レベル: ${level}`;
  document.getElementById("score-display").textContent = `スコア: ${score}`;
  document.getElementById("hp-display").textContent = `HP: ${hp}`;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  shootBullet();
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  checkCollisions();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawEnemyBullets();
  drawUI();
  enemyFire();

  if (enemies.length === 0) {
    level++;
    player.speed += 0.5;
    player.bulletSpeed += 0.3;
    createEnemies(5 + level);
  }

  requestAnimationFrame(gameLoop);
}

createEnemies(5);
gameLoop();
