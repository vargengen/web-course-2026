// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================
let tasks = [];              // массив задач
let currentFilter = 'all';   // текущий фильтр
let nextId = 1;              // счётчик для уникальных id

// ============================================
// DOM-ЭЛЕМЕНТЫ
// ============================================
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('empty-message');

// ============================================
// ФУНКЦИИ РАБОТЫ С ДАННЫМИ
// ============================================

/**
 * Добавить новую задачу
 */
function addTask(text) {
    tasks.push({
        id: nextId++,
        text: text,
        completed: false
    });
}

/**
 * Удалить задачу по id
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
}

/**
 * Переключить статус «выполнено»
 */
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );
}

/**
 * Получить задачи по текущему фильтру
 */
function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    }
    if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    return tasks; // 'all'
}

// ============================================
// РЕНДЕР
// ============================================
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

    // Обновляем счётчик (по ВСЕМ задачам, не по фильтру)
    const active = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================

// Добавление задачи (по кнопке ИЛИ по Enter — оба работают через submit)
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

// ============================================
// ПЕРВЫЙ РЕНДЕР
// ============================================
render();