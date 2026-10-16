class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.config = model.config;

        // Служебные флаги (НЕ состояние игры)
        this.isShowing = false;
        this.isPlayerTurn = false;
        this.timers = [];

        this.init();
    }

    init() {
        this.view.onButtonClick(index => this.handlePlayerClick(index));
        this.view.onStartClick(() => this.startGame());
        this.view.onModalRestartClick(() => this.handleModalClose());

        this.view.updateBestScore(this.model.bestScore);
        this.view.disableButtons(true);
        this.view.showMessage('Нажми «Начать починку», чтобы запустить диагностику');
    }

    delay(ms) {
        return new Promise(resolve => {
            const id = setTimeout(resolve, ms);
            this.timers.push(id);
        });
    }

    clearAllTimers() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
    }

    startGame() {
        this.clearAllTimers();
        this.model.reset();

        this.isShowing = false;
        this.isPlayerTurn = false;

        this.view.updateLevel(0);
        this.view.updateSystem('—');
        this.view.hideModal();
        this.view.disableButtons(true);
        this.view.setStartButton('🚀 Идёт диагностика...', true);
        this.view.showMessage('Диагностика запущена...');

        const id = setTimeout(
            () => this.nextRound(),
            this.config.TIMINGS.START_DELAY
        );
        this.timers.push(id);
    }

    nextRound() {
        this.model.addStep();
        this.model.startNewRound();

        this.view.updateLevel(this.model.level);
        this.view.showMessage('Смотри внимательно...');

        const id = setTimeout(
            () => this.showSequence(),
            this.config.TIMINGS.NEXT_ROUND_DELAY
        );
        this.timers.push(id);
    }

    async showSequence() {
        this.isShowing = true;
        this.isPlayerTurn = false;
        this.view.disableButtons(true);

        await this.delay(this.config.TIMINGS.START_DELAY);

        for (let i = 0; i < this.model.getSequenceLength(); i++) {
            const index = this.model.sequence[i];

            this.view.updateSystem(this.config.SYSTEMS[index]);
            this.view.flashButton(index, this.config.TIMINGS.SHOW_DURATION);

            await this.delay(this.config.TIMINGS.SHOW_DURATION);
            await this.delay(this.config.TIMINGS.SHOW_PAUSE);
        }

        this.view.updateSystem('—');
        this.isShowing = false;
        this.isPlayerTurn = true;
        this.view.disableButtons(false);
        this.view.showMessage('Твой ход! Повтори сигнал.');
    }

    handlePlayerClick(index) {
        // Проверяем: сейчас ход игрока?
        if (!this.isPlayerTurn || this.isShowing || this.model.isGameOver) {
            return;
        }

        this.view.showPressed(index);

        const result = this.model.checkPlayerMove(index);

        if (!result.correct) {
            this.gameOver();
            return;
        }

        if (result.isRoundComplete) {
            this.isPlayerTurn = false;
            const isNewRecord = this.model.updateBestScore();

            if (isNewRecord) {
                this.view.updateBestScore(this.model.bestScore);
            }

            this.view.showMessage(
                `Уровень ${this.model.level} пройден!`,
                'success'
            );

            const id = setTimeout(
                () => this.nextRound(),
                this.config.TIMINGS.NEXT_ROUND_DELAY
            );
            this.timers.push(id);
        }
    }

    gameOver() {
        this.model.isGameOver = true;
        this.isPlayerTurn = false;
        this.isShowing = false;

        this.clearAllTimers();
        this.view.disableButtons(true);
        this.view.shakeBoard();
        this.view.setStartButton('Начать заново', true);
        this.view.showMessage('Ошибка! Корабль сломался.', 'error');

        const id = setTimeout(() => {
            this.view.showModal(
                '💥',
                'Корабль сломался',
                `Ты дошёл до уровня ${this.model.level}. Рекорд: ${this.model.bestScore}.`
            );
        }, this.config.TIMINGS.GAME_OVER_DELAY);
        this.timers.push(id);
    }

    handleModalClose() {
        this.view.hideModal();
        this.view.setStartButton('Начать заново', false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const model = new GameModel();
    const view = new GameView(model.config);
    new GameController(model, view);
});