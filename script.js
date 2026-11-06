const canvas = document.getElementById("raceGame");
const ctx = canvas.getContext("2d");

// Configurações do Jogador
const player = {
    x: 180,
    y: 400,
    width: 40,
    height: 70,
    speed: 5,
    color: "#ff4757"
};

// Configurações dos Obstáculos (Outros carros)
let obstacles = [];
let obstacleSpeed = 4;
let spawnTimer = 0;

// Estado do Jogo
let score = 0;
let gameOver = false;
let keys = {};

// Captura de Teclado
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    // Previne o scroll da página ao usar as setas ou espaço
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Função para gerar obstáculos
function spawnObstacle() {
    const lanes =; // 3 pistas alinhadas com a estrada
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({
        x: randomLane,
        y: -70,
        width: 40,
        height: 70,
        color: "#1e90ff"
    });
}

// Resetar o jogo
function resetGame() {
    player.x = 180;
    obstacles = [];
    score = 0;
    obstacleSpeed = 4;
    gameOver = false;
    spawnTimer = 0;
}

// Desenhar elementos na tela
function draw() {
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar Estrada (Fundo cinza e grama nas laterais)
    ctx.fillStyle = "#2ed573"; // Grama esquerda
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(350, 0, 50, canvas.height); // Grama direita

    ctx.fillStyle = "#57606f"; // Asfalto
    ctx.fillRect(50, 0, 300, canvas.height);

    // Linhas divisórias da pista (pontilhadas)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]); // Cria efeito tracejado
    
    ctx.beginPath();
    ctx.moveTo(150, 0); ctx.lineTo(150, canvas.height);
    ctx.moveTo(250, 0); ctx.lineTo(250, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Resetar padrão de linha para o restante dos desenhos

    // Desenhar Jogador (Carro Vermelho)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Detalhe simples das rodas do jogador
    ctx.fillStyle = "#000000";
    ctx.fillRect(player.x - 4, player.y + 10, 4, 15);
    ctx.fillRect(player.x + player.width, player.y + 10, 4, 15);
    ctx.fillRect(player.x - 4, player.y + 45, 4, 15);
    ctx.fillRect(player.x + player.width, player.y + 45, 4, 15);

    // Desenhar Obstáculos (Carros Azuis)
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Rodas dos obstáculos
        ctx.fillStyle = "#000000";
        ctx.fillRect(obs.x - 4, obs.y + 10, 4, 15);
        ctx.fillRect(obs.x + obs.width, obs.y + 10, 4, 15);
        ctx.fillRect(obs.x - 4, obs.y + 45, 4, 15);
        ctx.fillRect(obs.x + obs.width, obs.y + 45, 4, 15);
    });

    // Desenhar Pontuação
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`Pontos: ${score}`, 65, 35);

    // Se der Game Over, desenha a tela por cima
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("FIM DE JOGO", canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = "20px Arial";
        ctx.fillText(`Pontuação Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#ff4757";
        ctx.fillText("Pressione ESPAÇO para reiniciar", canvas.width / 2, canvas.height / 2 + 70);
        ctx.textAlign = "left"; // Resetar alinhamento padrão
    }
}

// Loop principal do jogo que roda continuamente
function gameLoop() {
    if (!gameOver) {
        // Movimentação do jogador (limitado às bordas da estrada)
        if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && player.x > 55) {
            player.x -= player.speed;
        }
        if ((keys["ArrowRight"] || keys["d"] || keys["D"]) && player.x < 305) {
            player.x += player.speed;
        }

        // Gerenciar tempo de aparecimento dos obstáculos
        spawnTimer++;
        if (spawnTimer > 60) { // Diminuído para nascer um pouco mais rápido
            spawnObstacle();
            spawnTimer = 0;
        }

        // Mover obstáculos e checar colisões
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += obstacleSpeed;

            // Checar colisão (AABB box collision)
            if (
                player.x < obstacles[i].x + obstacles[i].width &&
                player.x + player.width > obstacles[i].x &&
                player.y < obstacles[i].y + obstacles[i].height &&
                player.y + player.height > obstacles[i].y
            ) {
                gameOver = true;
            }

            // Se passar do final da tela, pontua e remove o obstáculo
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                score++;
                // Aumenta a velocidade gradualmente a cada 5 pontos
                if (score % 5 === 0) obstacleSpeed += 0.5;
            }
        }
    }

    // Executa o desenho e chama o próximo quadro
    draw();
    requestAnimationFrame(gameLoop);
}

// Escuta para reiniciar com a barra de espaço
window.addEventListener("keydown", (e) => {
    if (e.key === " " && gameOver) {
        resetGame();
    }
});

// FUNÇÃO PARA MAXIMIZAR (Tela Cheia)
function toggleFullscreen() {
    const container = document.getElementById("gameContainer");
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Erro ao tentar maximizar: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Inicializa as variáveis e dá a partida no loop dinâmico
resetGame();
gameLoop();
