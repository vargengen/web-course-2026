class GameModel {
    constructor() {
        this.config = {
            GRID_SIZE: 20,
            CELL_SIZE: 20,
            INITIAL_LENGTH: 3,

            BASE_INTERVAL: 300,    
            MIN_INTERVAL: 80,      
            SPEED_STEP: 15,       

            STORAGE_KEY: 'snake-best',
            COLORS: {
                snakeHead: '#A78BFA',
                snakeBody: '#C4B5FD',
                snakeTail: '#DDD6FE',
                apple: '#FBCFE8',
                grid: 'rgba(167, 139, 250, 0.08)',
                background: '#0F0A2E',
            },
        };

        this.bestScore = this.loadBestScore();
        this.reset();
    }

    reset() {
        const center = Math.floor(this.config.GRID_SIZE / 2);

        this.snake = [];
        for (let i = 0; i < this.config.INITIAL_LENGTH; i++) {
            this.snake.push({ x: center - i, y: center });
        }

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        this.apple = null;
        this.spawnApple();

        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;

        this.isStarted = false;
    }

    getMoveInterval() {
        const interval = this.config.BASE_INTERVAL - this.score * this.config.SPEED_STEP;
        return Math.max(interval, this.config.MIN_INTERVAL);
    }

    getLevel() {
        return Math.floor(this.score / 5) + 1;
    }

    spawnApple() {
        const freeCells = [];

        for (let x = 0; x < this.config.GRID_SIZE; x++) {
            for (let y = 0; y < this.config.GRID_SIZE; y++) {
                if (!this.isSnakeAt(x, y)) {
                    freeCells.push({ x, y });
                }
            }
        }

        if (freeCells.length === 0) {
            this.apple = null;
            this.isGameOver = true;
            return;
        }

        const randomIndex = Math.floor(Math.random() * freeCells.length);
        this.apple = freeCells[randomIndex];
    }

    isSnakeAt(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    setDirection(dx, dy) {
        if (dx === -this.direction.x && dy === -this.direction.y) {
            return false;
        }

        this.nextDirection = { x: dx, y: dy };
        return true;
    }

    update() {
        if (!this.isStarted || this.isGameOver || this.isPaused) {
            return { moved: false, ate: false, gameOver: this.isGameOver };
        }

        this.direction = { ...this.nextDirection };

        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y,
        };

        if (
            newHead.x < 0 ||
            newHead.x >= this.config.GRID_SIZE ||
            newHead.y < 0 ||
            newHead.y >= this.config.GRID_SIZE
        ) {
            this.isGameOver = true;
            return { moved: false, ate: false, gameOver: true };
        }

        const willEat = this.apple && newHead.x === this.apple.x && newHead.y === this.apple.y;
        const bodyToCheck = willEat ? this.snake : this.snake.slice(0, -1);

        if (bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            this.isGameOver = true;
            return { moved: false, ate: false, gameOver: true };
        }

        this.snake.unshift(newHead);

        let ate = false;
        if (willEat) {
            this.score++;
            ate = true;
            this.updateBestScore();
            this.spawnApple();
        } else {
            this.snake.pop();
        }

        return { moved: true, ate, gameOver: false };
    }

    togglePause() {
        if (this.isGameOver || !this.isStarted) return;
        this.isPaused = !this.isPaused;
    }

    start() {
        this.isStarted = true;
        this.isPaused = false;
    }

    loadBestScore() {
        const saved = localStorage.getItem(this.config.STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    }

    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(this.config.STORAGE_KEY, this.bestScore);
        }
    }
}