// 智盈AI全面数据源测试脚本
// 测试优化后的所有45个数据源连接状态

import axios from 'axios';
import { comprehensiveDataSources } from './comprehensive_data_source_optimization.js';
import { smartDataRequest, getDataSourceStatus, getBestDataSourceRecommendation } from './smart_data_source_manager.js';

class ComprehensiveDataSourceTester {
    constructor() {
        this.dataSources = comprehensiveDataSources;
        this.testResults = {};
        this.testCode = '600519'; // 贵州茅台作为测试股票
        this.logger = console;
    }
    
    // 测试单个数据源
    async testDataSource(source, config) {
        const startTime = Date.now();
        
        try {
            const axiosConfig = {
                timeout: config.timeout,
                headers: config.headers,
                ...(config.sslConfig && {
                    httpsAgent: new (await import('https')).Agent({
                        rejectUnauthorized: config.sslConfig.rejectUnauthorized,
                        secureOptions: config.sslConfig.secureOptions || 0
                    })
                })
            };
            
            // 根据数据源类型选择测试方法
            let result;
            switch (source) {
                case 'sina':
                    result = await this.testSinaDataSource(axiosConfig);
                    break;
                case 'tencent':
                    result = await this.testTencentDataSource(axiosConfig);
                    break;
                case 'eastmoney':
                    result = await this.testEastmoneyDataSource(axiosConfig);
                    break;
                default:
                    result = await this.testGenericDataSource(config.url, axiosConfig);
                    break;
            }
            
            const responseTime = Date.now() - startTime;
            
            return {
                status: 'success',
                responseTime,
                statusCode: result.status,
                data: result.data ? 'Data received' : 'No data',
                message: 'Connection successful'
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            return {
                status: 'failure',
                responseTime,
                error: error.message || String(error),
                errorCode: error.code,
                statusCode: error.response?.status,
                message: 'Connection failed'
            };
        }
    }
    
    // 测试新浪数据源
    async testSinaDataSource(config) {
        const url = 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getStockTick';
        const params = {
            symbol: `sh${this.testCode}`
        };
        
        const response = await axios.get(url, { ...config, params });
        return {
            status: response.status,
            data: response.data && Array.isArray(response.data) && response.data.length > 0
        };
    }
    
    // 测试腾讯数据源
    async testTencentDataSource(config) {
        const url = 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline';
        const params = {
            param: `1.${this.testCode},day,1,1000`
        };
        
        const response = await axios.get(url, { ...config, params });
        return {
            status: response.status,
            data: response.data && typeof response.data === 'object'
        };
    }
    
    // 测试东方财富数据源
    async testEastmoneyDataSource(config) {
        const url = 'https://push2.eastmoney.com/api/qt/stock/get';
        const params = {
            secid: `1.${this.testCode}`,
            fields: 'f1,f2,f3,f4,f5,f6,f12,f13,f14'
        };
        
        const response = await axios.get(url, { ...config, params });
        return {
            status: response.status,
            data: response.data && response.data.data
        };
    }
    
    // 测试通用数据源
    async testGenericDataSource(url, config) {
        const response = await axios.get(url, config);
        return {
            status: response.status,
            data: response.data !== undefined
        };
    }
    
    // 测试智能数据源管理器
    async testSmartDataSourceManager() {
        try {
            const result = await smartDataRequest([this.testCode]);
            return {
                status: 'success',
                dataReceived: result && result.length > 0,
                message: 'Smart data request successful'
            };
        } catch (error) {
            return {
                status: 'failure',
                error: error.message || String(error),
                message: 'Smart data request failed'
            };
        }
    }
    
    // 执行全面测试
    async runComprehensiveTest() {
        console.log('=== 智盈AI全面数据源测试 ===\n');
        
        const categories = {
            '核心数据源': ['sina', 'tencent', 'eastmoney'],
            '券商数据源': ['huatai', 'gtja', 'haitong'],
            '专业金融数据源': ['wind', 'choice', 'tushare', 'akshare', 'baostock'],
            'API服务提供商': ['stockapi', 'mairui', 'alltick', 'sanhulianghua', 'qveris'],
            '国际数据源': ['finnhub', 'netease'],
            '移动数据源': ['eastmoney_mobile', 'sina_mobile', 'tencent_mobile'],
            '新闻数据源': ['jrj', 'hexun', 'stcn', 'yicai'],
            '备用数据源': ['sina_backup', 'tencent_backup', 'eastmoney_backup'],
            '扩展数据源': ['xueqiu', 'ths', 'eastmoney_mini', 'eastmoney_pro', 'futunn', 'tiger'],
            '新闻数据源扩展': ['cnstock', 'financialnews', 'zqrb', 'cnstocknews', 'jrj_mobile', 'hexun_mobile', 'stcn_mobile', 'yicai_mobile'],
            '最低优先级数据源': ['xueqiu_backup', 'ths_backup', 'backup_1']
        };
        
        let totalCount = 0;
        let successfulCount = 0;
        
        // 分类测试数据源
        for (const [category, sources] of Object.entries(categories)) {
            console.log(`📊 ${category}:`);
            this.testResults[category] = [];
            
            for (const source of sources) {
                totalCount++;
                const config = this.dataSources[source];
                
                if (!config) {
                    console.log(`  ⚠️  ${source}: 配置未定义`);
                    this.testResults[category].push({
                        name: source,
                        status: '配置缺失',
                        message: 'Configuration not found'
                    });
                    continue;
                }
                
                console.log(`  🔍 测试 ${source}...`);
                
                const result = await this.testDataSource(source, config);
                this.testResults[category].push({
                    name: source,
                    ...result
                });
                
                if (result.status === 'success') {
                    successfulCount++;
                    console.log(`  ✅ ${source}: 连接成功 (${result.statusCode}) - ${result.responseTime}ms`);
                } else {
                    console.log(`  ❌ ${source}: 连接失败 - ${result.error}`);
                }
            }
            console.log('');
        }
        
        // 测试智能数据源管理器
        console.log('🤖 测试智能数据源管理器:');
        const smartManagerResult = await this.testSmartDataSourceManager();
        if (smartManagerResult.status === 'success') {
            console.log('  ✅ 智能数据源管理器: 工作正常');
        } else {
            console.log(`  ❌ 智能数据源管理器: ${smartManagerResult.error}`);
        }
        console.log('');
        
        // 获取状态报告
        const statusReport = getDataSourceStatus();
        const bestSources = getBestDataSourceRecommendation();
        
        // 生成测试报告
        this.generateTestReport(totalCount, successfulCount, statusReport, bestSources);
        
        return {
            total: totalCount,
            successful: successfulCount,
            successRate: (successfulCount / totalCount) * 100,
            details: this.testResults,
            statusReport,
            bestSources
        };
    }
    
    // 生成测试报告
    generateTestReport(totalCount, successfulCount, statusReport, bestSources) {
        console.log('=== 测试结果总结 ===');
        console.log(`总数据源数: ${totalCount}`);
        console.log(`连接成功: ${successfulCount}/${totalCount}`);
        console.log(`连接成功率: ${((successfulCount / totalCount) * 100).toFixed(2)}%`);
        
        console.log('\n=== 分类统计 ===');
        for (const [category, results] of Object.entries(this.testResults)) {
            const success = results.filter(r => r.status === 'success').length;
            const total = results.length;
            console.log(`${category}: ${success}/${total} (${((success / total) * 100).toFixed(2)}%)`);
        }
        
        console.log('\n=== 数据源状态报告 ===');
        console.log(`健康数据源: ${statusReport.healthySources}`);
        console.log(`不健康数据源: ${statusReport.unhealthySources}`);
        console.log(`未知状态数据源: ${statusReport.unknownSources}`);
        console.log(`失败数据源: ${statusReport.failedSources.length}`);
        
        if (bestSources.length > 0) {
            console.log('\n=== 推荐的最佳数据源 ===');
            bestSources.slice(0, 5).forEach((source, index) => {
                console.log(`${index + 1}. ${source}`);
            });
        }
        
        console.log('\n=== 详细测试结果 ===');
        for (const [category, results] of Object.entries(this.testResults)) {
            console.log(`\n${category}:`);
            results.forEach(result => {
                const status = result.status === 'success' ? '✅' : '❌';
                const info = result.status === 'success' 
                    ? `${result.statusCode} - ${result.responseTime}ms`
                    : result.error || 'Unknown error';
                console.log(`  ${status} ${result.name}: ${info}`);
            });
        }
    }
    
    // 保存测试报告到文件
    async saveTestReport(results) {
        const fs = await import('fs');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: results.total,
                successful: results.successful,
                successRate: results.successRate
            },
            categoryResults: results.details,
            statusReport: results.statusReport,
            bestSources: results.bestSources
        };
        
        fs.default.writeFileSync('data_source_test_report.json', JSON.stringify(report, null, 2));
        console.log('\n📊 测试报告已保存到: data_source_test_report.json');
    }
}

// 运行测试
async function runTests() {
    const tester = new ComprehensiveDataSourceTester();
    
    try {
        console.log('🚀 开始执行全面数据源测试...');
        const results = await tester.runComprehensiveTest();
        await tester.saveTestReport(results);
        
        console.log('\n🎉 测试完成！');
        console.log(`总体成功率: ${results.successRate.toFixed(2)}%`);
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 执行测试
runTests().catch(console.error);