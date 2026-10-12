const PAGE_SIZE = 5;

function showToast(message) {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = 'toast-in pointer-events-auto rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg px-4 py-3 text-sm';
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

async function loadFragment(path, selector) {
  const container = document.querySelector(selector);
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Fragment not found: ${path}`);
  container.innerHTML = await response.text();
}

async function loadView(viewPath, title) {
  const container = document.querySelector('#app-viewport');
  try {
    const response = await fetch(viewPath);
    if (!response.ok) throw new Error(`View not found: ${viewPath}`);
    container.innerHTML = await response.text();
    const heading = container.querySelector('[data-view-title]');
    const resolved = title || heading?.getAttribute('data-view-title') || 'App';
    const titleEl = document.getElementById('current-view-title');
    if (titleEl) titleEl.textContent = resolved;
    document.querySelectorAll('[data-view]').forEach((btn) => {
      const active = btn.getAttribute('data-view') === viewPath;
      btn.classList.toggle('bg-indigo-50', active);
      btn.classList.toggle('text-indigo-700', active);
      btn.classList.toggle('dark:bg-indigo-500/10', active);
      btn.classList.toggle('dark:text-indigo-300', active);
    });
    initViewScripts(container);
  } catch (error) {
    console.error('Failed to load view:', error);
    container.innerHTML = `<div class="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">Error loading ${viewPath}. Run a local server such as <code>npm start</code> so fetch can load partials.</div>`;
  }
}

function badge(status) {
  const map = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    Draft: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    Open: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    Leave: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    Archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
    Overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600';
  return `<span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}">${status}</span>`;
}

function money(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function initShell() {
  const { org } = MOCK;
  document.getElementById('org-name').textContent = org.name;
  document.getElementById('user-name').textContent = org.user.name;
  document.getElementById('user-role').textContent = org.user.role;
  document.getElementById('user-initials').textContent = org.user.initials;
  renderNotifications();

  document.getElementById('sidebar-collapse').addEventListener('click', () => {
    const aside = document.getElementById('app-sidebar');
    const collapsed = aside.classList.toggle('w-20');
    aside.classList.toggle('w-64', !collapsed);
    aside.querySelectorAll('.sidebar-label').forEach((el) => el.classList.toggle('hidden', collapsed));
    aside.querySelector('#sidebar-collapse i').className = collapsed ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left';
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  const userDropdown = document.getElementById('user-dropdown');
  const notifPanel = document.getElementById('notif-panel');
  document.getElementById('user-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('hidden');
    notifPanel.classList.add('hidden');
  });
  document.getElementById('notif-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('hidden');
    userDropdown.classList.add('hidden');
  });
  document.getElementById('notif-read').addEventListener('click', () => {
    MOCK.notifications.forEach((n) => { n.unread = false; });
    renderNotifications();
    showToast('Notifications marked read');
  });
  document.addEventListener('click', () => {
    userDropdown.classList.add('hidden');
    notifPanel.classList.add('hidden');
    document.getElementById('search-results')?.classList.add('hidden');
  });

  const search = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    if (!q) {
      results.classList.add('hidden');
      return;
    }
    const hits = [
      ...MOCK.inventory.filter((i) => `${i.sku} ${i.name}`.toLowerCase().includes(q)).map((i) => ({ label: i.name, meta: i.sku, view: 'views/inventory/list.html', title: 'Inventory' })),
      ...MOCK.finance.filter((i) => `${i.id} ${i.customer}`.toLowerCase().includes(q)).map((i) => ({ label: i.customer, meta: i.id, view: 'views/finance/overview.html', title: 'Finance' })),
      ...MOCK.hr.filter((i) => i.name.toLowerCase().includes(q)).map((i) => ({ label: i.name, meta: i.team, view: 'views/hr/directory.html', title: 'People' }))
    ].slice(0, 6);
    results.innerHTML = hits.length
      ? hits.map((h) => `<button type="button" data-view="${h.view}" data-title="${h.title}" class="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"><span class="font-medium">${h.label}</span><span class="block text-xs text-slate-500">${h.meta}</span></button>`).join('')
      : `<div class="px-3 py-2 text-sm text-slate-500">No matches</div>`;
    results.classList.remove('hidden');
  });
  search.addEventListener('click', (e) => e.stopPropagation());
  results.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-view]');
    if (!nav) return;
    e.stopPropagation();
    loadView(nav.getAttribute('data-view'), nav.getAttribute('data-title'));
    results.classList.add('hidden');
    search.value = '';
  });

  document.body.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-view]');
    if (nav) {
      loadView(nav.getAttribute('data-view'), nav.getAttribute('data-title'));
      results.classList.add('hidden');
      search.value = '';
    }
    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) openNamedModal(modalBtn.getAttribute('data-modal'));
    if (e.target.closest('[data-close-modal]')) closeModal();
  });
}

function renderNotifications() {
  const unread = MOCK.notifications.filter((n) => n.unread).length;
  const badgeEl = document.getElementById('notif-badge');
  badgeEl.textContent = String(unread);
  badgeEl.classList.toggle('hidden', unread === 0);
  document.getElementById('notif-list').innerHTML = MOCK.notifications.map((n) => `
    <button type="button" data-notif="${n.id}" class="w-full text-left px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-medium">${n.title}</p>
        ${n.unread ? '<span class="mt-1 w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>' : ''}
      </div>
      <p class="text-xs text-slate-500 mt-0.5">${n.body}</p>
      <p class="text-[11px] text-slate-400 mt-1">${n.time}</p>
    </button>
  `).join('');
  document.querySelectorAll('[data-notif]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = MOCK.notifications.find((n) => n.id === Number(btn.getAttribute('data-notif')));
      if (item) item.unread = false;
      renderNotifications();
    });
  });
}

function openModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  const footer = document.getElementById('modal-actions');
  footer.innerHTML = actions;
  document.getElementById('modal-backdrop').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
}

function openNamedModal(name) {
  const user = MOCK.org.user;
  if (name === 'profile') {
    openModal('Profile', `<p class="font-medium text-slate-800 dark:text-slate-100">${user.name}</p><p>${user.role}</p><p class="mt-2">${user.email}</p>`, `<button type="button" data-close-modal class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Close</button>`);
  } else if (name === 'org') {
    openModal('Organization Settings', `<p>${MOCK.org.name}</p><p class="mt-2">Workspace defaults, billing, and members would live here. This starter keeps them as a mock dialog.</p>`, `<button type="button" data-close-modal class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Done</button>`);
  } else if (name === 'logout') {
    openModal('Log out', `<p>End this mock session?</p>`, `<button type="button" data-close-modal class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">Stay</button><button type="button" id="confirm-logout" class="px-3 py-2 rounded-lg bg-red-600 text-white text-sm">Log out</button>`);
    document.getElementById('confirm-logout').addEventListener('click', () => {
      closeModal();
      showToast('Signed out (mock)');
    });
  }
}

function initViewScripts(container) {
  container.querySelectorAll('[data-tab-target]').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const targetId = tabBtn.getAttribute('data-tab-target');
      const parent = tabBtn.closest('.tab-wrapper');
      parent.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));
      parent.querySelectorAll('[data-tab-target]').forEach((b) => {
        b.classList.remove('border-indigo-600', 'text-indigo-600');
        b.classList.add('border-transparent', 'text-slate-500');
      });
      document.getElementById(targetId)?.classList.remove('hidden');
      tabBtn.classList.add('border-indigo-600', 'text-indigo-600');
      tabBtn.classList.remove('border-transparent', 'text-slate-500');
    });
  });

  if (container.querySelector('#metric-grid')) renderDashboard(container);
  if (container.querySelector('[data-inventory-body]')) renderInventory(container);
  if (container.querySelector('#item-form')) renderItemForm(container);
  if (container.querySelector('[data-finance-body]')) renderFinance(container);
  if (container.querySelector('#hr-grid')) renderHr(container);
}

function renderDashboard(container) {
  container.querySelector('#metric-grid').innerHTML = MOCK.dashboard.metrics.map((m) => `
    <article class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between text-slate-400">
        <span class="text-xs uppercase tracking-wide">${m.label}</span>
        <i class="fa-solid ${m.icon}"></i>
      </div>
      <p class="text-2xl font-semibold mt-2">${m.value}</p>
      <p class="text-xs text-indigo-600 dark:text-indigo-400 mt-1">${m.delta} vs last period</p>
    </article>
  `).join('');
  container.querySelector('#activity-list').innerHTML = MOCK.dashboard.activity.map((a) => `
    <li class="px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-medium">${a.title}</p>
        <p class="text-xs text-slate-500">${a.detail}</p>
      </div>
      <span class="text-xs text-slate-400 shrink-0">${a.time}</span>
    </li>
  `).join('');
}

function renderInventory(container) {
  const state = { q: '', status: '', sort: null, dir: 1, page: 1 };
  const body = container.querySelector('[data-inventory-body]');
  const pager = container.querySelector('[data-inventory-pager]');

  function rows() {
    let list = MOCK.inventory.filter((item) => {
      const hay = `${item.sku} ${item.name}`.toLowerCase();
      return hay.includes(state.q) && (!state.status || item.status === state.status);
    });
    if (state.sort) {
      list.sort((a, b) => {
        const av = a[state.sort];
        const bv = b[state.sort];
        if (av < bv) return -1 * state.dir;
        if (av > bv) return 1 * state.dir;
        return 0;
      });
    }
    return list;
  }

  function draw() {
    const list = rows();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const slice = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    body.innerHTML = slice.length
      ? slice.map((item) => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <td class="px-4 py-3 font-mono text-xs">${item.sku}</td>
          <td class="px-4 py-3 font-medium">${item.name}</td>
          <td class="px-4 py-3">${item.category}</td>
          <td class="px-4 py-3">${money(item.price)}</td>
          <td class="px-4 py-3">${badge(item.status)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">No items match that filter.</td></tr>`;
    pager.innerHTML = `
      <span class="text-slate-500">${list.length} items</span>
      <div class="flex items-center gap-2">
        <button type="button" data-page="prev" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700" ${state.page === 1 ? 'disabled' : ''}>Prev</button>
        <span>${state.page} / ${pages}</span>
        <button type="button" data-page="next" class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700" ${state.page === pages ? 'disabled' : ''}>Next</button>
      </div>`;
  }

  container.querySelector('[data-inventory-search]').addEventListener('input', (e) => {
    state.q = e.target.value.trim().toLowerCase();
    state.page = 1;
    draw();
  });
  container.querySelector('[data-inventory-status]').addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    draw();
  });
  container.querySelectorAll('[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-sort');
      state.dir = state.sort === key ? state.dir * -1 : 1;
      state.sort = key;
      draw();
    });
  });
  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    state.page += btn.getAttribute('data-page') === 'next' ? 1 : -1;
    draw();
  });
  draw();
}

function renderItemForm(container) {
  const zone = container.querySelector('[data-dropzone]');
  const input = container.querySelector('[data-file-input]');
  const list = container.querySelector('[data-file-list]');
  const barWrap = container.querySelector('[data-progress]');
  const bar = container.querySelector('[data-progress-bar]');
  const files = [];

  function paintFiles() {
    list.innerHTML = files.map((file, i) => `
      <li class="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
        <i class="fa-regular fa-file"></i> ${file.name}
        <button type="button" data-remove-file="${i}" class="text-slate-400 hover:text-rose-500"><i class="fa-solid fa-xmark"></i></button>
      </li>
    `).join('');
  }

  function accept(fileList) {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf', 'text/csv'];
    [...fileList].forEach((file) => {
      const okType = allowed.includes(file.type) || /\.(png|jpe?g|pdf|csv)$/i.test(file.name);
      if (!okType) {
        showToast(`${file.name} is not an accepted type`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} is over 10 MB`);
        return;
      }
      files.push(file);
    });
    barWrap.classList.remove('hidden');
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(100, pct + 20);
      bar.style.width = `${pct}%`;
      if (pct === 100) {
        clearInterval(timer);
        setTimeout(() => barWrap.classList.add('hidden'), 400);
        paintFiles();
      }
    }, 80);
  }

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragover');
    accept(e.dataTransfer.files);
  });
  container.querySelector('[data-browse]').addEventListener('click', () => input.click());
  input.addEventListener('change', () => accept(input.files));
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-file]');
    if (!btn) return;
    files.splice(Number(btn.getAttribute('data-remove-file')), 1);
    paintFiles();
  });

  container.querySelector('#item-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    MOCK.inventory.unshift({
      sku: data.sku,
      name: data.name,
      category: data.category,
      price: Number(data.price) || 0,
      status: 'Draft',
      updated: new Date().toISOString().slice(0, 10)
    });
    showToast(`Saved ${data.name} as a draft`);
    loadView('views/inventory/list.html', 'Inventory');
  });
}

function renderFinance(container) {
  const sum = (status) => MOCK.finance.filter((i) => i.status === status).reduce((n, i) => n + i.amount, 0);
  container.querySelector('[data-finance-stat="open"]').textContent = money(sum('Open'));
  container.querySelector('[data-finance-stat="overdue"]').textContent = money(sum('Overdue'));
  container.querySelector('[data-finance-stat="paid"]').textContent = money(sum('Paid'));
  container.querySelector('[data-finance-body]').innerHTML = MOCK.finance.map((row) => `
    <tr>
      <td class="px-4 py-3 font-mono text-xs">${row.id}</td>
      <td class="px-4 py-3">${row.customer}</td>
      <td class="px-4 py-3">${money(row.amount)}</td>
      <td class="px-4 py-3">${row.due}</td>
      <td class="px-4 py-3">${badge(row.status)}</td>
    </tr>
  `).join('');
}

function renderHr(container) {
  const grid = container.querySelector('#hr-grid');
  function draw(q = '') {
    const people = MOCK.hr.filter((p) => `${p.name} ${p.team} ${p.role}`.toLowerCase().includes(q));
    grid.innerHTML = people.length
      ? people.map((p) => `
        <article class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">${p.name.split(' ').map((n) => n[0]).join('')}</span>
            <div>
              <p class="font-medium">${p.name}</p>
              <p class="text-xs text-slate-500">${p.role} · ${p.team}</p>
            </div>
          </div>
          ${badge(p.status)}
        </article>
      `).join('')
      : `<p class="text-sm text-slate-500">No people match that search.</p>`;
  }
  container.querySelector('[data-hr-search]').addEventListener('input', (e) => draw(e.target.value.trim().toLowerCase()));
  draw();
}

async function boot() {
  try {
    await Promise.all([
      loadFragment('components/sidebar.html', '#sidebar-root'),
      loadFragment('components/topbar.html', '#topbar-root'),
      loadFragment('components/modal-container.html', '#modal-root')
    ]);
    initShell();
    await loadView('views/dashboard.html', 'Dashboard');
  } catch (error) {
    console.error(error);
    document.getElementById('app-viewport').innerHTML = `<div class="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">Could not boot the shell. Run <code>npm start</code> from the project root.</div>`;
  }
}

boot();
