// Mock API for Smart Garbage Collection System
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
    
    // New data models for smart features
    let devices = Array.from({ length: 56 }, (_, i) => ({
        id: `DEV${String(i + 1).padStart(3, '0')}`,
        name: `智能回收箱 ${i + 1}`,
        location: {
            lat: 39.9042 + (Math.random() - 0.5) * 0.1,
            lng: 116.4074 + (Math.random() - 0.5) * 0.1,
            address: `北京市朝阳区某某街道${i + 1}号`
        },
        status: ['normal', 'warning', 'error', 'offline'][Math.floor(Math.random() * 4)],
        capacity: {
            total: 100,
            current: Math.floor(Math.random() * 100)
        },
        temperature: 25 + Math.floor(Math.random() * 10),
        lastMaintenance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        battery: 100 - Math.floor(Math.random() * 30),
        categories: [
            { type: '可回收物', capacity: 25, current: Math.floor(Math.random() * 25) },
            { type: '厨余垃圾', capacity: 25, current: Math.floor(Math.random() * 25) },
            { type: '有害垃圾', capacity: 25, current: Math.floor(Math.random() * 25) },
            { type: '其他垃圾', capacity: 25, current: Math.floor(Math.random() * 25) }
        ]
    }));

    let aiAlerts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        deviceId: `DEV${String(Math.floor(Math.random() * 56) + 1).padStart(3, '0')}`,
        deviceName: `智能回收箱 ${Math.floor(Math.random() * 56) + 1}`,
        timestamp: new Date(Date.now() - i * 600000).toLocaleString(),
        type: ['错误投递', '满溢预警', '温度异常', '电池低电量'][Math.floor(Math.random() * 4)],
        description: '检测到用户错误投递塑料瓶到厨余垃圾通道',
        suggestion: '建议引导用户正确分类，塑料瓶应投递到可回收物通道',
        status: ['pending', 'processed'][Math.floor(Math.random() * 2)]
    }));

    let tasks = [
        { id: 1, title: '清理满溢设备', deviceId: 'DEV001', status: 'pending', priority: 'high' },
        { id: 2, title: '修复故障设备', deviceId: 'DEV015', status: 'pending', priority: 'urgent' },
        { id: 3, title: '例行维护', deviceId: 'DEV023', status: 'scheduled', priority: 'medium' },
        { id: 4, title: '电池更换', deviceId: 'DEV045', status: 'pending', priority: 'medium' }
    ];

    let maintenanceSchedule = [
        { id: 1, deviceId: 'DEV001', date: '2024-12-20', technician: '张师傅', type: '例行保养' },
        { id: 2, deviceId: 'DEV002', date: '2024-12-21', technician: '李师傅', type: '故障维修' },
        { id: 3, deviceId: 'DEV003', date: '2024-12-22', technician: '王师傅', type: '升级固件' }
    ];

    return {
        getDashboardData: () => {
            return {
                totalDeliveries: 12345,
                activeUsers: 5678,
                totalPoints: 89012,
                wrongDeliveries: 123,
                trend: [120, 190, 300, 500, 200, 300, 450],
                categories: [300, 50, 100, 80],
                deviceStats: {
                    normal: devices.filter(d => d.status === 'normal').length,
                    warning: devices.filter(d => d.status === 'warning').length,
                    error: devices.filter(d => d.status === 'error').length,
                    offline: devices.filter(d => d.status === 'offline').length
                }
            };
        },
        
        // Device-related APIs
        getDevices: () => devices,
        getDevice: (id) => devices.find(d => d.id === id),
        updateDeviceStatus: (id, status) => {
            const device = devices.find(d => d.id === id);
            if (device) {
                device.status = status;
                return device;
            }
            return null;
        },
        
        // AI Monitoring APIs
        getAIAlerts: () => aiAlerts,
        processAIAlert: (id) => {
            const alert = aiAlerts.find(a => a.id === id);
            if (alert) {
                alert.status = 'processed';
                return alert;
            }
            return null;
        },
        
        // Operations APIs
        getTasks: () => tasks,
        updateTaskStatus: (id, status) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = status;
                return task;
            }
            return null;
        },
        getMaintenanceSchedule: () => maintenanceSchedule,
        
        // Analytics APIs
        getAnalyticsData: () => {
            return {
                monthlyTrend: [1200, 1900, 3000, 5000, 2000, 3000, 4500, 5200, 4800, 5600, 6200, 7000],
                accuracy: [95.2, 96.1, 97.3, 98.0, 98.5, 99.1],
                userActivity: [1200, 1500, 1800, 2100, 2500, 2800, 3200],
                deviceEfficiency: devices.map(d => ({
                    id: d.id,
                    efficiency: Math.random() * 30 + 70
                }))
            };
        },
        
        // Smart scheduling
        getSmartSchedule: () => {
            return {
                routes: [
                    {
                        id: 1,
                        name: '东区路线',
                        devices: ['DEV001', 'DEV002', 'DEV003', 'DEV004', 'DEV005'],
                        estimatedTime: '2小时',
                        priority: 'high',
                        reason: '多台设备满溢预警'
                    },
                    {
                        id: 2,
                        name: '西区路线',
                        devices: ['DEV010', 'DEV011', 'DEV012'],
                        estimatedTime: '1.5小时',
                        priority: 'medium',
                        reason: '例行清理'
                    }
                ]
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
        getNewsItem: (id) => news.find(n => n.id == id),
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