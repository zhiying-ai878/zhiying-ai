// 智盈AI优化后的数据源配置
export const optimizedDataSources = {
    // 券商数据源
    huatai: {
        name: '华泰证券',
        url: 'https://www.htsc.com.cn',
        headers: {
            'Referer': 'https://www.htsc.com.cn',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        priority: 85,
        enabled: true
    },
    gtja: {
        name: '国泰君安',
        url: 'https://www.gtja.com',
        headers: {
            'Referer': 'https://www.gtja.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        priority: 85,
        enabled: true
    },
    haitong: {
        name: '海通证券',
        url: 'https://www.htsec.com',
        headers: {
            'Referer': 'https://www.htsec.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        priority: 85,
        enabled: true
    },
    
    // 专业金融数据源
    wind: {
        name: '万得',
        url: 'https://www.wind.com.cn',
        headers: {
            'Referer': 'https://www.wind.com.cn',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 90,
        enabled: true
    },
    choice: {
        name: 'Choice',
        url: 'https://www.choiceinfo.com',
        headers: {
            'Referer': 'https://www.choiceinfo.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        priority: 88,
        enabled: true
    },
    tushare: {
        name: 'Tushare',
        url: 'https://tushare.pro',
        headers: {
            'Referer': 'https://tushare.pro',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 87,
        enabled: true
    },
    akshare: {
        name: 'AKShare',
        url: 'https://akshare.readthedocs.io',
        headers: {
            'Referer': 'https://akshare.readthedocs.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 86,
        enabled: true
    },
    baostock: {
        name: 'Baostock',
        url: 'https://www.baostock.com',
        headers: {
            'Referer': 'https://www.baostock.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 85,
        enabled: true
    },
    
    // API服务提供商
    stockapi: {
        name: '股票API',
        url: 'https://api.stockdata.org/v1/data/quote',
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 80,
        enabled: true
    },
    mairui: {
        name: '迈瑞',
        url: 'https://www.mairui.club',
        headers: {
            'Referer': 'https://www.mairui.club',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 82,
        enabled: true
    },
    alltick: {
        name: 'AllTick',
        url: 'https://www.alltick.co',
        headers: {
            'Referer': 'https://www.alltick.co',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 83,
        enabled: true
    },
    sanhulianghua: {
        name: '三虎量化',
        url: 'https://www.sanhulianghua.com',
        headers: {
            'Referer': 'https://www.sanhulianghua.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        priority: 75,
        enabled: true
    },
    qveris: {
        name: 'QVeris',
        url: 'https://www.qveris.com',
        headers: {
            'Referer': 'https://www.qveris.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 84,
        enabled: true
    },
    
    // 国际数据源
    finnhub: {
        name: 'Finnhub',
        url: 'https://finnhub.io',
        headers: {
            'Referer': 'https://finnhub.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        priority: 95,
        enabled: true
    },
    netease: {
        name: '网易财经',
        url: 'https://money.163.com',
        headers: {
            'Referer': 'https://money.163.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 92,
        enabled: true
    },
    
    // 移动数据源
    eastmoney_mobile: {
        name: '东方财富移动版',
        url: 'https://m.eastmoney.com',
        headers: {
            'Referer': 'https://m.eastmoney.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        },
        timeout: 5000,
        priority: 88,
        enabled: true
    },
    sina_mobile: {
        name: '新浪财经移动版',
        url: 'https://finance.sina.cn',
        headers: {
            'Referer': 'https://finance.sina.cn',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        },
        timeout: 5000,
        priority: 87,
        enabled: true
    },
    tencent_mobile: {
        name: '腾讯财经移动版',
        url: 'https://stock.finance.qq.com',
        headers: {
            'Referer': 'https://stock.finance.qq.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        },
        timeout: 10000,
        priority: 86,
        enabled: true
    },
    
    // 新闻数据源
    jrj: {
        name: '金融界',
        url: 'https://www.jrj.com.cn',
        headers: {
            'Referer': 'https://www.jrj.com.cn',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 80,
        enabled: true
    },
    hexun: {
        name: '和讯',
        url: 'https://www.hexun.com',
        headers: {
            'Referer': 'https://www.hexun.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 79,
        enabled: true
    },
    stcn: {
        name: '证券时报',
        url: 'https://www.stcn.com',
        headers: {
            'Referer': 'https://www.stcn.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 78,
        enabled: true
    },
    yicai: {
        name: '第一财经',
        url: 'https://www.yicai.com',
        headers: {
            'Referer': 'https://www.yicai.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000,
        priority: 77,
        enabled: true
    }
};
