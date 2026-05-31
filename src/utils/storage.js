// 存储工具函数
// 加密函数
export const encryptData = (data) => {
    // 这里使用简单的Base64编码作为示例，实际应用中应该使用更安全的加密方法
    return btoa(unescape(encodeURIComponent(data)));
};
// 解密函数
export const decryptData = (encryptedData) => {
    return decodeURIComponent(escape(atob(encryptedData)));
};
// 存储数据到本地存储
export const setStorageItem = (key, value) => {
    try {
        const encryptedValue = encryptData(JSON.stringify(value));
        localStorage.setItem(key, encryptedValue);
        return true;
    }
    catch (error) {
        console.error('存储数据失败:', error);
        return false;
    }
};
// 从本地存储获取数据
export const getStorageItem = (key) => {
    try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue)
            return null;
        const decryptedValue = decryptData(encryptedValue);
        return JSON.parse(decryptedValue);
    }
    catch (error) {
        console.error('获取数据失败:', error);
        // 如果解密失败，清除存储的信息
        localStorage.removeItem(key);
        return null;
    }
};
// 从本地存储删除数据
export const removeStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    }
    catch (error) {
        console.error('删除数据失败:', error);
        return false;
    }
};
// 清除所有本地存储数据
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    }
    catch (error) {
        console.error('清除存储失败:', error);
        return false;
    }
};
// 存储用户信息
export const saveUserInfo = (userInfo) => {
    return setStorageItem('userInfo', userInfo);
};
// 获取用户信息
export const getUserInfo = () => {
    const userInfo = getStorageItem('userInfo');
    // 检查token是否过期
    if (userInfo && userInfo.expiresAt < Date.now()) {
        removeStorageItem('userInfo');
        return null;
    }
    return userInfo;
};
// 存储交易设置
export const saveTradeSettings = (settings) => {
    return setStorageItem('tradeSettings', settings);
};
// 获取交易设置
export const getTradeSettings = () => {
    return getStorageItem('tradeSettings');
};
// 存储AI策略设置
export const saveStrategySettings = (settings) => {
    return setStorageItem('strategySettings', settings);
};
// 获取AI策略设置
export const getStrategySettings = () => {
    return getStorageItem('strategySettings');
};
// 存储交易历史
export const saveTradeHistory = (trades) => {
    return setStorageItem('tradeHistory', trades);
};
// 获取交易历史
export const getTradeHistory = () => {
    const history = getStorageItem('tradeHistory');
    return history || [];
};
// 获取当前用户
const getCurrentUser = () => {
    try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            return currentUser.username || null;
        }
        return null;
    }
    catch (error) {
        console.error('获取当前用户失败:', error);
        return null;
    }
};
// 获取用户特定的存储key
const getUserStorageKey = (baseKey) => {
    const username = getCurrentUser();
    return username ? `${baseKey}_${username}` : baseKey;
};
// 存储自选股票
export const saveWatchlist = (stocks) => {
    const key = getUserStorageKey('watchlist');
    return setStorageItem(key, stocks);
};
// 获取自选股票
export const getWatchlist = () => {
    const key = getUserStorageKey('watchlist');
    const watchlist = getStorageItem(key);
    return watchlist || [];
};
// 添加股票到自选
export const addToWatchlist = (stock) => {
    const watchlist = getWatchlist();
    const exists = watchlist.some(item => item.code === stock.code);
    if (!exists) {
        watchlist.push(stock);
        return saveWatchlist(watchlist);
    }
    return true;
};
// 从自选中删除股票
export const removeFromWatchlist = (code) => {
    const watchlist = getWatchlist();
    // 处理代码格式不匹配问题 - 支持带前缀和不带前缀的代码匹配
    const filtered = watchlist.filter(item => {
        // 完全匹配
        if (item.code === code)
            return false;
        // 处理带前缀和不带前缀的情况
        const itemCodeNoPrefix = item.code.startsWith('sh') || item.code.startsWith('sz') ? item.code.substring(2) : item.code;
        const targetCodeNoPrefix = code.startsWith('sh') || code.startsWith('sz') ? code.substring(2) : code;
        if (itemCodeNoPrefix === targetCodeNoPrefix)
            return false;
        // 尝试反向匹配（如果存储的是不带前缀的，而传入的是带前缀的）
        if (!item.code.startsWith('sh') && !item.code.startsWith('sz')) {
            const prefixedItemCode = item.code.startsWith('6') ? `sh${item.code}` : `sz${item.code}`;
            if (prefixedItemCode === code)
                return false;
        }
        return true;
    });
    return saveWatchlist(filtered);
};

// ==================== 数据导出/导入功能 ====================

// 导出所有数据
export const exportAllData = () => {
    try {
        const exportData = {
            version: '1.0',
            exportTime: new Date().toISOString(),
            data: {}
        };

        // 收集所有需要导出的数据
        const keysToExport = [
            'portfolio',
            'currentUser',
            'signalHistory',
            'tradeSettings',
            'strategySettings',
            'tradeHistory',
            'watchlist',
            'encryptionKey'
        ];

        // 获取当前用户名，处理带用户名的key
        const username = getCurrentUser();
        if (username) {
            keysToExport.push(`watchlist_${username}`);
        }

        // 遍历localStorage，导出所有相关数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                if (keysToExport.some(exportKey => key.includes(exportKey))) {
                    exportData.data[key] = localStorage.getItem(key);
                }
            }
        }

        // 生成JSON并格式化
        return JSON.stringify(exportData, null, 2);
    } catch (error) {
        console.error('导出数据失败:', error);
        throw new Error('数据导出失败');
    }
};

// 下载导出文件
export const downloadExportFile = (filename) => {
    try {
        const dataStr = exportAllData();
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `zhiying-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('数据导出成功');
    } catch (error) {
        console.error('下载导出文件失败:', error);
        throw new Error('文件下载失败');
    }
};

// 导入数据
export const importAllData = (jsonString) => {
    try {
        const importData = JSON.parse(jsonString);

        // 验证数据格式
        if (!importData.version || !importData.data) {
            throw new Error('无效的备份文件格式');
        }

        // 确认导入
        const confirmed = window.confirm(
            `即将导入备份数据（${new Date(importData.exportTime).toLocaleString('zh-CN')}）\n\n` +
            '注意：这将覆盖当前所有数据，是否继续？'
        );

        if (!confirmed) {
            return false;
        }

        // 先备份当前数据（以防万一）
        try {
            const currentBackup = exportAllData();
            const backupBlob = new Blob([currentBackup], { type: 'application/json' });
            const backupUrl = URL.createObjectURL(backupBlob);
            const backupLink = document.createElement('a');
            backupLink.href = backupUrl;
            backupLink.download = `zhiying-ai-auto-backup-before-import-${Date.now()}.json`;
            document.body.appendChild(backupLink);
            backupLink.click();
            document.body.removeChild(backupLink);
            URL.revokeObjectURL(backupUrl);
        } catch (e) {
            console.log('自动备份失败，但继续导入');
        }

        // 清空现有数据
        localStorage.clear();

        // 导入数据
        Object.keys(importData.data).forEach(key => {
            const value = importData.data[key];
            if (value !== null && value !== undefined) {
                localStorage.setItem(key, value);
            }
        });

        console.log('数据导入成功');
        alert('数据导入成功！请刷新页面查看。');

        return true;
    } catch (error) {
        console.error('导入数据失败:', error);
        alert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
        return false;
    }
};

// 触发文件选择并导入
export const triggerImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    importAllData(content);
                } catch (error) {
                    console.error('读取文件失败:', error);
                    alert('文件读取失败');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
};

// ==================== GitHub Gist 云同步功能 ====================

// Gist 配置存储 key
const GIST_CONFIG_KEY = 'gistSyncConfig';

// 获取 Gist 配置
export const getGistConfig = () => {
    try {
        const config = getStorageItem(GIST_CONFIG_KEY);
        return config;
    } catch (error) {
        console.error('获取Gist配置失败:', error);
        return null;
    }
};

// 保存 Gist 配置
export const saveGistConfig = (config) => {
    try {
        return setStorageItem(GIST_CONFIG_KEY, config);
    } catch (error) {
        console.error('保存Gist配置失败:', error);
        return false;
    }
};

// 创建新的 Gist
const createNewGist = async (githubToken, data) => {
    const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            description: '智盈AI数据备份',
            public: false,
            files: {
                'zhiying-ai-backup.json': {
                    content: data
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`创建Gist失败: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
};

// 更新 Gist
const updateGist = async (githubToken, gistId, data) => {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            description: `智盈AI数据备份 - ${new Date().toLocaleString('zh-CN')}`,
            files: {
                'zhiying-ai-backup.json': {
                    content: data
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`更新Gist失败: ${response.status}`);
    }
};

// 从 Gist 获取数据
const getFromGist = async (githubToken, gistId) => {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'GET',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`获取Gist失败: ${response.status}`);
    }

    const result = await response.json();
    const file = result.files['zhiying-ai-backup.json'];
    if (!file) {
        throw new Error('备份文件不存在');
    }

    return file.content;
};

// 同步数据到云端
export const syncToCloud = async (showSuccessMessage = true) => {
    try {
        const config = getGistConfig();
        if (!config || !config.githubToken) {
            if (showSuccessMessage) {
                alert('请先配置云同步设置！');
            }
            return false;
        }

        const data = exportAllData();

        if (config.gistId) {
            await updateGist(config.githubToken, config.gistId, data);
        } else {
            const gistId = await createNewGist(config.githubToken, data);
            config.gistId = gistId;
            saveGistConfig(config);
        }

        if (showSuccessMessage) {
            message.success('☁️ 云同步成功！');
        }
        console.log('云同步成功');
        return true;
    } catch (error) {
        console.error('云同步失败:', error);
        message.error(`云同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
        return false;
    }
};

// 从云端同步数据
export const syncFromCloud = async () => {
    try {
        const config = getGistConfig();
        if (!config || !config.githubToken || !config.gistId) {
            alert('请先配置云同步设置！');
            return false;
        }

        const data = await getFromGist(config.githubToken, config.gistId);
        importAllData(data);
        return true;
    } catch (error) {
        console.error('从云端同步失败:', error);
        message.error(`从云端同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
        return false;
    }
};

// 开启自动同步
let autoSyncInterval = null;

export const startAutoSync = () => {
    const config = getGistConfig();
    if (config?.autoSync && config?.githubToken) {
        // 每5分钟自动同步一次
        autoSyncInterval = setInterval(() => {
            syncToCloud(false);
        }, 5 * 60 * 1000);
        console.log('自动同步已启动');
    }
};

export const stopAutoSync = () => {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
        console.log('自动同步已停止');
    }
};
