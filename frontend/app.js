// TaskFlow Pro 프론트엔드 - API 호출은 상대경로 고정 (03-design 2)

const API_BASE = '/api/tasks';
const POLL_INTERVAL_MS = 3000; // 03-design 5 - MVP 는 폴링 3초

const STATUS_LABEL = {
  todo: '할 일',
  in_progress: '진행 중',
  done: '완료'
};

const STATUS_BADGE = {
  todo: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
};

let cachedTasks = [];

// ---------- 시각 변환 (02-specs - 보낼 때 로컬>UTC, 보일 때 UTC>로컬) ----------

function localInputToUtcIso(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function utcIsoToLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDueLabel(value) {
  if (!value) return '마감 없음';
  const due = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(due.getHours())}:${pad(due.getMinutes())}`;

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000);

  if (diffDays === 0) return `D-DAY ${time}`;
  if (diffDays > 0) return `D-${diffDays} ${time}`;
  return `D+${Math.abs(diffDays)} ${time}`;
}

// ---------- API ----------

async function fetchTasks() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('목록을 불러오지 못했습니다');
  return response.json();
}

async function fetchTask(taskId) {
  const response = await fetch(`${API_BASE}/${taskId}`);
  if (!response.ok) throw new Error('작업을 찾을 수 없습니다');
  return response.json();
}

async function createTask(payload) {
  return fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function updateTask(taskId, payload) {
  return fetch(`${API_BASE}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function deleteTask(taskId) {
  return fetch(`${API_BASE}/${taskId}`, { method: 'DELETE' });
}

// ---------- 렌더 ----------

function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  empty.classList.toggle('hidden', tasks.length > 0);

  tasks.forEach((task) => {
    const card = document.createElement('article');
    card.dataset.id = task.id;
    card.className =
      'task-card cursor-pointer rounded-xl bg-white/70 p-4 shadow-lg backdrop-blur transition hover:-translate-y-0.5 dark:bg-slate-800/70';

    const badgeClass = STATUS_BADGE[task.status] || STATUS_BADGE.todo;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="truncate text-base font-medium">${escapeHtml(task.title)}</h3>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded-full px-2 py-1 ${badgeClass}">${STATUS_LABEL[task.status] || task.status}</span>
            <span class="text-slate-500 dark:text-slate-400">${formatDueLabel(task.due_at)}</span>
          </div>
        </div>
        <button type="button" class="delete-button shrink-0 rounded-xl px-2 py-1 text-lg hover:bg-red-50 dark:hover:bg-red-900/40" aria-label="삭제">🗑️</button>
      </div>`;
    list.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

async function refresh() {
  try {
    cachedTasks = await fetchTasks();
    renderTasks(cachedTasks);
  } catch (error) {
    console.error(error);
  }
}

// ---------- 이벤트 ----------

document.getElementById('createForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorBox = document.getElementById('createError');
  errorBox.classList.add('hidden');

  const payload = {
    title: document.getElementById('createTitle').value.trim(),
    description: null,
    status: document.getElementById('createStatus').value,
    due_at: localInputToUtcIso(document.getElementById('createDueAt').value)
  };

  const response = await createTask(payload);
  if (response.status !== 201) {
    errorBox.textContent = `추가하지 못했습니다 (${response.status})`;
    errorBox.classList.remove('hidden');
    return;
  }
  event.target.reset();
  await refresh();
});

document.getElementById('taskList').addEventListener('click', async (event) => {
  const card = event.target.closest('.task-card');
  if (!card) return;
  const taskId = card.dataset.id;

  // 휴지통 클릭이 카드 클릭으로 번지지 않게 한다 (02-specs 목록 화면)
  if (event.target.closest('.delete-button')) {
    event.stopPropagation();
    if (!window.confirm('이 작업을 삭제할까요?')) return;
    const response = await deleteTask(taskId);
    if (response.status === 204) await refresh();
    return;
  }

  await openEditModal(taskId);
});

// 수정 모달 - 단건 조회로 전 필드를 채운다 (05-conventions 구현 규칙 2)
async function openEditModal(taskId) {
  const task = await fetchTask(taskId);
  document.getElementById('editId').value = task.id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDescription').value = task.description ?? '';
  document.getElementById('editDueAt').value = utcIsoToLocalInput(task.due_at);
  document.getElementById('editStatus').value = task.status;
  document.getElementById('editError').classList.add('hidden');

  const modal = document.getElementById('editModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.getElementById('editCancel').addEventListener('click', closeEditModal);

document.getElementById('editForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorBox = document.getElementById('editError');
  errorBox.classList.add('hidden');

  const taskId = document.getElementById('editId').value;
  const description = document.getElementById('editDescription').value.trim();
  const payload = {
    title: document.getElementById('editTitle').value.trim(),
    description: description === '' ? null : description,
    status: document.getElementById('editStatus').value,
    due_at: localInputToUtcIso(document.getElementById('editDueAt').value)
  };

  const response = await updateTask(taskId, payload);
  if (response.status !== 200) {
    errorBox.textContent = `저장하지 못했습니다 (${response.status})`;
    errorBox.classList.remove('hidden');
    return;
  }
  closeEditModal();
  await refresh();
});

// 테마 토글 - localStorage('theme')
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function syncThemeIcon() {
  themeIcon.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  syncThemeIcon();
});

syncThemeIcon();
refresh();
setInterval(refresh, POLL_INTERVAL_MS);
