class GameView {
    constructor(model) {
        this.model = model;
        this.config = model.config;

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.boardSize = this.config.GRID_SIZE * this.config.CELL_SIZE;

        this.scoreEl = document.getElementById('score');
        this.bestEl = document.getElementById('best');
        this.overlay = document.getElementById('overlay');
        this.overlayIcon = document.getElementById('overlay-icon');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayText = document.getElementById('overlay-text');
        this.restartBtn = document.getElementById('restart-btn');
    }

    draw() {
        this.clear();
        this.drawGrid();
        this.drawApple();
        this.drawSnake();
        this.updateScore();
    }

    clear() {
        this.ctx.fillStyle = this.config.COLORS.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const cell = this.config.CELL_SIZE;
        this.ctx.strokeStyle = this.config.COLORS.grid;
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.config.GRID_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cell, 0);
            this.ctx.lineTo(i * cell, this.boardSize);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cell);
            this.ctx.lineTo(this.boardSize, i * cell);
            this.ctx.stroke();
        }
    }

    drawApple() {
        if (!this.model.apple) return;

        const cell = this.config.CELL_SIZE;
        const apple = this.model.apple;

        const cx = apple.x * cell + cell / 2;
        const cy = apple.y * cell + cell / 2;

        const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
        const radius = (cell / 2 - 2) * pulse;

        this.ctx.fillStyle = this.config.COLORS.apple;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.config.COLORS.apple;

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    drawSnake() {
        const cell = this.config.CELL_SIZE;
        const snake = this.model.snake;
        const total = snake.length;

        snake.forEach((segment, i) => {
            const t = i / Math.max(total - 1, 1);
            const color = this.lerpColor(
                this.config.COLORS.snakeHead,
                this.config.COLORS.snakeTail,
                t
            );

            const padding = i === 0 ? 1 : 2;   // голова чуть больше
            const x = segment.x * cell + padding;
            const y = segment.y * cell + padding;
            const size = cell - padding * 2;

            this.ctx.fillStyle = color;

            if (i === 0) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.config.COLORS.snakeHead;
            }

            this.roundRect(x, y, size, size, 5);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
        });
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : { r: 0, g: 0, b: 0 };
    }

    updateScore() {
        this.scoreEl.textContent = this.model.score;
        this.bestEl.textContent = this.model.bestScore;
    }

    showGameOver() {
        this.overlayTitle.textContent = 'Игра окончена';
        this.overlayText.textContent = `Твой счёт: ${this.model.score}. Рекорд: ${this.model.bestScore}.`;
        this.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.overlay.classList.add('hidden');
    }

    onRestartClick(callback) {
        this.restartBtn.addEventListener('click', callback);
    }
}