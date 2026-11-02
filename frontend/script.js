
const API_BASE = '/tasks';

// Get HTML elements
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const submitBtn = document.getElementById('submit-btn');
const taskList = document.getElementById('task-list');
const empty = document.getElementById('empty');
const banner = document.getElementById('banner');
const counter = document.getElementById('counter');
const refreshBtn = document.getElementById('refresh-btn');
const chips = document.querySelectorAll('.chip');

// Store tasks
let tasks = [];
let filter = 'all';

// Show message
function showMessage(message, type = 'info') {
    banner.textContent = message;
    banner.className = `banner banner--${type}`;
    banner.hidden = false;

    setTimeout(() => {
        banner.hidden = true;
    }, 3000);
}

// Connect to API
async function api(path = '', options = {}) {
    const response = await fetch(API_BASE + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// Load tasks
async function loadTasks() {
    try {
        tasks = await api('');
        renderTasks();
    } catch (error) {
        showMessage('Unable to load tasks', 'error');
    }
}

// Add new task
async function addTask(title) {
    const newTask = await api('', {
        method: 'POST',
        body: JSON.stringify({ title: title })
    });

    tasks.push(newTask);
    renderTasks();
}

// Update task
async function updateTask(id, completed) {
    const updatedTask = await api('/' + id, {
        method: 'PATCH',
        body: JSON.stringify({ completed: completed })
    });

    const index = tasks.findIndex(task => task.id == id);

    if (index !== -1) {
        tasks[index] = updatedTask;
    }

    renderTasks();
}

// Edit task name
async function editTask(id, title, completed) {
    const updatedTask = await api('/' + id, {
        method: 'PUT',
        body: JSON.stringify({
            title: title,
            completed: completed
        })
    });

    const index = tasks.findIndex(task => task.id == id);

    if (index !== -1) {
        tasks[index] = updatedTask;
    }

    renderTasks();
}

// Delete task
async function deleteTask(id) {
    await api('/' + id, {
        method: 'DELETE'
    });

    tasks = tasks.filter(task => task.id != id);
    renderTasks();
}

// Display tasks
function renderTasks() {
    taskList.innerHTML = '';

    let visibleTasks = tasks;

    if (filter === 'active') {
        visibleTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'done') {
        visibleTasks = tasks.filter(task => task.completed);
    }

    // Update counter
    const completed = tasks.filter(task => task.completed).length;

    counter.textContent =
        `${tasks.length} tasks | ${completed} completed`;

    // Show empty message
    empty.hidden = visibleTasks.length > 0;

    if (visibleTasks.length === 0) {
        empty.textContent = 'No tasks available.';
    }

    // Create task elements
    visibleTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task';

        if (task.completed) {
            li.classList.add('task--done');
        }

        li.dataset.id = task.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;

        checkbox.addEventListener('change', async () => {
            try {
                await updateTask(task.id, checkbox.checked);
            } catch (error) {
                showMessage('Unable to update task', 'error');
            }
        });

        // Task title
        const title = document.createElement('span');
        title.textContent = task.title;
        title.className = 'task__title';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', async () => {
            const newTitle = prompt('Enter new task name:', task.title);

            if (newTitle && newTitle.trim()) {
                try {
                    await editTask(
                        task.id,
                        newTitle.trim(),
                        !!task.completed
                    );
                    showMessage('Task updated successfully', 'success');
                } catch (error) {
                    showMessage('Unable to edit task', 'error');
                }
            }
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';

        deleteBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    await deleteTask(task.id);
                    showMessage('Task deleted successfully', 'success');
                } catch (error) {
                    showMessage('Unable to delete task', 'error');
                }
            }
        });

        li.append(checkbox, title, editBtn, deleteBtn);
        taskList.appendChild(li);
    });
}

// Submit form to add task
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();

    if (title === '') {
        showMessage('Please enter a task', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        await addTask(title);

        titleInput.value = '';
        showMessage('Task added successfully', 'success');
    } catch (error) {
        showMessage('Unable to add task', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// Filter tasks
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        filter = chip.dataset.filter;

        chips.forEach(button => {
            button.classList.remove('is-active');
        });

        chip.classList.add('is-active');

        renderTasks();
    });
});

// Refresh task list
refreshBtn.addEventListener('click', loadTasks);

// Start application
loadTasks();
