document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initializeTheme();
    setupNavigation();
    initializeCharts();
    loadInitialData();
    setupModal();
    setupLogout();
    setupSearch();
    setupNotifications();
    setupRoleManagement();
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
    populateDevices();
    populateAnalytics();
    populateOperations();
    populateAIMonitoring();
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

// Edit functions
function editCategory(id) {
    const category = API.getCategory(id);
    if (category) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        const nameInput = document.getElementById('modal-name');
        const pointsInput = document.getElementById('modal-points');
        
        modalTitle.textContent = '编辑分类';
        nameInput.value = category.name;
        pointsInput.value = category.points;
        modalForm.dataset.editId = id;
        
        modal.classList.remove('hidden');
    }
}

function editReward(id) {
    const reward = API.getReward(id);
    if (reward) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        const nameInput = document.getElementById('modal-name');
        const pointsInput = document.getElementById('modal-points');
        
        modalTitle.textContent = '编辑奖励';
        nameInput.value = reward.name;
        pointsInput.value = reward.points;
        modalForm.dataset.editId = id;
        
        modal.classList.remove('hidden');
    }
}

function editActivity(id) {
    const activity = API.getActivity(id);
    if (activity) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        const nameInput = document.getElementById('modal-name');
        
        modalTitle.textContent = '编辑活动';
        nameInput.value = activity.name;
        modalForm.dataset.editId = id;
        
        // Add date fields if they don't exist
        let startDateInput = document.getElementById('modal-start-date');
        let endDateInput = document.getElementById('modal-end-date');
        
        if (!startDateInput) {
            const dateFieldsContainer = document.createElement('div');
            dateFieldsContainer.innerHTML = `
                <div class="mb-4">
                    <label for="modal-start-date" class="block mb-2">开始日期</label>
                    <input type="date" id="modal-start-date" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                </div>
                <div class="mb-4">
                    <label for="modal-end-date" class="block mb-2">结束日期</label>
                    <input type="date" id="modal-end-date" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                </div>
            `;
            pointsInput.parentNode.insertAdjacentElement('afterend', dateFieldsContainer);
            startDateInput = document.getElementById('modal-start-date');
            endDateInput = document.getElementById('modal-end-date');
        }
        
        startDateInput.value = activity.start;
        endDateInput.value = activity.end;
        
        modal.classList.remove('hidden');
    }
}

function editNews(id) {
    const newsItem = API.getNewsItem(id);
    if (newsItem) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        const nameInput = document.getElementById('modal-name');
        
        modalTitle.textContent = '编辑资讯';
        nameInput.value = newsItem.title;
        modalForm.dataset.editId = id;
        
        // Add content field if it doesn't exist
        let contentInput = document.getElementById('modal-content');
        
        if (!contentInput) {
            const contentFieldContainer = document.createElement('div');
            contentFieldContainer.innerHTML = `
                <div class="mb-4">
                    <label for="modal-content" class="block mb-2">内容</label>
                    <textarea id="modal-content" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" rows="4" required></textarea>
                </div>
            `;
            pointsInput.parentNode.insertAdjacentElement('afterend', contentFieldContainer);
            contentInput = document.getElementById('modal-content');
        }
        
        contentInput.value = newsItem.content;
        
        modal.classList.remove('hidden');
    }
}

function editUser(id) {
    const user = API.getUser(id);
    if (user) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalForm = document.getElementById('modal-form');
        const nameInput = document.getElementById('modal-name');
        
        modalTitle.textContent = '编辑用户';
        nameInput.value = user.username;
        modalForm.dataset.editId = id;
        
        // Add email field if it doesn't exist
        let emailInput = document.getElementById('modal-email');
        
        if (!emailInput) {
            const emailFieldContainer = document.createElement('div');
            emailFieldContainer.innerHTML = `
                <div class="mb-4">
                    <label for="modal-email" class="block mb-2">邮箱</label>
                    <input type="email" id="modal-email" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                </div>
            `;
            pointsInput.parentNode.insertAdjacentElement('afterend', emailFieldContainer);
            emailInput = document.getElementById('modal-email');
        }
        
        emailInput.value = user.email;
        
        modal.classList.remove('hidden');
    }
}

// Delete functions
function deleteCategory(id) {
    ConfirmDialog.show('确定要删除这个分类吗？', () => {
        API.deleteCategory(id);
        populateCategories();
        Toast.show('删除成功', 'success');
    });
}

function deleteReward(id) {
    ConfirmDialog.show('确定要删除这个奖励吗？', () => {
        API.deleteReward(id);
        populateRewards();
        Toast.show('删除成功', 'success');
    });
}

function deleteActivity(id) {
    ConfirmDialog.show('确定要删除这个活动吗？', () => {
        API.deleteActivity(id);
        populateActivities();
        Toast.show('删除成功', 'success');
    });
}

function deleteNews(id) {
    ConfirmDialog.show('确定要删除这个资讯吗？', () => {
        API.deleteNews(id);
        populateNews();
        Toast.show('删除成功', 'success');
    });
}

function deleteUser(id) {
    ConfirmDialog.show('确定要删除这个用户吗？', () => {
        API.deleteUser(id);
        populateUsers();
        Toast.show('删除成功', 'success');
    });
}

// Setup notifications and messages
function setupNotifications() {
    const notificationBtn = document.querySelector('header .relative:nth-child(1) button');
    const messageBtn = document.querySelector('header .relative:nth-child(2) button');
    
    notificationBtn.addEventListener('click', () => {
        Toast.show('暂无新通知', 'info');
    });
    
    messageBtn.addEventListener('click', () => {
        Toast.show('暂无新消息', 'info');
    });
}

// Setup role management
function setupRoleManagement() {
    const container = document.getElementById('role-form-container');
    if (container) {
        container.innerHTML = `
            <form id="role-form">
                <div class="mb-4">
                    <label for="role-name" class="block mb-2">角色名称</label>
                    <input type="text" id="role-name" class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                </div>
                <div class="mb-4">
                    <label class="block mb-2">权限</label>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="dashboard">
                            <span>数据概览</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="devices">
                            <span>设备监控</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="analytics">
                            <span>数据分析</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="operations">
                            <span>运营管理</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="ai-monitoring">
                            <span>AI监控</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="categories">
                            <span>分类管理</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="rewards">
                            <span>积分奖励</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="leaderboard">
                            <span>排行榜</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="activities">
                            <span>活动管理</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="news">
                            <span>资讯管理</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="users">
                            <span>用户管理</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="logs">
                            <span>操作日志</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="role-permission" value="settings">
                            <span>系统设置</span>
                        </label>
                    </div>
                </div>
                <button type="submit" class="btn-primary w-full py-2 rounded-lg">添加角色</button>
            </form>
        `;
        
        const roleForm = document.getElementById('role-form');
        roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roleName = document.getElementById('role-name').value;
            const permissions = Array.from(document.querySelectorAll('.role-permission:checked')).map(cb => cb.value);
            
            Toast.show(`角色 ${roleName} 创建成功，权限：${permissions.join(', ')}`, 'success');
            roleForm.reset();
        });
    }
}

// New functions for smart features

function populateDevices() {
    const devices = API.getDevices();
    const tbody = document.getElementById('devices-tbody');
    if (tbody) {
        tbody.innerHTML = devices.map(device => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <td class="p-2 font-medium">${device.id}</td>
                <td class="p-2">${device.name}</td>
                <td class="p-2">${device.location.address}</td>
                <td class="p-2">
                    <span class="status-badge ${device.status}">
                        ${device.status === 'normal' ? '正常' : 
                          device.status === 'warning' ? '需要清理' : 
                          device.status === 'error' ? '故障' : '离线'}
                    </span>
                </td>
                <td class="p-2">
                    <div class="flex items-center space-x-2">
                        <div class="progress-bar flex-1">
                            <div class="progress-bar-fill ${
                                device.capacity.current < 50 ? 'low' : 
                                device.capacity.current < 80 ? 'medium' : 'high'
                            }" style="width: ${device.capacity.current}%"></div>
                        </div>
                        <span class="text-sm">${device.capacity.current}%</span>
                    </div>
                </td>
                <td class="p-2">${device.temperature}°C</td>
                <td class="p-2">
                    <div class="flex items-center space-x-2">
                        <div class="progress-bar flex-1">
                            <div class="progress-bar-fill ${
                                device.battery > 50 ? 'low' : 
                                device.battery > 20 ? 'medium' : 'high'
                            }" style="width: ${device.battery}%"></div>
                        </div>
                        <span class="text-sm">${device.battery}%</span>
                    </div>
                </td>
                <td class="p-2 space-x-2">
                    <button class="text-blue-500 hover:text-blue-700" onclick="viewDeviceDetails('${device.id}')">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="text-green-500 hover:text-green-700" onclick="editDevice('${device.id}')">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="restartDevice('${device.id}')">
                        <i data-lucide="refresh-cw"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        lucide.createIcons();
        renderDeviceMap(devices);
    }
}

function renderDeviceMap(devices) {
    const mapContainer = document.getElementById('device-map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="device-map-container">
                <svg width="100%" height="100%" viewBox="0 0 800 600" class="bg-blue-50 dark:bg-blue-900/30">
                    <!-- Background grid -->
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(79, 70, 229, 0.1)" stroke-width="1"/>
                    </pattern>
                    <rect width="800" height="600" fill="url(#grid)" />
                    
                    <!-- Main roads -->
                    <path d="M 0 300 H 800" stroke="rgba(79, 70, 229, 0.3)" stroke-width="8" />
                    <path d="M 400 0 V 600" stroke="rgba(79, 70, 229, 0.3)" stroke-width="8" />
                    
                    <!-- Secondary roads -->
                    <path d="M 0 200 H 800" stroke="rgba(79, 70, 229, 0.2)" stroke-width="4" />
                    <path d="M 0 400 H 800" stroke="rgba(79, 70, 229, 0.2)" stroke-width="4" />
                    <path d="M 200 0 V 600" stroke="rgba(79, 70, 229, 0.2)" stroke-width="4" />
                    <path d="M 600 0 V 600" stroke="rgba(79, 70, 229, 0.2)" stroke-width="4" />
                    
                    <!-- Device markers -->
                    ${devices.map(device => {
                        const x = ((device.location.lng - 116.35) / 0.1) * 800;
                        const y = ((39.95 - device.location.lat) / 0.1) * 600;
                        return `
                            <circle 
                                cx="${x}" 
                                cy="${y}" 
                                r="6" 
                                class="device-marker ${device.status}"
                                data-device-id="${device.id}"
                                onclick="showDeviceTooltip(event, '${device.id}')"
                            />
                        `;
                    }).join('')}
                </svg>
            </div>
        `;
    }
}

function populateAnalytics() {
    const analyticsData = API.getAnalyticsData();
    
    // Monthly trend chart
    const monthlyTrendCtx = document.getElementById('monthly-trend-chart');
    if (monthlyTrendCtx) {
        new Chart(monthlyTrendCtx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [{
                    label: '投递量',
                    data: analyticsData.monthlyTrend,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    
    // Accuracy chart
    const accuracyCtx = document.getElementById('accuracy-chart');
    if (accuracyCtx) {
        new Chart(accuracyCtx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '分类准确率 (%)',
                    data: analyticsData.accuracy,
                    borderColor: 'var(--success-color)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 90,
                        max: 100
                    }
                }
            }
        });
    }
    
    // User activity chart
    const userActivityCtx = document.getElementById('user-activity-chart');
    if (userActivityCtx) {
        new Chart(userActivityCtx, {
            type: 'bar',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '活跃用户数',
                    data: analyticsData.userActivity,
                    backgroundColor: 'var(--secondary-color)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    
    // Device efficiency chart
    const deviceEfficiencyCtx = document.getElementById('device-efficiency-chart');
    if (deviceEfficiencyCtx) {
        const topDevices = analyticsData.deviceEfficiency
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 10);
            
        new Chart(deviceEfficiencyCtx, {
            type: 'bar',
            data: {
                labels: topDevices.map(d => d.id),
                datasets: [{
                    label: '使用效率 (%)',
                    data: topDevices.map(d => d.efficiency),
                    backgroundColor: 'var(--accent-color)'
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
    }
}

function populateOperations() {
    // Populate tasks
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        const tasks = API.getTasks();
        tasksList.innerHTML = tasks.map(task => `
            <li class="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <div class="flex items-center space-x-3">
                    <span class="w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' : 
                        task.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                    }"></span>
                    <div>
                        <p class="font-medium">${task.title}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">设备: ${task.deviceId}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 rounded-full ${
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }">${
                        task.status === 'pending' ? '待处理' :
                        task.status === 'in-progress' ? '处理中' : '已完成'
                    }</span>
                    <button class="text-blue-500 hover:text-blue-700" onclick="startTask('${task.id}')">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="text-green-500 hover:text-green-700" onclick="completeTask('${task.id}')">
                        <i data-lucide="check"></i>
                    </button>
                </div>
            </li>
        `).join('');
        lucide.createIcons();
    }
    
    // Populate maintenance schedule
    const maintenanceSchedule = document.getElementById('maintenance-schedule');
    if (maintenanceSchedule) {
        const schedule = API.getMaintenanceSchedule();
        maintenanceSchedule.innerHTML = `
            <div class="space-y-3">
                ${schedule.map(item => `
                    <div class="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">${item.deviceId}</span>
                            <span class="text-sm text-gray-500 dark:text-gray-400">${item.date}</span>
                        </div>
                        <p class="text-sm">${item.type}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">技术员: ${item.technician}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function populateAIMonitoring() {
    // Populate AI alerts
    const aiAlertsContainer = document.getElementById('ai-alerts');
    if (aiAlertsContainer) {
        const alerts = API.getAIAlerts();
        aiAlertsContainer.innerHTML = alerts.map(alert => `
            <div class="ai-alert-card p-4 rounded-lg border bg-white dark:bg-gray-800">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-lg">${alert.type}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${alert.deviceName} - ${alert.timestamp}</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${
                        alert.status === 'pending' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }">${alert.status === 'pending' ? '待处理' : '已处理'}</span>
                </div>
                <p class="mb-3">${alert.description}</p>
                <div class="ai-suggestion mb-3">
                    <p class="text-sm font-medium text-purple-600 dark:text-purple-400">AI建议:</p>
                    <p class="text-sm">${alert.suggestion}</p>
                </div>
                ${alert.status === 'pending' ? `
                    <button class="btn-primary text-sm px-3 py-1" onclick="processAlert('${alert.id}')">
                        标记为已处理
                    </button>
                ` : ''}
            </div>
        `).join('');
    }
    
    // Populate smart schedule
    const smartScheduleContainer = document.getElementById('smart-schedule');
    if (smartScheduleContainer) {
        const schedule = API.getSmartSchedule();
        smartScheduleContainer.innerHTML = `
            <div class="space-y-4">
                ${schedule.routes.map(route => `
                    <div class="p-4 rounded-lg border bg-white dark:bg-gray-800">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="font-bold text-lg">${route.name}</h4>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs px-2 py-1 rounded-full ${
                                    route.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                    route.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }">${
                                    route.priority === 'high' ? '高优先级' :
                                    route.priority === 'medium' ? '中优先级' : '低优先级'
                                }</span>
                                <span class="text-sm text-gray-500 dark:text-gray-400">⏱ ${route.estimatedTime}</span>
                            </div>
                        </div>
                        <p class="text-sm mb-3">${route.reason}</p>
                        <div class="mb-3">
                            <p class="text-sm font-medium mb-1">涉及设备:</p>
                            <div class="flex flex-wrap gap-2">
                                ${route.devices.map(deviceId => `
                                    <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">${deviceId}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button class="btn-primary text-sm px-3 py-1">生成任务</button>
                            <button class="btn-secondary text-sm px-3 py-1">导出路线</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Device management functions
function viewDeviceDetails(deviceId) {
    const device = API.getDevice(deviceId);
    if (device) {
        Toast.show(`查看设备 ${device.name} 的详细信息`, 'info');
        // Here you would typically show a detailed modal or navigate to a detail page
    }
}

function editDevice(deviceId) {
    const device = API.getDevice(deviceId);
    if (device) {
        Toast.show(`编辑设备 ${device.name}`, 'info');
        // Here you would typically show an edit modal
    }
}

function restartDevice(deviceId) {
    ConfirmDialog.show(`确定要重启设备 ${deviceId} 吗？`, () => {
        API.updateDeviceStatus(deviceId, 'restarting');
        Toast.show(`设备 ${deviceId} 正在重启...`, 'success');
        setTimeout(() => {
            API.updateDeviceStatus(deviceId, 'normal');
            populateDevices();
            Toast.show(`设备 ${deviceId} 重启成功`, 'success');
        }, 2000);
    });
}

// Task management functions
function startTask(taskId) {
    API.updateTaskStatus(taskId, 'in-progress');
    populateOperations();
    Toast.show('任务已开始', 'success');
}

function completeTask(taskId) {
    API.updateTaskStatus(taskId, 'completed');
    populateOperations();
    Toast.show('任务已完成', 'success');
}

// AI Alert management
function processAlert(alertId) {
    API.processAIAlert(alertId);
    populateAIMonitoring();
    Toast.show('告警已标记为已处理', 'success');
}

// Device tooltip
function showDeviceTooltip(event, deviceId) {
    const device = API.getDevice(deviceId);
    if (device) {
        // Create tooltip
        let tooltip = document.getElementById('device-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'device-tooltip';
            tooltip.className = 'absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 text-sm';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <div class="font-bold">${device.name}</div>
            <div class="text-gray-500 dark:text-gray-400">${device.id}</div>
            <div class="mt-1">状态: <span class="font-medium">${
                device.status === 'normal' ? '正常' : 
                device.status === 'warning' ? '需要清理' : 
                device.status === 'error' ? '故障' : '离线'
            }</span></div>
            <div>容量: ${device.capacity.current}%</div>
            <div>电量: ${device.battery}%</div>
        `;
        
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY + 10 + 'px';
        tooltip.style.display = 'block';
        
        // Hide tooltip when clicking elsewhere
        document.addEventListener('click', hideDeviceTooltip);
    }
}

function hideDeviceTooltip() {
    const tooltip = document.getElementById('device-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
    document.removeEventListener('click', hideDeviceTooltip);
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