// 1. Configuração Inicial do Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 2. Estado do Jogo (Configurações do Jogador e Cenário)
const player = {
  x: 100,
  y: 100,
  size: 30,
  speed: 5,
  color: "#4ade80" // Verde eco brilhante combinando com o CSS
};

// Objeto para monitorar as teclas pressionadas
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// 3. Captura de Movimentos (Event Listeners)
window.addEventListener("keydown", (e) => {
  if (e.key in keys) {
    keys[e.key] = true;
    e.preventDefault(); // Evita que a página role ao usar as setas
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key in keys) {
    keys[e.key] = false;
  }
});

// 4. Lógica de Atualização (Movimento e Colisões)
function update() {
  if (keys.ArrowUp && player.y > 0) {
    player.y -= player.speed;
  }
  if (keys.ArrowDown && player.y < canvas.height - player.size) {
    player.y += player.speed;
  }
  if (keys.ArrowLeft && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight && player.x < canvas.width - player.size) {
    player.x += player.speed;
  }
}

// 5. Renderização Visual (Desenhar na tela)
function draw() {
  // Limpa o canvas a cada frame com um fundo grafite elegante
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenha uma grade de fundo sutil (estilo linhas de guia)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j < canvas.height; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }

  // Desenha o Jogador (com bordas arredondadas e sombra)
  ctx.fillStyle = player.color;
  ctx.shadowBlur = 15;
  ctx.shadowColor = player.color; // Efeito neon
  
  // Desenha um quadrado para o jogador (pode ser substituído por uma imagem depois)
  ctx.fillRect(player.x, player.y, player.size, player.size);
  
  // Reseta a sombra para não afetar outros elementos
  ctx.shadowBlur = 0;

  // Texto temporário de interface (UI)
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "16px 'Poppins', sans-serif";
  ctx.fillText(`Posição X: ${Math.round(player.x)} | Y: ${Math.round(player.y)}`, 20, 30);
}

// 6. Loop Principal do Jogo
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Inicializa o jogo
gameLoop();
