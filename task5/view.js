class GameView {
    constructor(config) {
        this.config = config;
        this.cacheElements();
    }

    cacheElements() {
        this.boardPanel = document.querySelector('.board-panel');
        this.buttons = document.querySelectorAll('.btn-simon');
        this.startBtn = document.getElementById('start-btn');
        this.messageEl = document.getElementById('message');
        this.levelEl = document.getElementById('level');
        this.systemEl = document.getElementById('system');
        this.bestEl = document.getElementById('best');
        this.modal = document.getElementById('modal');
        this.modalIcon = document.getElementById('modal-icon');
        this.modalTitle = document.getElementById('modal-title');
        this.modalText = document.getElementById('modal-text');
        this.modalRestart = document.getElementById('modal-restart');
    }

    showMessage(text, type = '') {
        this.messageEl.textContent = text;
        this.messageEl.className = 'game-message' + (type ? ' ' + type : '');
    }

    updateLevel(level) {
        this.levelEl.textContent = level;
    }

    updateBestScore(score) {
        this.bestEl.textContent = score;
    }

    updateSystem(name) {
        this.systemEl.textContent = name;
    }

    flashButton(index, duration) {
        const btn = this.buttons[index];
        if (!btn) return;

        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), duration);
    }

    showPressed(index) {
        const btn = this.buttons[index];
        if (!btn) return;

        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 150);
    }

    disableButtons(disabled) {
        this.buttons.forEach(btn => {
            btn.disabled = disabled;
        });
    }

    setStartButton(text, disabled) {
        this.startBtn.textContent = text;
        this.startBtn.disabled = disabled;
    }

    shakeBoard() {
        this.boardPanel.classList.add('shake');
        setTimeout(() => this.boardPanel.classList.remove('shake'), 400);
    }

    showModal(icon, title, text) {
        this.modalIcon.textContent = icon;
        this.modalTitle.textContent = title;
        this.modalText.textContent = text;
        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }

    onButtonClick(callback) {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                callback(index);
            });
        });
    }

    onStartClick(callback) {
        this.startBtn.addEventListener('click', callback);
    }

    onModalRestartClick(callback) {
        this.modalRestart.addEventListener('click', callback);
    }
}