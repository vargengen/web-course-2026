
let tasks = [];              
let currentFilter = 'all';   
let nextId = 1;             


// DOM-элементы
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('empty-message');

// Функции

function addTask(text) {
    tasks.push({
        id: nextId++,
        text: text,
        completed: false
    });
}


function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
}


function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );
}


function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    }
    if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    return tasks; // 'all'
}


function render() {
    const filtered = getFilteredTasks();

    // Очищаем список
    list.innerHTML = '';

    // Рисуем каждую задачу
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }

        // Чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            toggleTask(task.id);
            render();
        });

        // Текст
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        // Кнопка удаления
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.textContent = '✕';
        delBtn.title = 'Удалить задачу';
        delBtn.addEventListener('click', () => {
            deleteTask(task.id);
            render();
        });

        // Собираем карточку
        li.append(checkbox, span, delBtn);
        list.appendChild(li);
    });

    // Пустое сообщение
    if (filtered.length === 0) {
        emptyMessage.classList.add('visible');
    } else {
        emptyMessage.classList.remove('visible');
    }

    // Обновляем счётчик (по всем задачам)
    const active = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}


//обработка событий

// Добавление задачи
form.addEventListener('submit', (event) => {
    event.preventDefault(); // отменяем перезагрузку страницы

    const text = input.value.trim();

    // Проверка на пустоту
    if (text === '') {
        input.focus();
        return;
    }

    addTask(text);
    input.value = '';
    input.focus();
    render();
});

// Фильтры
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;

        // Переключаем активный класс
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        render();
    });
});


// первый рендер
render();