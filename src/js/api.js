// Mock API for Garbage Sorting Backend
const API = (() => {
    // In-memory data storage
    let categories = [
        { id: 1, name: '可回收物', icon: 'recycle', points: 10 },
        { id: 2, name: '厨余垃圾', icon: 'apple', points: 5 },
        { id: 3, name: '有害垃圾', icon: 'shield-alert', points: 15 },
        { id: 4, name: '其他垃圾', icon: 'trash-2', points: 2 },
    ];
    let rewards = [
        { id: 1, name: '铅笔', points: 50, stock: 100 },
        { id: 2, name: '笔记本', points: 100, stock: 50 },
        { id: 3, name: '环保袋', points: 150, stock: 30 },
    ];
    let activities = [
        { id: 1, name: '地球日活动', start: '2024-04-22', end: '2024-04-28', status: '进行中' },
        { id: 2, name: '垃圾分类知识竞赛', start: '2024-05-01', end: '2024-05-07', status: '即将开始' },
    ];
    let news = [
        { id: 1, title: '新版垃圾分类指南发布', date: '2024-04-20', content: '...' },
        { id: 2, title: '垃圾分类，从我做起', date: '2024-04-15', content: '...' },
    ];
    let users = [
        { id: 1, username: 'admin', email: 'admin@example.com', registered: '2024-01-01', status: '活跃' },
        { id: 2, username: 'user1', email: 'user1@example.com', registered: '2024-02-01', status: '活跃' },
    ];

    return {
        getDashboardData: () => {
            return {
                totalDeliveries: 12345,
                activeUsers: 5678,
                totalPoints: 89012,
                wrongDeliveries: 123,
                trend: [120, 190, 300, 500, 200, 300, 450],
                categories: [300, 50, 100, 80]
            };
        },
        getCategories: () => categories,
        getRewards: () => rewards,
        getLeaderboard: () => [
            { rank: 1, user: '小明', deliveries: 120, points: 1200 },
            { rank: 2, user: '小红', deliveries: 100, points: 1000 },
            { rank: 3, user: '小李', deliveries: 90, points: 900 },
        ],
        getActivities: () => activities,
        getNews: () => news,
        getUsers: () => users,
        
        // Get single item
        getCategory: (id) => categories.find(c => c.id == id),
        getReward: (id) => rewards.find(r => r.id == id),
        getActivity: (id) => activities.find(a => a.id == id),
        getNews: (id) => news.find(n => n.id == id),
        getUser: (id) => users.find(u => u.id == id),

        // Create
        createCategory: (category) => {
            const newCategory = { id: Date.now(), ...category };
            categories.push(newCategory);
            return newCategory;
        },
        createReward: (reward) => {
            const newReward = { id: Date.now(), ...reward };
            rewards.push(newReward);
            return newReward;
        },
        createActivity: (activity) => {
            const newActivity = { id: Date.now(), ...activity };
            activities.push(newActivity);
            return newActivity;
        },
        createNews: (newsItem) => {
            const newNews = { id: Date.now(), ...newsItem };
            news.push(newNews);
            return newNews;
        },
        createUser: (user) => {
            const newUser = { id: Date.now(), ...user };
            users.push(newUser);
            return newUser;
        },

        // Update
        updateCategory: (id, data) => {
            const index = categories.findIndex(c => c.id == id);
            if (index !== -1) {
                categories[index] = { ...categories[index], ...data, id: parseInt(id) };
                return categories[index];
            }
            return null;
        },
        updateReward: (id, data) => {
            const index = rewards.findIndex(r => r.id == id);
            if (index !== -1) {
                rewards[index] = { ...rewards[index], ...data, id: parseInt(id) };
                return rewards[index];
            }
            return null;
        },
        updateActivity: (id, data) => {
            const index = activities.findIndex(a => a.id == id);
            if (index !== -1) {
                activities[index] = { ...activities[index], ...data, id: parseInt(id) };
                return activities[index];
            }
            return null;
        },
        updateNews: (id, data) => {
            const index = news.findIndex(n => n.id == id);
            if (index !== -1) {
                news[index] = { ...news[index], ...data, id: parseInt(id) };
                return news[index];
            }
            return null;
        },
        updateUser: (id, data) => {
            const index = users.findIndex(u => u.id == id);
            if (index !== -1) {
                users[index] = { ...users[index], ...data, id: parseInt(id) };
                return users[index];
            }
            return null;
        },

        // Delete
        deleteCategory: (id) => {
            const index = categories.findIndex(c => c.id == id);
            if (index !== -1) {
                categories.splice(index, 1);
                return { success: true };
            }
            return { success: false };
        },
        deleteReward: (id) => {
            const index = rewards.findIndex(r => r.id == id);
            if (index !== -1) {
                rewards.splice(index, 1);
                return { success: true };
            }
            return { success: false };
        },
        deleteActivity: (id) => {
            const index = activities.findIndex(a => a.id == id);
            if (index !== -1) {
                activities.splice(index, 1);
                return { success: true };
            }
            return { success: false };
        },
        deleteNews: (id) => {
            const index = news.findIndex(n => n.id == id);
            if (index !== -1) {
                news.splice(index, 1);
                return { success: true };
            }
            return { success: false };
        },
        deleteUser: (id) => {
            const index = users.findIndex(u => u.id == id);
            if (index !== -1) {
                users.splice(index, 1);
                return { success: true };
            }
            return { success: false };
        },

        getLogs: () => Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            time: new Date(Date.now() - i * 600000).toLocaleString(),
            user: ['admin', 'user1', 'user2'][Math.floor(Math.random() * 3)],
            action: ['新增分类', '删除奖励', '编辑活动', '查看排行榜'][Math.floor(Math.random() * 4)]
        })),
    };
})();