
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function testDataSource() {
    console.log('开始测试数据源连接...');
    
    try {
        // 测试本地文件
        console.log('测试本地文件...');
        const stockListPath = path.join('./src/utils', 'stockList.json');
        if (fs.existsSync(stockListPath)) {
            const stockListData = fs.readFileSync(stockListPath, 'utf8');
            const stockList = JSON.parse(stockListData);
            console.log(`成功从本地文件获取${stockList.length}只A股股票`);
        } else {
            console.log('本地文件不存在');
        }
        
        // 测试东方财富数据源
        console.log('测试东方财富数据源...');
        const shResponse = await axios.get('https://push2.eastmoney.com/api/qt/clist/get', {
            params: {
                cb: 'jQuery1124010095947680688758_1710739200000',
                type: '11',
                pageindex: '1',
                pagesize: '10',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });

        console.log('东方财富数据源连接成功!');
        console.log('响应数据:', shResponse.data.substring(0, 200) + '...');
        
    } catch (error) {
        console.error('数据源连接失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testDataSource();
