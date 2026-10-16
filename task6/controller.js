class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.lastMoveTime = 0;
        this.animationId = null;

        this.init();
    }

    init() {
        this.view.onRestartClick(() => this.handleRestartClick());
        this.view.onPauseClick(() => this.handlePause());

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        this.view.draw();
        this.view.showStartScreen();

        this.startGameLoop();
    }

    handleKeyDown(event) {
        const key = event.key;

        if (key === ' ' || key === 'Spacebar' || key === 'Escape') {
            event.preventDefault();
            this.handlePause();
            return;
        }

        if (!this.model.isStarted) return;

        const directions = {
            ArrowUp:    { x: 0,  y: -1 },
            ArrowDown:  { x: 0,  y: 1 },
            ArrowLeft:  { x: -1, y: 0 },
            ArrowRight: { x: 1,  y: 0 },
        };

        if (directions[key]) {
            event.preventDefault();
            const { x, y } = directions[key];
            this.model.setDirection(x, y);
        }
    }

    handlePause() {
        if (!this.model.isStarted || this.model.isGameOver) return;

        this.model.togglePause();

        if (this.model.isPaused) {
            this.view.showPause();
        } else {
            this.view.hidePause();
            this.lastMoveTime = 0;
        }
    }

    handleRestartClick() {
        if (this.model.isPaused) {
            this.handlePause();
            return;
        }

        this.restart();
    }

    gameLoop(currentTime) {
        if (this.lastMoveTime === 0) {
            this.lastMoveTime = currentTime;
        }

        const deltaTime = currentTime - this.lastMoveTime;

        const moveInterval = this.model.getMoveInterval();

        if (deltaTime >= moveInterval) {
            this.lastMoveTime = currentTime;

            const result = this.model.update();

            if (result.gameOver) {
                this.view.draw();
                this.view.showGameOver();
                return;
            }
        }

        this.view.draw();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    startGameLoop() {
        this.lastMoveTime = 0;
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    restart() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.model.reset();
        this.model.start();
        this.view.hideOverlay();
        this.view.draw();
        this.startGameLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const model = new GameModel();
    const view = new GameView(model);
    new GameController(model, view);
});