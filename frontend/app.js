// 다크모드 초기값 설정 - Tailwind CDN 로드 이후 실행됨 (index.html에서 script src 순서로 보장)
const THEME_KEY = 'theme';

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  const icon = document.getElementById('themeToggleIcon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextTheme = isDark ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

initTheme();
document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

// D-N HH:MM 형식 계산
function formatDueAt(dueAt) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const now = new Date();
  const diffMs = due.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const hh = String(new Date(dueAt).getHours()).padStart(2, '0');
  const mm = String(new Date(dueAt).getMinutes()).padStart(2, '0');
  const dayLabel = diffDays === 0 ? 'D-day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  return `${dayLabel} ${hh}:${mm}`;
}

const statusBadgeClass = {
  todo: 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100',
  in_progress: 'bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-50',
  done: 'bg-green-200 dark:bg-green-600 text-green-900 dark:text-green-50',
};

let currentEditingId = null;

function renderTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-xl transition';
  card.dataset.taskId = task.id;

  const dueLabel = formatDueAt(task.due_at);

  card.innerHTML = `
    <div class="flex flex-col gap-1 flex-1">
      <div class="flex items-center gap-2">
        <span class="font-medium">${escapeHtml(task.title)}</span>
        <span class="text-xs rounded-xl px-2 py-0.5 ${statusBadgeClass[task.status]}">${task.status}</span>
      </div>
      ${dueLabel ? `<span class="text-sm text-gray-500 dark:text-gray-400">${dueLabel}</span>` : ''}
    </div>
    <button class="deleteBtn rounded-xl px-2 py-2 hover:bg-red-100 dark:hover:bg-red-900 transition" title="삭제">🗑️</button>
  `;

  card.querySelector('.deleteBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDeleteTask(task.id);
  });

  card.addEventListener('click', () => openEditModal(task.id));

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchTaskList() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();
  const listEl = document.getElementById('taskList');
  listEl.innerHTML = '';
  tasks.forEach((task) => listEl.appendChild(renderTaskCard(task)));
}

async function handleCreateTask(event) {
  event.preventDefault();
  const title = document.getElementById('titleInput').value;
  const dueAtRaw = document.getElementById('dueAtInput').value;
  const status = document.getElementById('statusInput').value;

  const payload = { title, status };
  if (dueAtRaw) payload.due_at = new Date(dueAtRaw).toISOString();

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  document.getElementById('taskForm').reset();
  await fetchTaskList();
}

async function openEditModal(taskId) {
  const response = await fetch(`/api/tasks/${taskId}`);
  if (!response.ok) return;
  const task = await response.json();

  currentEditingId = task.id;
  document.getElementById('editTitleInput').value = task.title;
  document.getElementById('editDescriptionInput').value = task.description || '';
  document.getElementById('editStatusInput').value = task.status;
  document.getElementById('editDueAtInput').value = task.due_at ? toDatetimeLocalValue(task.due_at) : '';

  document.getElementById('taskModal').classList.remove('hidden');
  document.getElementById('taskModal').classList.add('flex');
}

function toDatetimeLocalValue(isoString) {
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function closeEditModal() {
  document.getElementById('taskModal').classList.add('hidden');
  document.getElementById('taskModal').classList.remove('flex');
  currentEditingId = null;
}

async function handleUpdateTask(event) {
  event.preventDefault();
  if (currentEditingId === null) return;

  const dueAtRaw = document.getElementById('editDueAtInput').value;
  const payload = {
    title: document.getElementById('editTitleInput').value,
    description: document.getElementById('editDescriptionInput').value || null,
    status: document.getElementById('editStatusInput').value,
    due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
  };

  await fetch(`/api/tasks/${currentEditingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  closeEditModal();
  await fetchTaskList();
}

async function handleDeleteTask(taskId) {
  const confirmed = confirm('이 작업을 삭제하시겠습니까?');
  if (!confirmed) return;

  await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  await fetchTaskList();
}

document.getElementById('taskForm').addEventListener('submit', handleCreateTask);
document.getElementById('editForm').addEventListener('submit', handleUpdateTask);
document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

fetchTaskList();
setInterval(fetchTaskList, 3000);
