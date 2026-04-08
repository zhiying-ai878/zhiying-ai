const axios = require('axios');
const StockData = require('../models/StockData');

class StockDataService {
  constructor() {
    this.sources = {
      tencent: {
        url: 'https://qt.gtimg.cn/q=',
        parser: this.parseTencentData.bind(this)
      },
      eastmoney: {
        url: 'https://push2.eastmoney.com/api/qt/stock/get',
        parser: this.parseEastMoneyData.bind(this)
      }
    };
  }

  async fetchStockData(stockCode) {
    // 尝试多个数据源
    for (const [sourceName, source] of Object.entries(this.sources)) {
      try {
        let url;
        if (sourceName === 'tencent') {
          url = `${source.url}${stockCode}`;
        } else if (sourceName === 'eastmoney') {
          url = `${source.url}?secid=${this.formatEastMoneyCode(stockCode)}&ut=fa5fd1943c7b386f172d6893dbfba10b`;
        }

        const response = await axios.get(url, { timeout: 5000 });
        const data = source.parser(response.data, stockCode);
        
        if (data) {
          data.source = sourceName;
          return data;
        }
      } catch (error) {
        console.warn(`从${sourceName}获取数据失败:`, error.message);
      }
    }
    
    throw new Error('无法从任何数据源获取数据');
  }

  parseTencentData(data, stockCode) {
    try {
      const match = data.match(new RegExp(`${stockCode}="([^"]+)"`));
      if (!match) return null;
      
      const fields = match[1].split('~');
      if (fields.length < 32) return null;
      
      return {
        stockCode,
        stockName: fields[1],
        currentPrice: parseFloat(fields[3]),
        change: parseFloat(fields[4]),
        changePercent: parseFloat(fields[32]),
        openPrice: parseFloat(fields[5]),
        highPrice: parseFloat(fields[33]),
        lowPrice: parseFloat(fields[34]),
        volume: parseInt(fields[6]),
        amount: parseFloat(fields[36]),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('解析腾讯数据失败:', error);
      return null;
    }
  }

  parseEastMoneyData(data, stockCode) {
    try {
      if (!data || !data.data) return null;
      
      const d = data.data;
      return {
        stockCode,
        stockName: d.name,
        currentPrice: d.price,
        change: d.change,
        changePercent: d.changepercent,
        openPrice: d.open,
        highPrice: d.high,
        lowPrice: d.low,
        volume: d.volume,
        amount: d.amount,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('解析东方财富数据失败:', error);
      return null;
    }
  }

  formatEastMoneyCode(stockCode) {
    if (stockCode.startsWith('6')) {
      return `1.${stockCode}`; // 沪市
    } else {
      return `0.${stockCode}`; // 深市
    }
  }

  async saveStockData(data) {
    try {
      const stockData = new StockData({
        ...data,
        timestamp: data.timestamp || new Date()
      });
      
      await stockData.save();
      return stockData;
    } catch (error) {
      console.error('保存股票数据失败:', error);
      throw error;
    }
  }

  async fetchAndSaveStockData(stockCode) {
    try {
      const data = await this.fetchStockData(stockCode);
      return await this.saveStockData(data);
    } catch (error) {
      console.error(`获取并保存股票${stockCode}数据失败:`, error);
      throw error;
    }
  }

  async fetchBatchStockData(stockCodes) {
    const results = [];
    
    for (const stockCode of stockCodes) {
      try {
        const data = await this.fetchStockData(stockCode);
        results.push(data);
      } catch (error) {
        console.warn(`获取股票${stockCode}数据失败:`, error.message);
      }
    }
    
    return results;
  }
}

module.exports = new StockDataService();