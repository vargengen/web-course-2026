const state = {
    sequence: [],           
    playerIndex: 0,        
    level: 0,              
    isShowing: false,       
    isPlayerTurn: false,   
    isGameOver: false,     
    bestScore: 0,          
    timers: [],             
};


const SYSTEMS = [
    'Двигатель',
    'Щит',
    'Связь',
    'Жизнеобеспечение',
];

const SHOW_DURATION = 500;
const SHOW_PAUSE = 250;
const START_DELAY = 600;


const boardPanel = document.querySelector('.board-panel');
const buttons = document.querySelectorAll('.btn-simon');
const startBtn = document.getElementById('start-btn');
const messageEl = document.getElementById('message');
const levelEl = document.getElementById('level');
const systemEl = document.getElementById('system');
const bestEl = document.getElementById('best');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalRestart = document.getElementById('modal-restart');


function delay(ms) {
    return new Promise(resolve => {
        const timerId = setTimeout(resolve, ms);
        state.timers.push(timerId);
    });
}


function clearAllTimers() {
    state.timers.forEach(id => clearTimeout(id));
    state.timers = [];
}


function getRandomIndex() {
    return Math.floor(Math.random() * 4);
}

function updateBestScore() {
    if (state.level > state.bestScore) {
        state.bestScore = state.level;
        localStorage.setItem('simon-best', state.bestScore);
    }
    bestEl.textContent = state.bestScore;
}

function loadBestScore() {
    const saved = localStorage.getItem('simon-best');
    state.bestScore = saved ? parseInt(saved, 10) : 0;
    bestEl.textContent = state.bestScore;
}


function flashButton(index) {
    const btn = buttons[index];
    btn.classList.add('active');

    const timerId = setTimeout(() => {
        btn.classList.remove('active');
    }, SHOW_DURATION);
    state.timers.push(timerId);
}


function showMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = 'game-message' + (type ? ' ' + type : '');
}


function shakeBoard() {
    boardPanel.classList.add('shake');
    const timerId = setTimeout(() => {
        boardPanel.classList.remove('shake');
    }, 400);
    state.timers.push(timerId);
}


function showModal(icon, title, text) {
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.remove('hidden');
}

function hideModal() {
    modal.classList.add('hidden');
}


async function showSequence() {
    state.isShowing = true;
    state.isPlayerTurn = false;
    updateButtonsDisabled(true);


    await delay(START_DELAY);

    for (let i = 0; i < state.sequence.length; i++) {
        const index = state.sequence[i];

        systemEl.textContent = SYSTEMS[index];

        flashButton(index);

        await delay(SHOW_DURATION);

        await delay(SHOW_PAUSE);
    }

    systemEl.textContent = '—';

    state.isShowing = false;
    state.isPlayerTurn = true;
    state.playerIndex = 0;
    updateButtonsDisabled(false);
    showMessage('Твой ход! Повтори сигнал.', '');
}


function handlePlayerClick(index) {
    if (!state.isPlayerTurn || state.isShowing || state.isGameOver) return;

    // Визуальный отклик
    const btn = buttons[index];
    btn.classList.add('pressed');
    const timerId = setTimeout(() => {
        btn.classList.remove('pressed');
    }, 150);
    state.timers.push(timerId);

    const expected = state.sequence[state.playerIndex];

    if (index !== expected) {

        gameOver();
        return;
    }

    state.playerIndex++;

    if (state.playerIndex === state.sequence.length) {

        state.isPlayerTurn = false;
        updateBestScore();
        showMessage(`Уровень ${state.level} пройден!`, 'success');

        const timerId = setTimeout(() => {
            nextRound();
        }, 800);
        state.timers.push(timerId);
    }
}


function nextRound() {
    state.level++;
    levelEl.textContent = state.level;

    state.sequence.push(getRandomIndex());

    showMessage('Смотри внимательно...', '');

    const timerId = setTimeout(() => {
        showSequence();
    }, 500);
    state.timers.push(timerId);
}


function gameOver() {
    state.isGameOver = true;
    state.isPlayerTurn = false;
    state.isShowing = false;

    clearAllTimers();
    updateButtonsDisabled(true);
    shakeBoard();

    startBtn.disabled = false;
    startBtn.textContent = 'Начать заново';

    showMessage('Ошибка! Корабль сломался.', 'error');

    const timerId = setTimeout(() => {
        showModal(
            '💥',
            'Корабль сломался',
            `Ты дошёл до уровня ${state.level}. Рекорд: ${state.bestScore}.`
        );
    }, 600);
    state.timers.push(timerId);
}


function startGame() {
    
    clearAllTimers();
    state.sequence = [];
    state.playerIndex = 0;
    state.level = 0;
    state.isShowing = false;
    state.isPlayerTurn = false;
    state.isGameOver = false;


    levelEl.textContent = '0';
    systemEl.textContent = '—';
    hideModal();
    updateButtonsDisabled(true);

    showMessage('Диагностика запущена...', '');
    startBtn.disabled = true;
    startBtn.textContent = 'Идёт диагностика...';

    const timerId = setTimeout(() => {
        nextRound();
    }, 800);
    state.timers.push(timerId);
}


function updateButtonsDisabled(disabled) {
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
}


buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        handlePlayerClick(index);
    });
});


startBtn.addEventListener('click', () => {
    startGame();
});


modalRestart.addEventListener('click', () => {
    hideModal();
    startGame();
});


loadBestScore();
updateButtonsDisabled(true);