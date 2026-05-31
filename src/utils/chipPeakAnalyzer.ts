import axios from 'axios';

// 筹码峰数据接口
export interface ChipPeakData {
  code: string;
  price: number;
  volume: number;
  percentage: number;
}

// 筹码峰分析结果接口
export interface ChipPeakAnalysis {
  code: string;
  supportLevel: number;      // 支撑位
  resistanceLevel: number;    // 阻力位
  chipConcentration: number;  // 筹码集中度（0-100）
  mainChipArea: number;       // 主要筹码区域
  chipPeaks: ChipPeakData[];  // 筹码峰数据
  timestamp: number;
}

// 筹码峰分析器
export class ChipPeakAnalyzer {
  private cache: Map<string, { data: ChipPeakAnalysis; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 缓存5分钟

  // 分析筹码峰
  async analyzeChipPeak(code: string): Promise<ChipPeakAnalysis> {
    // 检查缓存
    const cached = this.cache.get(code);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // 尝试从不同数据源获取筹码峰数据
      let chipPeakData: ChipPeakData[] = [];
      
      // 尝试数据源1: 东方财富
      try {
        chipPeakData = await this.getEastMoneyChipPeak(code);
      } catch (error) {
        console.warn(`从东方财富获取${code}筹码峰失败:`, error);
        // 尝试数据源2: 新浪财经
        try {
          chipPeakData = await this.getSinaChipPeak(code);
        } catch (error) {
          console.warn(`从新浪财经获取${code}筹码峰失败:`, error);
        }
      }

      // 分析筹码峰数据
      const analysis = this.calculateChipPeakAnalysis(code, chipPeakData);

      // 缓存结果
      this.cache.set(code, {
        data: analysis,
        timestamp: Date.now()
      });

      return analysis;
    } catch (error) {
      console.error(`分析${code}筹码峰失败:`, error);
      // 返回默认分析结果
      return this.getDefaultChipPeakAnalysis(code);
    }
  }

  // 从东方财富获取筹码峰数据
  private async getEastMoneyChipPeak(code: string): Promise<ChipPeakData[]> {
    const secid = code.startsWith('sh') ? `1.${code.slice(2)}` : `0.${code.slice(2)}`;
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f12,f14,f100,f101,f102,f103,f104,f105,f106,f107,f108,f109,f110,f111,f112,f113,f114,f115,f116,f117,f118,f119,f120,f121,f122,f123,f124,f125,f126,f127,f128,f129,f130,f131,f132,f133,f134,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f150`;

    const response = await axios.get(url, {
      timeout: 3000
    });

    // 解析东方财富筹码峰数据
    const data = response.data as any;
    if (data && data.data) {
      const chipData: ChipPeakData[] = [];
      // 尝试解析筹码数据字段
      const fields = ['f100', 'f101', 'f102', 'f103', 'f104', 'f105', 'f106', 'f107', 'f108', 'f109', 'f110'];
      for (let i = 0; i < fields.length; i += 2) {
        const priceField = fields[i];
        const volField = fields[i + 1];
        if (data.data[priceField] && data.data[volField]) {
          chipData.push({
            code,
            price: data.data[priceField],
            volume: data.data[volField],
            percentage: 0
          });
        }
      }
      return chipData;
    }

    return [];
  }

  // 从新浪财经获取筹码峰数据
  private async getSinaChipPeak(code: string): Promise<ChipPeakData[]> {
    const url = `http://hq.sinajs.cn/list=${code.startsWith('sh') ? 'sh' : 'sz'}${code.slice(2)}`;

    const response = await axios.get(url, {
      timeout: 3000
    });

    // 解析新浪财经数据
    // 新浪返回的是文本格式，这里返回空数组（筹码数据需要专门的API）
    return [];
  }

  // 计算筹码峰分析结果
  private calculateChipPeakAnalysis(code: string, chipPeaks: ChipPeakData[]): ChipPeakAnalysis {
    if (chipPeaks.length === 0) {
      return this.getDefaultChipPeakAnalysis(code);
    }

    // 计算筹码集中度
    let totalVolume = chipPeaks.reduce((sum, peak) => sum + peak.volume, 0);
    let topPeaks = chipPeaks
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
    let topVolume = topPeaks.reduce((sum, peak) => sum + peak.volume, 0);
    let chipConcentration = totalVolume > 0 ? (topVolume / totalVolume) * 100 : 0;

    // 计算主要筹码区域
    let mainChipArea = topPeaks.length > 0 ? 
      topPeaks.reduce((sum, peak) => sum + peak.price * peak.volume, 0) / topVolume : 
      0;

    // 计算支撑位和阻力位
    let supportLevel = chipPeaks[0].price;
    let resistanceLevel = chipPeaks[chipPeaks.length - 1].price;

    return {
      code,
      supportLevel,
      resistanceLevel,
      chipConcentration,
      mainChipArea,
      chipPeaks,
      timestamp: Date.now()
    };
  }

  // 获取默认筹码峰分析结果
  private getDefaultChipPeakAnalysis(code: string): ChipPeakAnalysis {
    return {
      code,
      supportLevel: 0,
      resistanceLevel: 0,
      chipConcentration: 50,
      mainChipArea: 0,
      chipPeaks: [],
      timestamp: Date.now()
    };
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 获取缓存状态
  getCacheStatus(): { size: number } {
    return {
      size: this.cache.size
    };
  }
}

// 导出单例
export const chipPeakAnalyzer = new ChipPeakAnalyzer();
export const getChipPeakAnalyzer = () => chipPeakAnalyzer;