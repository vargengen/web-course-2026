const state = {
    secret: [],              
    history: [],             
    attempts: 0,             
    maxAttempts: Infinity,   
    mode: 'infinite',        
    limit: 12,               
    isGameOver: false,       
};


const form = document.getElementById('guess-form');
const input = document.getElementById('guess-input');
const message = document.getElementById('message');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const attemptsCount = document.getElementById('attempts-count');
const attemptsLeft = document.getElementById('attempts-left');
const currentMode = document.getElementById('current-mode');
const newGameBtn = document.getElementById('new-game');
const modeBtns = document.querySelectorAll('.mode-btn');
const limitSwitch = document.getElementById('limit-switch');
const limitBtns = document.querySelectorAll('.limit-btn');


function generateSecret() {
    const digits = [];
    while (digits.length < 4) {
        const digit = Math.floor(Math.random() * 10);
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }
    return digits.join('');
}


function validateInput(value) {
    if (value.length !== 4) {
        return { valid: false, error: 'Нужно ввести ровно 4 цифры' };
    }
    if (!/^\d{4}$/.test(value)) {
        return { valid: false, error: 'Можно вводить только цифры (0-9)' };
    }
    const uniqueDigits = new Set(value.split(''));
    if (uniqueDigits.size !== 4) {
        return { valid: false, error: 'Все цифры должны быть разными' };
    }
    return { valid: true };
}


function countBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }

    return { bulls, cows };
}


function renderCounters() {
    attemptsCount.textContent = state.attempts;

    if (state.mode === 'infinite') {
        attemptsLeft.textContent = '∞';
        currentMode.textContent = 'Бесконечный';
    } else {
        const left = Math.max(0, state.limit - state.attempts);
        attemptsLeft.textContent = left;
        currentMode.textContent = `Лимит ${state.limit}`;
    }
}


function renderHistory() {
    historyList.innerHTML = '';

    if (state.history.length === 0) {
        historyEmpty.classList.remove('hidden');
        return;
    } else {
        historyEmpty.classList.add('hidden');
    }

    state.history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const guessSpan = document.createElement('span');
        guessSpan.className = 'guess';
        guessSpan.textContent = item.guess;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result';

        const bullsSpan = document.createElement('span');
        bullsSpan.className = 'bulls';
        bullsSpan.textContent = `🐂 ${item.bulls}`;

        const cowsSpan = document.createElement('span');
        cowsSpan.className = 'cows';
        cowsSpan.textContent = `🐄 ${item.cows}`;

        resultSpan.append(bullsSpan, cowsSpan);
        li.append(guessSpan, resultSpan);

        // prepend → новые сверху
        historyList.prepend(li);
    });
}


function showMessage(text, type = 'info') {
    message.textContent = text;
    message.className = 'message ' + type;
}

function clearMessage() {
    message.textContent = '';
    message.className = 'message';
}


function render() {
    renderCounters();
    renderHistory();
}


function handleGuess(value) {
    const validation = validateInput(value);
    if (!validation.valid) {
        showMessage(`Не угадал, попробуй ещё раз. Загаданное число: ${state.secret}`, 'error');
        return;
    }

    const { bulls, cows } = countBullsAndCows(state.secret, value);

    state.history.push({ guess: value, bulls, cows });
    state.attempts++;

    if (bulls === 4) {
        state.isGameOver = true;
        showMessage(`Победа! Поздравляем! Угадано за ${state.attempts} ${declOfNum(state.attempts, ['попытку', 'попытки', 'попыток'])}.`, 'success');
        disableInput();
        render();
        return;
    }

    if (state.mode === 'limited' && state.attempts >= state.limit) {
        state.isGameOver = true;
        showMessage(`Не угадал, попробуй ещё раз. Загаданное число: ${state.secret.join('')}`, 'error');
        disableInput();
        render();
        return;
    }

    let remainingText = '';
    if (state.mode === 'limited') {
        const left = state.limit - state.attempts;
        remainingText = ` Осталось попыток: ${left}.`;
    }
    showMessage(`🐂 Быков: ${bulls}, 🐄 Коров: ${cows}.${remainingText}`, 'info');

    render();
}


function declOfNum(n, forms) {
    // forms = ['попытку', 'попытки', 'попыток']
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}


function disableInput() {
    input.disabled = true;
    form.querySelector('.btn-check').disabled = true;
}

function enableInput() {
    input.disabled = false;
    form.querySelector('.btn-check').disabled = false;
    input.focus();
}


function startNewGame() {
    state.secret = generateSecret();
    state.history = [];
    state.attempts = 0;
    state.isGameOver = false;

    // Определяем лимит
    if (state.mode === 'infinite') {
        state.maxAttempts = Infinity;
    } else {
        state.maxAttempts = state.limit;
    }

    input.value = '';
    enableInput();
    clearMessage();

    if (state.mode === 'infinite') {
        showMessage('♾️ Бесконечный режим. Введите 4 цифры.', 'info');
    } else {
        showMessage(`🎯 Лимит: ${state.limit} попыток. Введите 4 цифры.`, 'info');
    }

    render();
}




form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.isGameOver) return;

    const value = input.value.trim();
    handleGuess(value);
    input.value = '';
    input.focus();
});


newGameBtn.addEventListener('click', startNewGame);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;

        // Показ/скрытие выбора лимита
        if (state.mode === 'limited') {
            limitSwitch.classList.remove('hidden');
        } else {
            limitSwitch.classList.add('hidden');
        }

        startNewGame();
    });
});

limitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        limitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.limit = parseInt(btn.dataset.limit, 10);
        startNewGame();
    });
});

input.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});


startNewGame();