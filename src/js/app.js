document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initializeTheme();
    setupNavigation();
    initializeCharts();
    loadInitialData();
    setupModal();
    setupLogout();
    setupSearch();
});

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('i[data-lucide="sun"]');
    const moonIcon = themeToggle.querySelector('i[data-lucide="moon"]');
    
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const sections = document.querySelectorAll('main section');
    const mainTitle = document.getElementById('main-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section + '-section';

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => s.classList.add('hidden'));
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            mainTitle.textContent = link.querySelector('span').textContent;
        });
    });
}

function setupSearch() {
    const searchInput = document.querySelector('main header input[type="text"]');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                performSearch(query);
            } else {
                // If search is cleared, re-populate the current section
                const activeSection = document.querySelector('main section:not(.hidden)');
                if (activeSection) {
                    const sectionId = activeSection.id;
                    if (sectionId === 'categories-section') populateCategories();
                    else if (sectionId === 'rewards-section') populateRewards();
                    else if (sectionId === 'activities-section') populateActivities();
                    else if (sectionId === 'news-section') populateNews();
                    else if (sectionId === 'users-section') populateUsers();
                }
            }
        }, 300); // 300ms debounce
    });
}

function performSearch(query) {
    const activeSection = document.querySelector('main section:not(.hidden)');
    if (!activeSection) return;

    const sectionId = activeSection.id;
    let data = [];

    switch (sectionId) {
        case 'categories-section':
            data = API.getCategories().filter(c => c.name.toLowerCase().includes(query));
            renderFilteredTable(activeSection, data, ['name', 'icon', 'points'], 'category');
            break;
        case 'rewards-section':
            data = API.getRewards().filter(r => r.name.toLowerCase().includes(query));
            renderFilteredTable(activeSection, data, ['name', 'points', 'stock'], 'reward');
            break;
        case 'activities-section':
            data = API.getActivities().filter(a => a.name.toLowerCase().includes(query));
            renderFilteredTable(activeSection, data, ['name', 'start', 'end', 'status'], 'activity');
            break;
        case 'news-section':
            data = API.getNews().filter(n => n.title.toLowerCase().includes(query));
            renderFilteredTable(activeSection, data, ['title', 'date'], 'news');
            break;
        case 'users-section':
            data = API.getUsers().filter(u => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
            renderFilteredTable(activeSection, data, ['username', 'email', 'registered', 'status'], 'user');
            break;
    }
}

function renderFilteredTable(section, data, fields, prefix) {
    const tbody = section.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="${prefix}-checkbox" value="${item.id}"></td>
            ${fields.map(field => `
                <td class="p-2">
                    ${field === 'icon' ? `<i data-lucide="${item[field]}"></i>` : 
                      field === 'status' ? `<span class="px-2 py-1 rounded-full text-xs ${item[field] === '进行中' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}">${item[field]}</span>` : 
                      item[field]}
                </td>
            `).join('')}
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${item.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${item.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
    
    // Re-add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => window[`edit${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`](btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => window[`delete${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`](btn.dataset.id));
    });
}

function initializeCharts() {
    const data = API.getDashboardData();
    const trendChartCtx = document.getElementById('trend-chart').getContext('2d');
    new Chart(trendChartCtx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '投递次数',
                data: data.trend,
                borderColor: 'var(--primary-color)',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const categoryChartCtx = document.getElementById('category-chart').getContext('2d');
    new Chart(categoryChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['可回收物', '厨余垃圾', '有害垃圾', '其他垃圾'],
            datasets: [{
                label: '分类占比',
                data: data.categories,
                backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#6B7280'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function loadInitialData() {
    populateCategories();
    populateRewards();
    populateLeaderboard();
    populateActivities();
    populateNews();
    populateLogs();
    populateUsers();
}

function setupBatchOperations(prefix) {
    const selectAll = document.getElementById(`select-all-${prefix}`);
    const checkboxes = document.querySelectorAll(`.${prefix}-checkbox`);
    const batchDeleteBtn = document.getElementById(`batch-delete-${prefix}`);
    const exportBtn = document.getElementById(`export-${prefix}`);

    selectAll.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });

    batchDeleteBtn.addEventListener('click', () => {
        const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
        if (selectedIds.length > 0) {
            ConfirmDialog.show(`确定要删除选中的 ${selectedIds.length} 项吗？`, () => {
                selectedIds.forEach(id => {
                    switch (prefix) {
                        case 'categories': API.deleteCategory(id); break;
                        case 'rewards': API.deleteReward(id); break;
                        case 'activities': API.deleteActivity(id); break;
                        case 'news': API.deleteNews(id); break;
                        case 'users': API.deleteUser(id); break;
                    }
                });
                switch (prefix) {
                    case 'categories': populateCategories(); break;
                    case 'rewards': populateRewards(); break;
                    case 'activities': populateActivities(); break;
                    case 'news': populateNews(); break;
                    case 'users': populateUsers(); break;
                }
                Toast.show('批量删除成功', 'success');
            });
        } else {
            Toast.show('请至少选择一项', 'warning');
        }
    });

    exportBtn.addEventListener('click', () => {
        Toast.show('导出功能正在开发中...', 'info');
    });
}

function populateCategories() {
    const categories = API.getCategories();
    const tbody = document.querySelector('#categories-section tbody');
    tbody.innerHTML = `
        <tr>
            <td class="p-2"><input type="checkbox" id="select-all-categories"></td>
            <td class="p-2 font-bold">全选</td>
            <td colspan="2"></td>
            <td class="p-2">
                <button id="batch-delete-categories" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2"></i> 批量删除</button>
                <button id="export-categories" class="text-blue-500 hover:text-blue-700 ml-4"><i data-lucide="download"></i> 导出</button>
            </td>
        </tr>
        ${categories.map(c => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="category-checkbox" value="${c.id}"></td>
            <td class="p-2">${c.name}</td>
            <td class="p-2"><i data-lucide="${c.icon}"></i></td>
            <td class="p-2">${c.points}</td>
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${c.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${c.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('')}`;
    lucide.createIcons();
    setupBatchOperations('categories');
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
    });
}

function populateRewards() {
    const rewards = API.getRewards();
    const tbody = document.querySelector('#rewards-section tbody');
    tbody.innerHTML = `
        <tr>
            <td class="p-2"><input type="checkbox" id="select-all-rewards"></td>
            <td class="p-2 font-bold">全选</td>
            <td colspan="2"></td>
            <td class="p-2">
                <button id="batch-delete-rewards" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2"></i> 批量删除</button>
                <button id="export-rewards" class="text-blue-500 hover:text-blue-700 ml-4"><i data-lucide="download"></i> 导出</button>
            </td>
        </tr>
        ${rewards.map(r => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="reward-checkbox" value="${r.id}"></td>
            <td class="p-2">${r.name}</td>
            <td class="p-2">${r.points}</td>
            <td class="p-2">${r.stock}</td>
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${r.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${r.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('')}`;
    lucide.createIcons();
    setupBatchOperations('rewards');
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editReward(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteReward(btn.dataset.id));
    });
}

function populateLeaderboard() {
    const leaderboard = API.getLeaderboard();
    const tbody = document.querySelector('#leaderboard-section tbody');
    tbody.innerHTML = leaderboard.map(l => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2">${l.rank}</td>
            <td class="p-2">${l.user}</td>
            <td class="p-2">${l.deliveries}</td>
            <td class="p-2">${l.points}</td>
        </tr>
    `).join('');
}

function populateActivities() {
    const activities = API.getActivities();
    const tbody = document.querySelector('#activities-section tbody');
    tbody.innerHTML = `
        <tr>
            <td class="p-2"><input type="checkbox" id="select-all-activities"></td>
            <td class="p-2 font-bold">全选</td>
            <td colspan="3"></td>
            <td class="p-2">
                <button id="batch-delete-activities" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2"></i> 批量删除</button>
                <button id="export-activities" class="text-blue-500 hover:text-blue-700 ml-4"><i data-lucide="download"></i> 导出</button>
            </td>
        </tr>
        ${activities.map(a => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="activity-checkbox" value="${a.id}"></td>
            <td class="p-2">${a.name}</td>
            <td class="p-2">${a.start}</td>
            <td class="p-2">${a.end}</td>
            <td class="p-2"><span class="px-2 py-1 rounded-full text-xs ${a.status === '进行中' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}">${a.status}</span></td>
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${a.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${a.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('')}`;
    lucide.createIcons();
    setupBatchOperations('activities');
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editActivity(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteActivity(btn.dataset.id));
    });
}

function populateNews() {
    const news = API.getNews();
    const tbody = document.querySelector('#news-section tbody');
    tbody.innerHTML = `
        <tr>
            <td class="p-2"><input type="checkbox" id="select-all-news"></td>
            <td class="p-2 font-bold">全选</td>
            <td></td>
            <td class="p-2">
                <button id="batch-delete-news" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2"></i> 批量删除</button>
                <button id="export-news" class="text-blue-500 hover:text-blue-700 ml-4"><i data-lucide="download"></i> 导出</button>
            </td>
        </tr>
        ${news.map(n => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="news-checkbox" value="${n.id}"></td>
            <td class="p-2">${n.title}</td>
            <td class="p-2">${n.date}</td>
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${n.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${n.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('')}`;
    lucide.createIcons();
    setupBatchOperations('news');
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editNews(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteNews(btn.dataset.id));
    });
}

function setupModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const modalCancel = document.getElementById('modal-cancel');
    const addButton = document.querySelector('header .btn-primary');

    addButton.addEventListener('click', () => {
        const activeSection = document.getElementById('main-title').textContent;
        if (activeSection === '分类管理') {
            modalTitle.textContent = '新增分类';
            modal.classList.remove('hidden');
        } else if (activeSection === '积分奖励') {
            modalTitle.textContent = '新增奖励';
            modal.classList.remove('hidden');
        } else if (activeSection === '活动管理') {
            modalTitle.textContent = '新增活动';
            modal.classList.remove('hidden');
        } else if (activeSection === '资讯管理') {
            modalTitle.textContent = '新增资讯';
            modal.classList.remove('hidden');
        } else if (activeSection === '用户管理') {
            modalTitle.textContent = '新增用户';
            modal.classList.remove('hidden');
        }
    });

    modalCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        modalForm.reset();
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeSection = document.getElementById('main-title').textContent;
        const name = document.getElementById('modal-name').value;
        const points = document.getElementById('modal-points').value;
        const editId = modalForm.dataset.editId;

        if (editId) {
            // Edit mode
            switch (activeSection) {
                case '分类管理':
                    API.updateCategory(editId, { name, points: parseInt(points) });
                    populateCategories();
                    break;
                case '积分奖励':
                    API.updateReward(editId, { name, points: parseInt(points), stock: 100 });
                    populateRewards();
                    break;
                case '活动管理':
                    API.updateActivity(editId, { name, start: '2024-01-01', end: '2024-12-31', status: '即将开始' });
                    populateActivities();
                    break;
                case '资讯管理':
                    API.updateNews(editId, { title: name, date: new Date().toISOString().split('T')[0], content: '...' });
                    populateNews();
                    break;
                case '用户管理':
                    API.updateUser(editId, { username: name, email: 'user@example.com', registered: new Date().toISOString().split('T')[0], status: '活跃' });
                    populateUsers();
                    break;
            }
            Toast.show('更新成功', 'success');
        } else {
            // Create mode
            switch (activeSection) {
                case '分类管理':
                    API.createCategory({ name, points: parseInt(points) });
                    populateCategories();
                    break;
                case '积分奖励':
                    API.createReward({ name, points: parseInt(points), stock: 100 });
                    populateRewards();
                    break;
                case '活动管理':
                    API.createActivity({ name, start: '2024-01-01', end: '2024-12-31', status: '即将开始' });
                    populateActivities();
                    break;
                case '资讯管理':
                    API.createNews({ title: name, date: new Date().toISOString().split('T')[0], content: '...' });
                    populateNews();
                    break;
                case '用户管理':
                    API.createUser({ username: name, email: 'user@example.com', registered: new Date().toISOString().split('T')[0], status: '活跃' });
                    populateUsers();
                    break;
            }
            Toast.show('创建成功', 'success');
        }
        
        modal.classList.add('hidden');
        modalForm.reset();
        delete modalForm.dataset.editId; // Clear the edit ID
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modalForm.reset();
        }
    });
}



function setupLogout() {
    const logoutBtn = document.getElementById('logout-dropdown-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ConfirmDialog.show('确定要退出登录吗？', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    });
}

function populateLogs() {
    const logs = API.getLogs();
    const tbody = document.querySelector('#logs-section tbody');
    if (!tbody) return;
    
    tbody.innerHTML = logs.map(log => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2">${log.time}</td>
            <td class="p-2">${log.user}</td>
            <td class="p-2">${log.action}</td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function populateUsers() {
    const users = API.getUsers();
    const tbody = document.querySelector('#users-section tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td class="p-2"><input type="checkbox" id="select-all-users"></td>
            <td class="p-2 font-bold">全选</td>
            <td colspan="3"></td>
            <td class="p-2">
                <button id="batch-delete-users" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2"></i> 批量删除</button>
                <button id="export-users" class="text-blue-500 hover:text-blue-700 ml-4"><i data-lucide="download"></i> 导出</button>
            </td>
        </tr>
        ${users.map(u => `
        <tr class="border-b dark:border-gray-700">
            <td class="p-2"><input type="checkbox" class="user-checkbox" value="${u.id}"></td>
            <td class="p-2">${u.username}</td>
            <td class="p-2">${u.email}</td>
            <td class="p-2">${u.registered}</td>
            <td class="p-2"><span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">${u.status}</span></td>
            <td class="p-2 space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-id="${u.id}"><i data-lucide="edit"></i></button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${u.id}"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('')}`;
    lucide.createIcons();
    setupBatchOperations('users');
    
    // Add event listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// CRUD Operations
function editCategory(id) { 
    const category = API.getCategory(id);
    if (category) {
        document.getElementById('modal-name').value = category.name;
        document.getElementById('modal-points').value = category.points;
        document.getElementById('modal-title').textContent = '编辑分类';
        document.getElementById('modal').classList.remove('hidden');
        // Store the current ID for the save operation
        document.getElementById('modal-form').dataset.editId = id;
    }
}

function deleteCategory(id) { 
    ConfirmDialog.show('确定要删除此分类吗？', () => {
        API.deleteCategory(id); 
        populateCategories();
        Toast.show('删除成功', 'success');
    });
}

function editReward(id) { 
    const reward = API.getReward(id);
    if (reward) {
        document.getElementById('modal-name').value = reward.name;
        document.getElementById('modal-points').value = reward.points;
        document.getElementById('modal-title').textContent = '编辑奖励';
        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('modal-form').dataset.editId = id;
    }
}

function deleteReward(id) { 
    ConfirmDialog.show('确定要删除此奖励吗？', () => {
        API.deleteReward(id); 
        populateRewards();
        Toast.show('删除成功', 'success');
    });
}

function editActivity(id) { 
    const activity = API.getActivity(id);
    if (activity) {
        document.getElementById('modal-name').value = activity.name;
        document.getElementById('modal-title').textContent = '编辑活动';
        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('modal-form').dataset.editId = id;
    }
}

function deleteActivity(id) { 
    ConfirmDialog.show('确定要删除此活动吗？', () => {
        API.deleteActivity(id); 
        populateActivities();
        Toast.show('删除成功', 'success');
    });
}

function editNews(id) { 
    const news = API.getNews(id);
    if (news) {
        document.getElementById('modal-name').value = news.title;
        document.getElementById('modal-title').textContent = '编辑资讯';
        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('modal-form').dataset.editId = id;
    }
}

function deleteNews(id) { 
    ConfirmDialog.show('确定要删除此资讯吗？', () => {
        API.deleteNews(id); 
        populateNews();
        Toast.show('删除成功', 'success');
    });
}

function editUser(id) { 
    const user = API.getUser(id);
    if (user) {
        document.getElementById('modal-name').value = user.username;
        document.getElementById('modal-title').textContent = '编辑用户';
        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('modal-form').dataset.editId = id;
    }
}

function deleteUser(id) { 
    ConfirmDialog.show('确定要删除此用户吗？', () => {
        API.deleteUser(id); 
        populateUsers();
        Toast.show('删除成功', 'success');
    });
}