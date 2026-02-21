// ============================================================
//  Task Manager — app.js
//  Uses Supabase JS v2 loaded via CDN in index.html
// ============================================================

// --- Init Supabase ----------------------------------------

const configMissing =
  !SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL' ||
  !SUPABASE_ANON || SUPABASE_ANON === 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

if (configMissing) {
  document.getElementById('config-warning').classList.remove('hidden');
} else {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
}

// --- State ------------------------------------------------

let tasks       = [];
let activeFilter = 'all';

// --- DOM refs ---------------------------------------------

const taskForm      = document.getElementById('task-form');
const taskInput     = document.getElementById('task-input');
const taskList      = document.getElementById('task-list');
const loadingEl     = document.getElementById('loading');
const errorEl       = document.getElementById('error-msg');
const taskFooter    = document.getElementById('task-footer');
const taskCount     = document.getElementById('task-count');
const clearBtn      = document.getElementById('clear-completed');
const filterBtns    = document.querySelectorAll('.filter-btn');

// --- Helpers ----------------------------------------------

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

function clearError() {
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
}

function setLoading(visible) {
  loadingEl.classList.toggle('hidden', !visible);
}

// --- Database functions -----------------------------------

async function fetchTasks() {
  if (!supabase) return;
  clearError();
  setLoading(true);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  setLoading(false);
  if (error) { showError('Could not load tasks: ' + error.message); return; }
  tasks = data;
  render();
}

async function addTask(title) {
  if (!supabase) return;
  clearError();
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, completed: false }])
    .select()
    .single();
  if (error) { showError('Could not add task: ' + error.message); return; }
  tasks.push(data);
  render();
}

async function toggleTask(id, completed) {
  if (!supabase) return;
  clearError();
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', id);
  if (error) { showError('Could not update task: ' + error.message); return; }
  tasks = tasks.map(t => t.id === id ? { ...t, completed } : t);
  render();
}

async function deleteTask(id) {
  if (!supabase) return;
  clearError();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) { showError('Could not delete task: ' + error.message); return; }
  tasks = tasks.filter(t => t.id !== id);
  render();
}

async function clearCompleted() {
  if (!supabase) return;
  clearError();
  const ids = tasks.filter(t => t.completed).map(t => t.id);
  if (ids.length === 0) return;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', ids);
  if (error) { showError('Could not clear completed: ' + error.message); return; }
  tasks = tasks.filter(t => !t.completed);
  render();
}

// --- Rendering --------------------------------------------

function filteredTasks() {
  if (activeFilter === 'active')    return tasks.filter(t => !t.completed);
  if (activeFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function render() {
  const visible = filteredTasks();

  // Build list
  taskList.innerHTML = '';
  visible.forEach(task => {
    const li       = document.createElement('li');
    li.className   = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id  = task.id;

    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const label     = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.title;
    label.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      toggleTask(task.id, checkbox.checked);
    });

    const delBtn     = document.createElement('button');
    delBtn.className = 'task-delete';
    delBtn.title     = 'Delete task';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, label, delBtn);
    taskList.appendChild(li);
  });

  // Footer
  const activeCount     = tasks.filter(t => !t.completed).length;
  const completedCount  = tasks.filter(t => t.completed).length;
  taskFooter.classList.toggle('hidden', tasks.length === 0);
  taskCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
  clearBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
}

// --- Event listeners -------------------------------------

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  taskInput.value = '';
  await addTask(title);
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', clearCompleted);

// --- Boot -------------------------------------------------

fetchTasks();
