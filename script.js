// ==========================
// UTILITÁRIOS
// ==========================
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function AABB(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ==========================
// PARTÍCULAS
// ==========================
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.life = 30;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 3, 3);
  }
}

// ==========================
// PLAYER
// ==========================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;

    this.vx = 0;
    this.vy = 0;

    this.speed = 0.6;
    this.baseSpeed = 0.6;

    this.gravity = 0.6;
    this.friction = 0.85;

    this.jumpPower = -10;
    this.canJump = false;
    this.jumpCount = 0;

    this.wallJumpDir = 0;

    this.dashCooldown = 0;
    this.onGround = false;

    this.combo = 0;
    this.comboTimer = 0;

    this.water = 0;
  }

  update(input, platforms) {
    // peso do balde
    this.speed = this.baseSpeed * (this.water >= 50 ? 0.8 : 1);

    // movimento horizontal
    if (input.left) this.vx -= this.speed;
    if (input.right) this.vx += this.speed;

    // gravidade
    this.vy += this.gravity;

    // dash
    if (input.dash && this.dashCooldown <= 0) {
      this.vx = input.lastDir * 8;
      this.vy = 0;
      this.dashCooldown = 25;
    }

    if (this.dashCooldown > 0) this.dashCooldown--;

    // pulo duplo
    if (input.jumpPressed) {
      if (this.onGround || this.jumpCount < 2) {
        this.vy = this.jumpPower;
        this.jumpCount++;
      }
    }

    // física
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.friction;

    this.onGround = false;

    // colisões
    for (let p of platforms) {
      if (AABB(this, p)) {
        // chão
        if (this.vy > 0 && this.y < p.y) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.jumpCount = 0;

          // reset combo ao tocar chão
          this.combo = 0;
        }

        // parede simples
        if (this.x < p.x) {
          this.x = p.x - this.w;
        } else if (this.x > p.x) {
          this.x = p.x + p.w;
        }

        // óleo (fricção reduzida)
        if (p.type === "oil") {
          this.friction = 0.95;
        } else {
          this.friction = 0.85;
        }
      }
    }

    // combo decay
    if (this.comboTimer > 0) this.comboTimer--;
    else this.combo = 0;
  }

  draw(ctx) {
    // squash & stretch
    let stretchY = this.vy < 0 ? 1.2 : this.onGround ? 0.8 : 1;

    ctx.fillStyle = "#7c4dff";
    ctx.fillRect(
      this.x,
      this.y,
      this.w,
      this.h * stretchY
    );
  }
}

// ==========================
// ENEMY
// ==========================
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 26;
    this.h = 26;
    this.vx = 2;
    this.vy = 0;
    this.alive = true;
  }

  update(platforms) {
    this.vy += 0.5;
    this.x += this.vx;
    this.y += this.vy;

    for (let p of platforms) {
      if (AABB(this, p)) {
        this.vy = 0;
        this.y = p.y - this.h;
      }
    }

    if (this.x < 0 || this.x > 800) this.vx *= -1;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.fillStyle = "#00c853";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

// ==========================
// PLATAFORMA
// ==========================
class Platform {
  constructor(x, y, w, h, type = "normal") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
  }

  draw(ctx) {
    ctx.fillStyle =
      this.type === "oil" ? "#3b2f2f" :
      this.type === "switch" ? "#ffd54f" :
      this.type === "goal" ? "#4fc3f7" :
      "#2e7d32";

    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

// ==========================
// GAME
// ==========================
class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    this.player = new Player(50, 400);

    this.platforms = [
      new Platform(0, 580, 800, 20),
      new Platform(200, 450, 120, 15),
      new Platform(400, 380, 120, 15, "oil"),
      new Platform(600, 320, 120, 15),
      new Platform(750, 250, 40, 300, "goal")
    ];

    this.enemies = [
      new Enemy(250, 300)
    ];

    this.particles = [];

    this.input = {
      left: false,
      right: false,
      jumpPressed: false,
      dash: false,
      lastDir: 1
    };

    this.setupInput();
    this.loop();
  }

  setupInput() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft") this.input.left = true;
      if (e.code === "ArrowRight") this.input.right = true;
      if (e.code === "Space") this.input.jumpPressed = true;
      if (e.code === "KeyX") this.input.dash = true;
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft") this.input.left = false;
      if (e.code === "ArrowRight") this.input.right = false;
      if (e.code === "Space") this.input.jumpPressed = false;
      if (e.code === "KeyX") this.input.dash = false;
    });
  }

  spawnParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    this.player.update(this.input, this.platforms);

    for (let e of this.enemies) {
      e.update(this.platforms);

      // bottom bounce
      if (AABB(this.player, e) && this.player.vy > 0) {
        e.alive = false;
        this.player.vy = -8;
        this.player.combo += 5;
        this.spawnParticles(e.x, e.y, "#00e676");
      }
    }

    // partículas
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => p.update());

    // direção
    if (this.input.left) this.input.lastDir = -1;
    if (this.input.right) this.input.lastDir = 1;
  }

  draw() {
    this.ctx.clearRect(0, 0, 800, 600);

    for (let p of this.platforms) p.draw(this.ctx);
    for (let e of this.enemies) e.draw(this.ctx);

    this.player.draw(this.ctx);

    for (let p of this.particles) p.draw(this.ctx);

    // UI combo
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Combo: " + this.player.combo, 20, 20);
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

// ==========================
// START
// ==========================
new Game();
