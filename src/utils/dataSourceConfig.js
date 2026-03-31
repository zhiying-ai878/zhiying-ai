// 默认数据源配置
export const DEFAULT_DATA_SOURCE_CONFIGS = {
    sina: {
        source: 'sina',
        enabled: true,
        priority: 5,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive'
        }
    },
    tencent: {
        source: 'tencent',
        enabled: true,
        priority: 1,
        timeout: 2000,
        retryCount: 3,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 10,
        healthCheckInterval: 30000,
        failoverThreshold: 5,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive'
        }
    },
    eastmoney: {
        source: 'eastmoney',
        enabled: true,
        priority: 10,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 1,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    },
    xueqiu: {
        source: 'xueqiu',
        enabled: true,
        priority: 12,
        timeout: 4000,
        retryCount: 1,
        retryDelay: 150,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://xueqiu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    ths: {
        source: 'ths',
        enabled: true,
        priority: 2,
        timeout: 3000,
        retryCount: 2,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    huatai: {
        source: 'huatai',
        enabled: true,
        priority: 15,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 300000,
        failoverThreshold: 1,
        recoveryInterval: 600000,
        headers: {
            'Referer': 'https://www.htsc.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    gtja: {
        source: 'gtja',
        enabled: true,
        priority: 16,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 300000,
        failoverThreshold: 1,
        recoveryInterval: 600000,
        headers: {
            'Referer': 'https://www.gtja.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    haitong: {
        source: 'haitong',
        enabled: true,
        priority: 17,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 300000,
        failoverThreshold: 1,
        recoveryInterval: 600000,
        headers: {
            'Referer': 'https://www.htsec.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    wind: {
        source: 'wind',
        enabled: true,
        priority: 18,
        timeout: 10000,
        retryCount: 1,
        retryDelay: 500,
        requestInterval: 1000,
        maxConcurrentRequests: 1,
        healthCheckInterval: 600000,
        failoverThreshold: 1,
        recoveryInterval: 1800000,
        headers: {
            'Referer': 'https://www.wind.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    choice: {
        source: 'choice',
        enabled: true,
        priority: 19,
        timeout: 10000,
        retryCount: 1,
        retryDelay: 500,
        requestInterval: 1000,
        maxConcurrentRequests: 1,
        healthCheckInterval: 600000,
        failoverThreshold: 1,
        recoveryInterval: 1800000,
        headers: {
            'Referer': 'https://www.choice.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    tushare: {
        source: 'tushare',
        enabled: true,
        priority: 3,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://tushare.pro/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    akshare: {
        source: 'akshare',
        enabled: true,
        priority: 14,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 1000,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://www.akshare.xyz/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    baostock: {
        source: 'baostock',
        enabled: true,
        priority: 4,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'http://baostock.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    gugudata: {
        source: 'gugudata',
        enabled: true,
        priority: 13,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://www.gugudata.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    stockapi: {
        source: 'stockapi',
        enabled: true,
        priority: 11,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://stockapi.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    mairui: {
        source: 'mairui',
        enabled: true,
        priority: 14,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'http://api.mairui.club/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    alltick: {
        source: 'alltick',
        enabled: true,
        priority: 15,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://www.alltick.co/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    sanhulianghua: {
        source: 'sanhulianghua',
        enabled: true,
        priority: 16,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://www.sanhulianghua.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    qveris: {
        source: 'qveris',
        enabled: true,
        priority: 20,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://qveris.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Authorization': 'Bearer your_qveris_api_key'
        }
    },
    finnhub: {
        source: 'finnhub',
        enabled: true,
        priority: 21,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://finnhub.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Finnhub-Token': 'your_finnhub_api_key'
        }
    },
    netease: {
        source: 'netease',
        enabled: true,
        priority: 6,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://quotes.money.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    sina_backup: {
        source: 'sina_backup',
        enabled: true,
        priority: 7,
        timeout: 3000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    tencent_backup: {
        source: 'tencent_backup',
        enabled: true,
        priority: 8,
        timeout: 2000,
        retryCount: 3,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 10,
        healthCheckInterval: 30000,
        failoverThreshold: 5,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    eastmoney_backup: {
        source: 'eastmoney_backup',
        enabled: true,
        priority: 9,
        timeout: 5000,
        retryCount: 1,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 1,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    ths_backup: {
        source: 'ths_backup',
        enabled: true,
        priority: 22,
        timeout: 3000,
        retryCount: 2,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    xueqiu_backup: {
        source: 'xueqiu_backup',
        enabled: true,
        priority: 23,
        timeout: 4000,
        retryCount: 1,
        retryDelay: 150,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 120000,
        failoverThreshold: 2,
        recoveryInterval: 300000,
        headers: {
            'Referer': 'https://xueqiu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    eastmoney_mini: {
        source: 'eastmoney_mini',
        enabled: true,
        priority: 2,
        timeout: 2000,
        retryCount: 1,
        retryDelay: 100,
        requestInterval: 100,
        maxConcurrentRequests: 10,
        healthCheckInterval: 30000,
        failoverThreshold: 5,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    },
    eastmoney_pro: {
        source: 'eastmoney_pro',
        enabled: true,
        priority: 1,
        timeout: 3000,
        retryCount: 2,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    }
};
// 获取启用的数据源配置
export function getEnabledDataSources() {
    return Object.values(DEFAULT_DATA_SOURCE_CONFIGS)
        .filter(config => config.enabled)
        .sort((a, b) => a.priority - b.priority);
}
// 获取数据源配置
export function getDataSourceConfig(source) {
    return DEFAULT_DATA_SOURCE_CONFIGS[source];
}
// 更新数据源配置
export function updateDataSourceConfig(source, config) {
    DEFAULT_DATA_SOURCE_CONFIGS[source] = {
        ...DEFAULT_DATA_SOURCE_CONFIGS[source],
        ...config
    };
}
// 启用/禁用数据源
export function setDataSourceEnabled(source, enabled) {
    DEFAULT_DATA_SOURCE_CONFIGS[source].enabled = enabled;
}
