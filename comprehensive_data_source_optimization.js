// 智盈AI全面数据源优化配置
// 根据图片内容实施智能优化措施

export const comprehensiveDataSources = {
    // ==============================================
    // 核心数据源 - 主优先级
    // ==============================================
    sina: {
        name: '新浪财经',
        url: 'https://money.finance.sina.com.cn',
        apiUrl: 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getStockTick',
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 8000,
        priority: 190,
        enabled: true,
        rateLimit: {
            maxRequests: 100,
            perMinute: true,
            cooldownTime: 500
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 100,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    tencent: {
        name: '腾讯财经',
        url: 'https://stock.gtimg.cn',
        apiUrl: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline',
        headers: {
            'Referer': 'https://stock.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 8000,
        priority: 185,
        enabled: true,
        rateLimit: {
            maxRequests: 100,
            perMinute: true,
            cooldownTime: 500
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 100,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    eastmoney: {
        name: '东方财富',
        url: 'https://www.eastmoney.com',
        apiUrl: 'https://push2.eastmoney.com/api/qt/stock/get',
        headers: {
            'Referer': 'https://www.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 180,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 券商数据源 - 修复SSL错误和超时问题
    // ==============================================
    huatai: {
        name: '华泰证券',
        url: 'https://www.htsc.com.cn',
        apiUrl: 'https://www.htsc.com.cn',
        headers: {
            'Referer': 'https://www.htsc.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 20000,
        priority: 85,
        enabled: true,
        sslConfig: {
            rejectUnauthorized: false
        },
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 500,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    gtja: {
        name: '国泰君安',
        url: 'https://www.gtja.com',
        apiUrl: 'https://www.gtja.com',
        headers: {
            'Referer': 'https://www.gtja.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 25000,
        priority: 85,
        enabled: true,
        sslConfig: {
            rejectUnauthorized: false
        },
        rateLimit: {
            maxRequests: 30,
            perMinute: true,
            cooldownTime: 2000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 1000,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 120000,
            testCode: '600519'
        }
    },
    
    haitong: {
        name: '海通证券',
        url: 'https://www.htsec.com',
        apiUrl: 'https://www.htsec.com',
        headers: {
            'Referer': 'https://www.htsec.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 25000,
        priority: 85,
        enabled: true,
        sslConfig: {
            rejectUnauthorized: false
        },
        rateLimit: {
            maxRequests: 30,
            perMinute: true,
            cooldownTime: 2000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 1000,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 120000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 专业金融数据源 - 修复超时和404错误
    // ==============================================
    wind: {
        name: '万得',
        url: 'https://www.wind.com.cn',
        apiUrl: 'https://www.wind.com.cn',
        headers: {
            'Referer': 'https://www.wind.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 90,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    choice: {
        name: 'Choice',
        url: 'https://www.choiceinfo.com',
        apiUrl: 'https://www.choiceinfo.com',
        headers: {
            'Referer': 'https://www.choiceinfo.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 20000,
        priority: 88,
        enabled: true,
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 500,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    tushare: {
        name: 'Tushare',
        url: 'https://tushare.pro',
        apiUrl: 'https://api.tushare.pro',
        headers: {
            'Referer': 'https://tushare.pro/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 87,
        enabled: true,
        rateLimit: {
            maxRequests: 100,
            perMinute: true,
            cooldownTime: 500
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    akshare: {
        name: 'AKShare',
        url: 'https://akshare.readthedocs.io',
        apiUrl: 'https://akshare.readthedocs.io',
        headers: {
            'Referer': 'https://akshare.readthedocs.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 86,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    baostock: {
        name: 'Baostock',
        url: 'https://www.baostock.com',
        apiUrl: 'https://www.baostock.com',
        headers: {
            'Referer': 'https://www.baostock.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 85,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // API服务提供商 - 修复410和连接拒绝错误
    // ==============================================
    stockapi: {
        name: '股票API',
        url: 'https://api.stockdata.org',
        apiUrl: 'https://api.stockdata.org/v1/data/quote',
        headers: {
            'Referer': 'https://api.stockdata.org/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 60,
        enabled: true,
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 500,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 120000,
            testCode: '600519'
        }
    },
    
    mairui: {
        name: '迈瑞',
        url: 'https://www.mairui.club',
        apiUrl: 'https://www.mairui.club',
        headers: {
            'Referer': 'https://www.mairui.club/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 82,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    alltick: {
        name: 'AllTick',
        url: 'https://www.alltick.co',
        apiUrl: 'https://www.alltick.co',
        headers: {
            'Referer': 'https://www.alltick.co/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 83,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    sanhulianghua: {
        name: '三虎量化',
        url: 'https://api.sanhulianghua.com',
        apiUrl: 'https://api.sanhulianghua.com',
        headers: {
            'Referer': 'https://api.sanhulianghua.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 20000,
        priority: 50,
        enabled: true,
        rateLimit: {
            maxRequests: 30,
            perMinute: true,
            cooldownTime: 2000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 1000,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 180000,
            testCode: '600519'
        }
    },
    
    qveris: {
        name: 'QVeris',
        url: 'https://www.qveris.com',
        apiUrl: 'https://www.qveris.com',
        headers: {
            'Referer': 'https://www.qveris.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 84,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 国际数据源
    // ==============================================
    finnhub: {
        name: 'Finnhub',
        url: 'https://finnhub.io',
        apiUrl: 'https://finnhub.io/api/v1/quote',
        headers: {
            'Referer': 'https://finnhub.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 95,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    netease: {
        name: '网易财经',
        url: 'https://money.163.com',
        apiUrl: 'https://money.163.com',
        headers: {
            'Referer': 'https://money.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 92,
        enabled: true,
        rateLimit: {
            maxRequests: 100,
            perMinute: true,
            cooldownTime: 500
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 移动数据源 - 修复超时问题
    // ==============================================
    eastmoney_mobile: {
        name: '东方财富移动版',
        url: 'https://m.eastmoney.com',
        apiUrl: 'https://m.eastmoney.com',
        headers: {
            'Referer': 'https://m.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 88,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    sina_mobile: {
        name: '新浪财经移动版',
        url: 'https://finance.sina.cn',
        apiUrl: 'https://finance.sina.cn',
        headers: {
            'Referer': 'https://finance.sina.cn/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 87,
        enabled: true,
        rateLimit: {
            maxRequests: 100,
            perMinute: true,
            cooldownTime: 500
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    tencent_mobile: {
        name: '腾讯财经移动版',
        url: 'https://finance.qq.com',
        apiUrl: 'https://finance.qq.com',
        headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 86,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 新闻数据源
    // ==============================================
    jrj: {
        name: '金融界',
        url: 'https://www.jrj.com.cn',
        apiUrl: 'https://www.jrj.com.cn',
        headers: {
            'Referer': 'https://www.jrj.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 80,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    hexun: {
        name: '和讯',
        url: 'https://www.hexun.com',
        apiUrl: 'https://www.hexun.com',
        headers: {
            'Referer': 'https://www.hexun.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 79,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    stcn: {
        name: '证券时报',
        url: 'https://www.stcn.com',
        apiUrl: 'https://www.stcn.com',
        headers: {
            'Referer': 'https://www.stcn.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 78,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    yicai: {
        name: '第一财经',
        url: 'https://www.yicai.com',
        apiUrl: 'https://www.yicai.com',
        headers: {
            'Referer': 'https://www.yicai.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 77,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 备用数据源 - 提高可用性
    // ==============================================
    sina_backup: {
        name: '新浪财经备用',
        url: 'https://finance.sina.com.cn',
        apiUrl: 'https://finance.sina.com.cn/stock/',
        headers: {
            'Referer': 'https://finance.sina.com.cn/stock/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 175,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    tencent_backup: {
        name: '腾讯财经备用',
        url: 'https://finance.qq.com',
        apiUrl: 'https://finance.qq.com/stock/',
        headers: {
            'Referer': 'https://finance.qq.com/stock/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 170,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    eastmoney_backup: {
        name: '东方财富备用',
        url: 'https://quote.eastmoney.com',
        apiUrl: 'https://quote.eastmoney.com/',
        headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 165,
        enabled: true,
        rateLimit: {
            maxRequests: 70,
            perMinute: true,
            cooldownTime: 700
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 扩展数据源 - 增加数据来源多样性
    // ==============================================
    xueqiu: {
        name: '雪球',
        url: 'https://xueqiu.com',
        apiUrl: 'https://xueqiu.com/stock/',
        headers: {
            'Referer': 'https://xueqiu.com/stock/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 160,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    ths: {
        name: '同花顺',
        url: 'https://www.10jqka.com.cn',
        apiUrl: 'https://www.10jqka.com.cn/',
        headers: {
            'Referer': 'https://www.10jqka.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 155,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    eastmoney_mini: {
        name: '东方财富Mini',
        url: 'https://mini.eastmoney.com',
        apiUrl: 'https://mini.eastmoney.com/',
        headers: {
            'Referer': 'https://mini.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 150,
        enabled: true,
        rateLimit: {
            maxRequests: 80,
            perMinute: true,
            cooldownTime: 600
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 30000,
            testCode: '600519'
        }
    },
    
    eastmoney_pro: {
        name: '东方财富专业版',
        url: 'https://pro.eastmoney.com',
        apiUrl: 'https://pro.eastmoney.com/',
        headers: {
            'Referer': 'https://pro.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 145,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    futunn: {
        name: '富途牛牛',
        url: 'https://www.futunn.com',
        apiUrl: 'https://www.futunn.com/',
        headers: {
            'Referer': 'https://www.futunn.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 140,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    tiger: {
        name: '老虎证券',
        url: 'https://www.tigersecurities.com',
        apiUrl: 'https://www.tigersecurities.com/',
        headers: {
            'Referer': 'https://www.tigersecurities.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 135,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 3,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 45000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 新闻数据源扩展
    // ==============================================
    cnstock: {
        name: '中国证券网',
        url: 'https://www.cnstock.com',
        apiUrl: 'https://www.cnstock.com/',
        headers: {
            'Referer': 'https://www.cnstock.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 76,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    financialnews: {
        name: '金融新闻网',
        url: 'https://www.financialnews.com.cn',
        apiUrl: 'https://www.financialnews.com.cn/',
        headers: {
            'Referer': 'https://www.financialnews.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 75,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    zqrb: {
        name: '证券日报',
        url: 'https://www.zqrb.com',
        apiUrl: 'https://www.zqrb.com/',
        headers: {
            'Referer': 'https://www.zqrb.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 55,
        enabled: true,
        rateLimit: {
            maxRequests: 30,
            perMinute: true,
            cooldownTime: 2000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 1000,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 180000,
            testCode: '600519'
        }
    },
    
    cnstocknews: {
        name: '中国证券新闻网',
        url: 'https://www.cnstocknews.com',
        apiUrl: 'https://www.cnstocknews.com/',
        headers: {
            'Referer': 'https://www.cnstocknews.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 25000,
        priority: 50,
        enabled: true,
        rateLimit: {
            maxRequests: 30,
            perMinute: true,
            cooldownTime: 2000
        },
        retryConfig: {
            maxRetries: 1,
            baseDelay: 1000,
            exponentialBackoff: false
        },
        healthCheck: {
            enabled: true,
            interval: 180000,
            testCode: '600519'
        }
    },
    
    jrj_mobile: {
        name: '金融界移动版',
        url: 'https://m.jrj.com.cn',
        apiUrl: 'https://m.jrj.com.cn/',
        headers: {
            'Referer': 'https://m.jrj.com.cn/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 72,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    hexun_mobile: {
        name: '和讯移动版',
        url: 'https://m.hexun.com',
        apiUrl: 'https://m.hexun.com/',
        headers: {
            'Referer': 'https://m.hexun.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 71,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    stcn_mobile: {
        name: '证券时报移动版',
        url: 'https://m.stcn.com',
        apiUrl: 'https://m.stcn.com/',
        headers: {
            'Referer': 'https://m.stcn.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 70,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    yicai_mobile: {
        name: '第一财经移动版',
        url: 'https://m.yicai.com',
        apiUrl: 'https://m.yicai.com/',
        headers: {
            'Referer': 'https://m.yicai.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 10000,
        priority: 69,
        enabled: true,
        rateLimit: {
            maxRequests: 60,
            perMinute: true,
            cooldownTime: 800
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 200,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 备用数据源 - 最低优先级
    // ==============================================
    xueqiu_backup: {
        name: '雪球备用',
        url: 'https://xueqiu.com/hq',
        apiUrl: 'https://xueqiu.com/hq/',
        headers: {
            'Referer': 'https://xueqiu.com/hq/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 60,
        enabled: true,
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    ths_backup: {
        name: '同花顺备用',
        url: 'https://www.10jqka.com.cn/stock/',
        apiUrl: 'https://www.10jqka.com.cn/stock/',
        headers: {
            'Referer': 'https://www.10jqka.com.cn/stock/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 55,
        enabled: true,
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 300,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    },
    
    // ==============================================
    // 最低优先级数据源
    // ==============================================
    backup_1: {
        name: '备用数据源1',
        url: 'https://finance.sina.com.cn',
        apiUrl: 'https://finance.sina.com.cn/',
        headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        },
        timeout: 15000,
        priority: 30,
        enabled: true,
        rateLimit: {
            maxRequests: 50,
            perMinute: true,
            cooldownTime: 1000
        },
        retryConfig: {
            maxRetries: 2,
            baseDelay: 500,
            exponentialBackoff: true
        },
        healthCheck: {
            enabled: true,
            interval: 60000,
            testCode: '600519'
        }
    }
};
