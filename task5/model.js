class GameModel {
    constructor() {
        this.config = {
            SYSTEMS: [
                'Двигатель',
                'Щит',
                'Связь',
                'Жизнеобеспечение',
            ],
            TIMINGS: {
                SHOW_DURATION: 500,
                SHOW_PAUSE: 250,
                START_DELAY: 600,
                NEXT_ROUND_DELAY: 800,
                GAME_OVER_DELAY: 600,
            },
            STORAGE_KEY: 'simon-best',
        };

        this.buttonCount = this.config.SYSTEMS.length;

        this.reset();
        this.bestScore = this.loadBestScore();
    }

    reset() {
        this.sequence = [];       // последовательность индексов
        this.playerIndex = 0;     // текущий индекс игрока
        this.level = 0;           // текущий уровень
        this.isGameOver = false;  // флаг окончания игры
    }

    getRandomIndex() {
        return Math.floor(Math.random() * this.buttonCount);
    }

    addStep() {
        this.sequence.push(this.getRandomIndex());
        this.level++;
    }

    checkPlayerMove(index) {
        const expected = this.sequence[this.playerIndex];
        const correct = index === expected;

        if (!correct) {
            this.isGameOver = true;
            return { correct: false, isRoundComplete: false };
        }

        this.playerIndex++;
        const isRoundComplete = this.playerIndex === this.sequence.length;

        return { correct: true, isRoundComplete };
    }

 
    startNewRound() {
        this.playerIndex = 0;
    }

    getSequenceLength() {
        return this.sequence.length;
    }

    loadBestScore() {
        const saved = localStorage.getItem(this.config.STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    }

    updateBestScore() {
        if (this.level > this.bestScore) {
            this.bestScore = this.level;
            localStorage.setItem(this.config.STORAGE_KEY, this.bestScore);
            return true;
        }
        return false;
    }
}