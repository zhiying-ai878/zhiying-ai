// 修复股票列表获取问题
import axios from 'axios';

async function testNewAPI() {
    console.log('=== 测试新的股票列表API ===');
    
    try {
        // 测试东方财富的新API端点
        const testCases = [
            {
                name: '东方财富沪深A股列表',
                url: 'https://push2.eastmoney.com/api/qt/clist/get',
                params: {
                    cb: 'jQuery11240' + Date.now(),
                    type: '11',
                    pageindex: '1',
                    pagesize: '500',
                    fields: 'f12,f14',
                    _: Date.now().toString()
                }
            },
            {
                name: '东方财富深市A股列表',
                url: 'https://push2.eastmoney.com/api/qt/clist/get',
                params: {
                    cb: 'jQuery11240' + Date.now(),
                    type: '12',
                    pageindex: '1',
                    pagesize: '500',
                    fields: 'f12,f14',
                    _: Date.now().toString()
                }
            },
            {
                name: '东方财富创业板列表',
                url: 'https://push2.eastmoney.com/api/qt/clist/get',
                params: {
                    cb: 'jQuery11240' + Date.now(),
                    type: '21',
                    pageindex: '1',
                    pagesize: '500',
                    fields: 'f12,f14',
                    _: Date.now().toString()
                }
            },
            {
                name: '东方财富科创板列表',
                url: 'https://push2.eastmoney.com/api/qt/clist/get',
                params: {
                    cb: 'jQuery11240' + Date.now(),
                    type: '81',
                    pageindex: '1',
                    pagesize: '500',
                    fields: 'f12,f14',
                    _: Date.now().toString()
                }
            },
            {
                name: '东方财富中小板列表',
                url: 'https://push2.eastmoney.com/api/qt/clist/get',
                params: {
                    cb: 'jQuery11240' + Date.now(),
                    type: '31',
                    pageindex: '1',
                    pagesize: '500',
                    fields: 'f12,f14',
                    _: Date.now().toString()
                }
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n测试: ${testCase.name}`);
            try {
                const response = await axios.get(testCase.url, {
                    params: testCase.params,
                    headers: {
                        'Referer': 'https://quote.eastmoney.com/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        'Connection': 'keep-alive'
                    },
                    timeout: 10000
                });
                
                console.log(`状态码: ${response.status}`);
                
                const jsonpMatch = response.data.match(/\((.*)\)/);
                if (jsonpMatch) {
                    try {
                        const data = JSON.parse(jsonpMatch[1]);
                        console.log(`返回码: ${data.rc}`);
                        if (data.data && data.data.diff) {
                            console.log(`获取到 ${data.data.diff.length} 只股票`);
                            console.log(`前5只股票:`, data.data.diff.slice(0, 5).map(item => ({
                                code: item.f12,
                                name: item.f14
                            })));
                        } else {
                            console.log(`数据为空:`, data);
                        }
                    } catch (parseError) {
                        console.log(`JSON解析失败:`, parseError.message);
                    }
                } else {
                    console.log(`非JSONP响应`);
                }
                
            } catch (error) {
                console.log(`请求失败:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('测试过程出错:', error);
    }
    
    console.log('\n=== 测试完成 ===');
}

testNewAPI();
