// 代理配置
export const PROXY_CONFIG = {
    // 启用代理
    enabled: true,
    // 代理服务器地址列表（按优先级排序）
    proxyUrls: [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://proxy.cors.sh/',
        'https://corsproxy.io/?url=',
        'https://cors-proxy.tk/'
    ],
    // 当前使用的代理索引
    currentProxyIndex: 0,
    // 代理请求超时时间
    proxyTimeout: 15000
};

// 默认数据源配置
export const DEFAULT_DATA_SOURCE_CONFIGS = {
    // 优化：腾讯数据源作为主要数据源（支持CORS）
    tencent_cors: {
        source: 'tencent_cors',
        enabled: true,
        priority: 1,
        timeout: 3000,
        retryCount: 4,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 8,
        healthCheckInterval: 15000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯备用接口（成功的备用接口）
    tencent_cors_v2: {
        source: 'tencent_cors_v2',
        enabled: true,
        priority: 2,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯备用接口3（另一个成功的接口）
    tencent_cors_v3: {
        source: 'tencent_cors_v3',
        enabled: true,
        priority: 3,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // Alpha Vantage（支持CORS，作为备用）
    alpha_vantage: {
        source: 'alpha_vantage',
        enabled: true,
        priority: 4,
        timeout: 5000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 1000,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.alphavantage.co/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 同花顺行情中心（支持CORS，新发现的数据源）
    ths_market_center: {
        source: 'ths_market_center',
        enabled: true,
        priority: 5,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口4（支持CORS，新发现的数据源）
    tencent_cors_v4: {
        source: 'tencent_cors_v4',
        enabled: true,
        priority: 6,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://web.ifzq.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 东方财富K线接口（支持CORS，新发现的数据源）
    eastmoney_kline: {
        source: 'eastmoney_kline',
        enabled: true,
        priority: 7,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'http://push2his.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口6（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v6: {
        source: 'tencent_cors_v6',
        enabled: true,
        priority: 8,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口8（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v8: {
        source: 'tencent_cors_v8',
        enabled: true,
        priority: 9,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口10（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v10: {
        source: 'tencent_cors_v10',
        enabled: true,
        priority: 10,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口11（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v11: {
        source: 'tencent_cors_v11',
        enabled: true,
        priority: 11,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口13（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v13: {
        source: 'tencent_cors_v13',
        enabled: true,
        priority: 12,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口15（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v15: {
        source: 'tencent_cors_v15',
        enabled: true,
        priority: 13,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口17（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v17: {
        source: 'tencent_cors_v17',
        enabled: true,
        priority: 14,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 腾讯行情接口19（支持CORS，新发现的数据源，返回完整行情数据）
    tencent_cors_v19: {
        source: 'tencent_cors_v19',
        enabled: true,
        priority: 15,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'https://qt.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 东方财富接口5（支持CORS，新发现的数据源，返回完整K线数据）
    eastmoney_kline_v5: {
        source: 'eastmoney_kline_v5',
        enabled: true,
        priority: 16,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'http://push2his.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 东方财富接口7（支持CORS，新发现的数据源，返回完整K线数据）
    eastmoney_kline_v7: {
        source: 'eastmoney_kline_v7',
        enabled: true,
        priority: 17,
        timeout: 3000,
        retryCount: 3,
        retryDelay: 150,
        requestInterval: 200,
        maxConcurrentRequests: 6,
        healthCheckInterval: 20000,
        failoverThreshold: 2,
        recoveryInterval: 30000,
        headers: {
            'Referer': 'http://push2his.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // Alpha Vantage（支持CORS，国际数据源）
    alpha_vantage_v2: {
        source: 'alpha_vantage_v2',
        enabled: true,
        priority: 18,
        timeout: 5000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 1000,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.alphavantage.co/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 新浪CORS数据源（备用，需要代理）
    sina_cors: {
        source: 'sina_cors',
        enabled: true,
        priority: 5,
        timeout: 8000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        useProxy: true,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 网易CORS数据源（备用，需要代理）
    netease_cors: {
        source: 'netease_cors',
        enabled: true,
        priority: 6,
        timeout: 8000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        useProxy: true,
        headers: {
            'Referer': 'https://quotes.money.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 雪球CORS数据源（备用）
    xueqiu_cors: {
        source: 'xueqiu_cors',
        enabled: true,
        priority: 7,
        timeout: 5000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://xueqiu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 同花顺CORS数据源（备用，需要代理）
    ths_cors: {
        source: 'ths_cors',
        enabled: true,
        priority: 8,
        timeout: 8000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        useProxy: true,
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 咕咕数据（支持CORS，需要APPKEY）
    gugudata: {
        source: 'gugudata',
        enabled: true,
        priority: 9,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.gugudata.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // XTick（支持认证，备用）
    xtick: {
        source: 'xtick',
        enabled: true,
        priority: 10,
        timeout: 5000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 1000,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'http://api.xtick.top/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 新增：上海证券交易所数据源
    sse: {
        source: 'sse',
        enabled: true,
        priority: 2,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 150,
        requestInterval: 400,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 2,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'http://www.sse.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive'
        }
    },
    // 新增：深圳证券交易所数据源
    szse: {
        source: 'szse',
        enabled: true,
        priority: 3,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 150,
        requestInterval: 400,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 2,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'http://www.szse.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive'
        }
    },
    // 优化：新浪财经数据源
    sina: {
        source: 'sina',
        enabled: true,
        priority: 4,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：腾讯财经数据源
    tencent: {
        source: 'tencent',
        enabled: true,
        priority: 5,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：东方财富数据源
    eastmoney: {
        source: 'eastmoney',
        enabled: true,
        priority: 6,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 300,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：同花顺数据源
    ths: {
        source: 'ths',
        enabled: true,
        priority: 7,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 400,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：雪球数据源
    xueqiu: {
        source: 'xueqiu',
        enabled: true,
        priority: 8,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://xueqiu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：券商数据源
    huatai: {
        source: 'huatai',
        enabled: true,
        priority: 9,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.htsc.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    gtja: {
        source: 'gtja',
        enabled: true,
        priority: 10,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.gtja.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    haitong: {
        source: 'haitong',
        enabled: true,
        priority: 11,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.htsec.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：数据服务提供商
    tushare: {
        source: 'tushare',
        enabled: true,
        priority: 12,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://tushare.pro/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    baostock: {
        source: 'baostock',
        enabled: true,
        priority: 13,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'http://baostock.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    akshare: {
        source: 'akshare',
        enabled: true,
        priority: 14,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 1000,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.akshare.xyz/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    gugudata: {
        source: 'gugudata',
        enabled: true,
        priority: 15,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.gugudata.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    stockapi: {
        source: 'stockapi',
        enabled: true,
        priority: 16,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://stockapi.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    mairui: {
        source: 'mairui',
        enabled: true,
        priority: 17,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'http://api.mairui.club/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    alltick: {
        source: 'alltick',
        enabled: true,
        priority: 18,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.alltick.co/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：备用数据源
    sanhulianghua: {
        source: 'sanhulianghua',
        enabled: true,
        priority: 19,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.sanhulianghua.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：国际数据源（备用）
    qveris: {
        source: 'qveris',
        enabled: true,
        priority: 20,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://qveris.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    finnhub: {
        source: 'finnhub',
        enabled: true,
        priority: 21,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finnhub.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：网易财经数据源
    netease: {
        source: 'netease',
        enabled: true,
        priority: 10,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://quotes.money.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：备用数据源
    sina_backup: {
        source: 'sina_backup',
        enabled: true,
        priority: 22,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    tencent_backup: {
        source: 'tencent_backup',
        enabled: true,
        priority: 23,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    eastmoney_backup: {
        source: 'eastmoney_backup',
        enabled: true,
        priority: 24,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 300,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache'
        }
    },
    ths_backup: {
        source: 'ths_backup',
        enabled: true,
        priority: 25,
        timeout: 4000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 400,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    xueqiu_backup: {
        source: 'xueqiu_backup',
        enabled: true,
        priority: 26,
        timeout: 5000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://xueqiu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：东方财富迷你版数据源
    eastmoney_mini: {
        source: 'eastmoney_mini',
        enabled: true,
        priority: 11,
        timeout: 4000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // 优化：东方财富专业版数据源
    eastmoney_pro: {
        source: 'eastmoney_pro',
        enabled: true,
        priority: 12,
        timeout: 5000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 300,
        maxConcurrentRequests: 5,
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        recoveryInterval: 60000,
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // ==============================================
    // 移动数据源（备用）
    // ==============================================
    eastmoney_mobile: {
        source: 'eastmoney_mobile',
        enabled: true,
        priority: 27,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://m.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    sina_mobile: {
        source: 'sina_mobile',
        enabled: true,
        priority: 28,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finance.sina.cn/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    tencent_mobile: {
        source: 'tencent_mobile',
        enabled: true,
        priority: 29,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 5,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // ==============================================
    // 新闻数据源（备用）
    // ==============================================
    jrj: {
        source: 'jrj',
        enabled: true,
        priority: 30,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.jrj.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    hexun: {
        source: 'hexun',
        enabled: true,
        priority: 31,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.hexun.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    stcn: {
        source: 'stcn',
        enabled: true,
        priority: 32,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.stcn.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    yicai: {
        source: 'yicai',
        enabled: true,
        priority: 33,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.yicai.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // ==============================================
    // 扩展数据源（备用）
    // ==============================================
    futunn: {
        source: 'futunn',
        enabled: true,
        priority: 34,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.futunn.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    tiger: {
        source: 'tiger',
        enabled: true,
        priority: 35,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.tigersecurities.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // ==============================================
    // 新闻数据源扩展（备用）
    // ==============================================
    cnstock: {
        source: 'cnstock',
        enabled: true,
        priority: 36,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.cnstock.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    financialnews: {
        source: 'financialnews',
        enabled: true,
        priority: 37,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.financialnews.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    zqrb: {
        source: 'zqrb',
        enabled: true,
        priority: 38,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.zqrb.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    cnstocknews: {
        source: 'cnstocknews',
        enabled: true,
        priority: 39,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://www.cnstocknews.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    jrj_mobile: {
        source: 'jrj_mobile',
        enabled: true,
        priority: 40,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://m.jrj.com.cn/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    hexun_mobile: {
        source: 'hexun_mobile',
        enabled: true,
        priority: 41,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://m.hexun.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    stcn_mobile: {
        source: 'stcn_mobile',
        enabled: true,
        priority: 42,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://m.stcn.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    yicai_mobile: {
        source: 'yicai_mobile',
        enabled: true,
        priority: 43,
        timeout: 6000,
        retryCount: 2,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 2,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://m.yicai.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    },
    // ==============================================
    // 最低优先级数据源
    // ==============================================
    backup_1: {
        source: 'backup_1',
        enabled: true,
        priority: 44,
        timeout: 6000,
        retryCount: 3,
        retryDelay: 200,
        requestInterval: 500,
        maxConcurrentRequests: 3,
        healthCheckInterval: 60000,
        failoverThreshold: 3,
        recoveryInterval: 120000,
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
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
