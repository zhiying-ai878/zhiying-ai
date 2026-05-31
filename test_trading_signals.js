import axios from 'axios';

// 测试买卖信号生成
async function testTradingSignals() {
  console.log('=== 测试买卖信号生成 ===');
  
  // 测试股票列表
  const stockCodes = ['600519', '002594', '000001', '601318'];
  
  for (const code of stockCodes) {
    console.log(`\n测试股票: ${code}`);
    
    try {
      // 获取K线数据
      const klineData = await fetchKLineData(code);
      if (klineData.length === 0) {
        console.log(`无法获取${code}的K线数据`);
        continue;
      }
      
      console.log(`获取到${klineData.length}条K线数据`);
      
      // 计算技术指标并生成信号
      const signals = generateTradingSignals(code, klineData);
      console.log(`生成的信号:`, signals);
      
    } catch (error) {
      console.error(`测试${code}失败:`, error);
    }
  }
}

// 获取K线数据
async function fetchKLineData(code) {
  const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
  
  try {
    const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
      params: {
        secid,
        klt: 101, // 日线
        fqt: 1,   // 前复权
        lmt: 60,  // 60条数据
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    if (response.data && response.data.data && response.data.data.klines) {
      const klines = response.data.data.klines;
      const data = [];
      
      for (const kline of klines) {
        const values = kline.split(',');
        if (values.length >= 6) {
          data.push({
            date: values[0],
            open: parseFloat(values[1]) / 100,
            high: parseFloat(values[2]) / 100,
            low: parseFloat(values[3]) / 100,
            close: parseFloat(values[4]) / 100,
            volume: parseInt(values[5]),
            amount: parseFloat(values[6]) || 0
          });
        }
      }
      
      return data;
    }
  } catch (error) {
    console.error(`获取${code}K线数据失败:`, error);
  }
  
  return [];
}

// 生成买卖信号
function generateTradingSignals(stockCode, klineData) {
  const signals = [];
  
  // 计算技术指标
  const prices = klineData.map(d => d.close);
  
  // RSI指标计算
  const rsiValues = calculateRSI(prices, 14);
  
  // MACD指标计算
  const macdValues = calculateMACD(prices, 12, 26, 9);
  
  // KDJ指标计算
  const kdjValues = calculateKDJ(klineData, 9, 3, 3);
  
  // 生成信号
  for (let i = 0; i< klineData.length; i++) {
    const data = klineData[i];
    const rsi = rsiValues[i];
    const macd = macdValues[i];
    const kdj = kdjValues[i];
    
    const signal = {
      date: data.date,
      price: data.close,
      rsi: rsi,
      macd: macd,
      kdj: kdj,
      buySignal: false,
      sellSignal: false,
      buyPrice: null,
      sellPrice: null,
      confidence: 0
    };
    
    // RSI买入信号: RSI <30
    if (rsi && rsi< 30) {
      signal.buySignal = true;
      signal.buyPrice = data.close * 0.99; // 稍微低于当前价格作为买入价
      signal.confidence += 30;
    }
    
    // RSI卖出信号: RSI >70
    if (rsi && rsi >70) {
      signal.sellSignal = true;
      signal.sellPrice = data.close * 1.01; // 稍微高于当前价格作为卖出价
      signal.confidence += 30;
    }
    
    // MACD金叉买入信号
    if (macd && i > 0 && macd.macd >0 && macdValues[i-1].macd< 0) {
      signal.buySignal = true;
      signal.buyPrice = data.close * 0.99;
      signal.confidence += 25;
    }
    
    // MACD死叉卖出信号
    if (macd && i >0 && macd.macd< 0 && macdValues[i-1].macd >0) {
      signal.sellSignal = true;
      signal.sellPrice = data.close * 1.01;
      signal.confidence += 25;
    }
    
    // KDJ买入信号: K上穿D
    if (kdj && i >0 && kdj.k >kdj.d && kdjValues[i-1].k< kdjValues[i-1].d) {
      signal.buySignal = true;
      signal.buyPrice = data.close * 0.99;
      signal.confidence += 25;
    }
    
    // KDJ卖出信号: K下穿D
    if (kdj && i >0 && kdj.k< kdj.d && kdjValues[i-1].k >kdjValues[i-1].d) {
      signal.sellSignal = true;
      signal.sellPrice = data.close * 1.01;
      signal.confidence += 25;
    }
    
    // 只保留有信号的日期
    if (signal.buySignal || signal.sellSignal) {
      signals.push(signal);
    }
  }
  
  return signals.slice(-10); // 返回最近10个信号
}

// RSI计算
function calculateRSI(prices, period) {
  const rsiValues = [];
  
  for (let i = period; i < prices.length; i++) {
    let gains = 0;
    let losses = 0;
    
    for (let j = 0; j< period; j++) {
      const change = prices[i - j] - prices[i - j - 1];
      if (change >0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    rsiValues.push(rsi);
  }
  
  // 填充前面的空值
  return Array(period).fill(null).concat(rsiValues);
}

// MACD计算
function calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macdLine = [];
  for (let i = 0; i< prices.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  const histogram = [];
  for (let i = 0; i < prices.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }
  
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    result.push({
      macd: macdLine[i],
      signal: signalLine[i],
      histogram: histogram[i]
    });
  }
  
  return result;
}

// EMA计算
function calculateEMA(prices, period) {
  const emaValues = [];
  const k = 2 / (period + 1);
  
  emaValues.push(prices[0]);
  
  for (let i = 1; i< prices.length; i++) {
    emaValues.push(prices[i] * k + emaValues[i-1] * (1 - k));
  }
  
  return emaValues;
}

// KDJ计算
function calculateKDJ(klineData, n, m1, m2) {
  const kdjValues = [];
  
  for (let i = n - 1; i < klineData.length; i++) {
    let highest = klineData[i].high;
    let lowest = klineData[i].low;
    
    for (let j = 0; j< n; j++) {
      highest = Math.max(highest, klineData[i - j].high);
      lowest = Math.min(lowest, klineData[i - j].low);
    }
    
    const rsv = (klineData[i].close - lowest) / (highest - lowest) * 100;
    
    let k, d, j;
    if (i === n - 1) {
      k = 50;
      d = 50;
    } else {
      k = (2 / 3) * kdjValues[i - n].k + (1 / 3) * rsv;
      d = (2 / 3) * kdjValues[i - n].d + (1 / 3) * k;
    }
    
    j = 3 * k - 2 * d;
    
    kdjValues.push({ k, d, j });
  }
  
  // 填充前面的空值
  return Array(n - 1).fill(null).concat(kdjValues);
}

// 运行测试
testTradingSignals().catch(console.error);
